const fs = require('fs');
const xml2js = require('xml2js');
const Invoice = require('../models/invoice.model');

exports.get_test = async (req, res, nxt) => {
    try {
        res.render('sme_test');
    } catch (error) {
        res.status(500).send("Error loading test");
    }
}

exports.get_invoices = async (req, res, nxt) => {
    try {
        const facturas = await Invoice.fetchAll();
        res.render('sme_invoices', { facturas });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error loading invoices");
    }
}

exports.get_dashboard = async (req, res) => {
    try {
      const facturas = await Invoice.fetchAll();
        res.render('sme_dashboard', { facturas: facturas });
      } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).render('error', { message: 'Error loading dashboard' });
    }
};

exports.post_invoices = async (req, res, next) => {
  try {
    // 1) Validar que haya archivo XML
    if (!req.file) {
      return res.status(400).send("No se recibió archivo XML");
    }

    // 2) Validar y obtener los días de pago
    const daysLeft = parseInt(req.body.paymentDays, 10);
    if (isNaN(daysLeft) || daysLeft < 0) {
      return res.status(400).send("El campo 'daysLeft' debe ser un número positivo");
    }

    const xmlPath = req.file.path;
    const xmlData = fs.readFileSync(xmlPath, 'utf8');

    // 3) Parsear el XML
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      attrkey: '$'
    });

    const result = await parser.parseStringPromise(xmlData);

    // 4) Obtener nodo comprobante
    const comprobante = result['cfdi:Comprobante'] || result['Comprobante'];
    if (!comprobante) {
      return res.status(400).send("XML no contiene nodo <cfdi:Comprobante>");
    }

    const attrs = comprobante.$ || {};
    const emisorNode = comprobante['cfdi:Emisor'] || comprobante['Emisor'] || {};
    const receptorNode = comprobante['cfdi:Receptor'] || comprobante['Receptor'] || {};
    const emisorAttrs = emisorNode.$ || {};
    const receptorAttrs = receptorNode.$ || {};

    // 5) Crear ID único tipo Serie-Folio
    const idFactura = `${attrs.Serie || 'S/N'}-${attrs.Folio || 'S/N'}`;

    // 6) Crear objeto factura
    const nuevaFactura = new Invoice({
      id: idFactura,
      fecha: attrs.Fecha || null,
      total: attrs.Total ? parseFloat(attrs.Total) : 0,
      subtotal: attrs.SubTotal ? parseFloat(attrs.SubTotal) : 0,
      tipoDeComprobante: attrs.TipoDeComprobante || null,
      formaPago: attrs.FormaPago || null,
      metodoPago: attrs.MetodoPago || null,
      lugarExpedicion: attrs.LugarExpedicion || null,
      emisorRfc: emisorAttrs.Rfc || null,
      emisorNombre: emisorAttrs.Nombre || null,
      receptorRfc: receptorAttrs.Rfc || null,
      receptorNombre: receptorAttrs.Nombre || null,
      validSAT: false,
      performanceRate: (Math.random() * 5).toFixed(2),
      daysLeft // ✅ agregado al modelo
    });

    // 7) Guardar en base de datos
    const facturaCreada = await nuevaFactura.save();

    console.log('Factura procesada:', nuevaFactura);

    // 8) Responder éxito
    res.status(201).json({
      message: 'Factura cargada exitosamente',
      factura: facturaCreada
    });

  } catch (error) {
    console.error('Error al procesar CFDI:', error);
    res.status(500).send("Error al agregar factura");
  } finally {
    // 9) Eliminar archivo temporal
    const xmlPath = req.file?.path;
    if (xmlPath) {
      fs.unlink(xmlPath, (err) => {
        if (err) {
          console.error("⚠️ No se pudo eliminar el archivo:", xmlPath, err);
        } else {
          console.log("🧹 Archivo eliminado:", xmlPath);
        }
      });
    }
  }
};