const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route pour créer un utilisateur
router.post('/admin/users', userController.createUser);
router.get('/admin/allUsers/:role', userController.getAllUsers);
router.put('/admin/update/:id', userController.updateUser);

module.exports = router;
