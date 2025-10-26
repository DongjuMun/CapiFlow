const Invoice = require('../models/invoice.model');
const db = require('../utils/db')

exports.get_dashboard = async (req, res, nxt) => {
    try {
        const facturas = await Invoice.fetchAll();
        res.render('investor_dashboard', { facturas });
    } catch (error) {
        res.status(500).send("Error loading test");
    }
}

exports.get_marketplace = async (req, res, nxt) => {
    try {
        const invoices = await Invoice.fetchAllInvoices();
        res.render('investor_marketplace', {
            invoices
        });
    } catch (error) {
        res.status(500).send("Error loading marketplace");
    }
}

exports.post_marketplace = async (req, res, nxt) => {
    const { currentSMEId,
            currentInvestorId,
            currentProductTotal,
            earnings2, 
            inputValue } = req.body;
    console.log(req.body);
    try {
        if (currentProductTotal > 0) {
            console.log('Hello');
            // SME
            await db.query('UPDATE "user" SET balance = balance + $1 WHERE user_id = $2', [earnings2, currentSMEId]);
            // Client
            await db.query('UPDATE "user" SET balance = balance - $1 WHERE user_id = $2', [currentProductTotal, currentInvestorId]);
            
            //await db.query('INSERT INTO "investorInvoice" (investorinvoice_id, investor_id, invoice_id, perchaseRate) VALUES ($1)', [currentInvestorId+currentSMEId, currentInvestorId]);
            return res.json({ success: true });
        } else {
            console.log('Hello12');
            return res.status(400).json({ success: false, message: 'Invalid purchase value' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false });
    }
}