const Category = require('../models/categorie');

// Controller to create a new category
const createCategory = async (req, res) => {
    const { code, description } = req.body;

    try {
        // Check if a category with the same code already exists
        const existingCategory = await Category.findOne({ where: { code } });
        if (existingCategory) {
            return res.status(400).json({ message: 'Une catégorie avec ce code existe déjà' });
        }

        // Create the new category
        const category = await Category.create({ code, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Controller to get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Controller to get a category by code
const getCategoryByCode = async (req, res) => {
    const { code } = req.params;

    try {
        const category = await Category.findByPk(code);
        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Controller to update a category
const updateCategory = async (req, res) => {
    const { code } = req.params;
    const { description } = req.body;

    try {
        const category = await Category.findByPk(code);
        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        category.description = description || category.description;
        await category.save();
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Controller to delete a category
const deleteCategory = async (req, res) => {
    const { code } = req.params;

    try {
        const category = await Category.findByPk(code);
        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        await category.destroy();
        res.status(200).json({ message: 'Catégorie supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryByCode,
    updateCategory,
    deleteCategory
};
