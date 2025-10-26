const pool = require('../utils/db')

module.exports = class Invoice {
    constructor({id, fecha, total, subtotal, tipoDeComprobante, formaPago, metodoPago, lugarExpedicion, emisorRfc, emisorNombre, receptorRfc, receptorNombre, validSat = false, performanceRate = null, sme_id, days_left
    }) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.subtotal = subtotal;
        this.tipoDeComprobante = tipoDeComprobante;
        this.formaPago = formaPago;
        this.metodoPago = metodoPago;
        this.lugarExpedicion = lugarExpedicion;
        this.emisorRfc = emisorRfc;
        this.emisorNombre = emisorNombre;
        this.receptorRfc = receptorRfc;
        this.receptorNombre = receptorNombre;
        this.validSat = validSat;
        this.performanceRate = performanceRate;
        this.sme_id = sme_id;
        this.daysLeft = daysLeft;
    }

    // Método para obtener todas las facturas con ciertos campos
    static async fetchAll() {
        const query = `SELECT i.id, i.total, i."receptorNombre", i."performanceRate", i.days_left, COALESCE(SUM(inv."perchaseRate"), 0) AS total_perchase_rate 
        FROM invoice i LEFT JOIN "investorInvoice" inv ON i.id = inv.invoice_id GROUP BY i.id, i.total, i."receptorNombre", i."performanceRate";`;
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw error;
        }
    }

        // Método para obtener todas las facturas con ciertos campos
    static async fetchAllInvoices() {
        const query = `
            SELECT 
                i.id, 
                i.fecha, 
                i.total, 
                i."emisorRfc", 
                i."emisorNombre", 
                i."receptorRfc", 
                c.category, 
                i.sme_id, 
                i.days_left, 
                i."performanceRate",  
                u."razonSocial",
                (
                    SELECT COALESCE(SUM(ii."perchaseRate"), 0)
                    FROM "investorInvoice" ii
                    WHERE ii.invoice_id = i.id
                ) AS purchase_rate
            FROM invoice i
            JOIN "user" u ON i.sme_id = u.user_id
            JOIN client c ON c.id = i."receptorRfc";
        ;`;
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw error;
        }
    }

    // Método para guardar la factura en la DB
    async save() {
        const query = `
            INSERT INTO public.invoice (
                id, fecha, total, subtotal, "tipoDeComprobante", "formaPago", 
                "metodoPago", "lugarExpedicion", "emisorRfc", "emisorNombre", 
                "receptorRfc", "receptorNombre", "validSat", "performanceRate", "days_left"
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            )
            RETURNING *
        `;
        const values = [
            this.id,
            this.fecha,
            this.total,
            this.subtotal,
            this.tipoDeComprobante,
            this.formaPago,
            this.metodoPago,
            this.lugarExpedicion,
            this.emisorRfc,
            this.emisorNombre,
            this.receptorRfc,
            this.receptorNombre,
            this.validSat,
            this.performanceRate,
            this.daysLeft
        ];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error saving invoice:', error);
            throw error;
        }
    }
};
