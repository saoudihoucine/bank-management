// routes/agenceRoutes.js
const express = require('express');
const router = express.Router();
const AgenceController = require('../controllers/agenceController');

// Route pour créer une agence
router.post('/admin/agences', AgenceController.createAgence);

// Route pour lire toutes les agences
router.get('/admin/agences', AgenceController.getAllAgences);

// Route pour lire une agence par ID
router.get('/admin/agences/:id', AgenceController.getAgenceById);

// Route pour mettre à jour une agence
router.put('/admin/agences/:id', AgenceController.updateAgence);

// Route pour supprimer une agence
router.delete('/admin/agences/:id', AgenceController.deleteAgence);

module.exports = router;
