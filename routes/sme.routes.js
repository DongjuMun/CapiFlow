const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const sme_controller = require('../controllers/sme.controller');

router.get('/', sme_controller.get_test);

router.get('/invoices', sme_controller.get_invoices);
router.post('/invoices/add', upload.single('cfdiFile'), sme_controller.post_invoices);

router.get('/dashboard', sme_controller.get_dashboard);


module.exports = router;