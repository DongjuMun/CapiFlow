const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/user.controller');

router.get('/login', user_controller.get_login);

module.exports = router;