const express = require('express');
const clientController = require('../controllers/clientController');

const router = express.Router();

// Create a new Client
router.post('/clients', clientController.createClient);

// Get all Clients
router.get('/clients', clientController.getAllClients);

// Get a Client by ID
router.get('/admin/clients/:id', clientController.getClientById);

// Update a Client
router.put('/clients/:id', clientController.updateClient);

// Delete a Client
router.delete('/clients/:id', clientController.deleteClient);

module.exports = router;
