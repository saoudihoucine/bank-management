const express = require('express');
const router = express.Router();
const demandeCreditController = require('../controllers/demandeCreditController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // Configuration du stockage des fichiers

// Route pour créer une demande de crédit
router.post('/credit/demandes-credit', demandeCreditController.createDemandeCredit);

// Route pour ajouter des documents à une demande de crédit
router.post('/credit/:demandeCreditId/documents', upload.array('documents'), demandeCreditController.uploadDocuments);

// Route pour ajouter un validateur et une décision
router.post('/credit/:demandeCreditId/validateurs', demandeCreditController.addValidatorDecision);

// Route pour obtenir toutes les demandes de crédit d'un client
router.get('/credit/client/:clientId', demandeCreditController.getDemandesCreditByClient);

router.get('/credit/:creditId', demandeCreditController.getDemandesCreditDetails);

router.post('/credit/validateCredit', demandeCreditController.validateDemandeCredit);

router.post('/credit/simulateCredit', demandeCreditController.simulateCredit);

router.get('/credit/', demandeCreditController.getDemandesAllCredit);

module.exports = router;
