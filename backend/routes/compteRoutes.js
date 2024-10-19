// routes/compteRoutes.js
const express = require('express');
const { getAllComptes, createCompte, getAllComptesByClient, getCompteById } = require('../controllers/compteController');

const router = express.Router();

// Routes pour les comptes
router.get('/comptes', getAllComptes);
router.post('/comptes', createCompte);
router.get('/comptes/client/:clientId', getAllComptesByClient);
router.get('/comptes/details/:rib', getCompteById);

module.exports = router;
