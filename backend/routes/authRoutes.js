const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route pour la connexion
router.post('/login', authController.login);

// Route pour la récupération du mot de passe
router.post('/recover-password', authController.recoverPassword);

// Route pour réinitialiser le mot de passe
router.post('/reset-password', authController.resetPassword);

router.post('/profile', authController.profile);

module.exports = router;
