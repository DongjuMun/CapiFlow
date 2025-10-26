const express = require('express');
const router = express.Router();

const investor_controller = require('../controllers/investor.controller');

router.get('/dashboard', investor_controller.get_dashboard);
router.get('/marketplace', investor_controller.get_marketplace);
router.post('/marketplace/add', investor_controller.post_marketplace);

module.exports = router;