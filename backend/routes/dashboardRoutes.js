const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/admin/dashboard/client/:clientId', dashboardController.calculateClientFinancials);

module.exports = router;
