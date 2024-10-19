const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Créer une transaction
router.post('/transactions', transactionController.createTransaction);

// Obtenir l'historique des transactions pour un compte
router.get('/transactions/:compteRib', transactionController.getTransactionHistory);

// Obtenir les détails d'une transaction spécifique
router.get('/transactions/detail/:id', transactionController.getTransactionDetail);

module.exports = router;
