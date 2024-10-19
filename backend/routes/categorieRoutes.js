const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categorieController');

// Route to create a new category
router.post('/categories', categoryController.createCategory);

// Route to get all categories
router.get('/categories', categoryController.getAllCategories);

// Route to get a category by code
router.get('/categories/:code', categoryController.getCategoryByCode);

// Route to update a category by code
router.put('/categories/:code', categoryController.updateCategory);

// Route to delete a category by code
router.delete('/categories/:code', categoryController.deleteCategory);

module.exports = router;
