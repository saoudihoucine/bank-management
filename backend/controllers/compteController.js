const Compte = require('../models/compte');
const Client = require('../models/client');
const Agence = require('../models/agence'); // Import Agence model
const Category = require('../models/categorie');

// Function to generate the next account number
const generateAccountNumber = async () => {
    const latestCompte = await Compte.findOne({
        order: [['createdAt', 'DESC']]
    });

    if (!latestCompte) {
        return '00000000001'; // Start account number if none exists
    }

    const latestAccountNumber = parseInt(latestCompte.rib.slice(10, 21), 10);
    const newAccountNumber = (latestAccountNumber + 1).toString().padStart(11, '0');
    
    return newAccountNumber;
};

// Controller to create a new account
const createCompte = async (req, res) => {
    const { clientId, categoryCode } = req.body;

    try {
        // Ensure the client exists
        const client = await Client.findByPk(clientId, {
            include: { model: Agence, as: 'agence' } // Include associated Agence
        });
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        // Ensure the category exists
        const category = await Category.findOne({ where: { code: categoryCode } });
        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        // Get the branchCode from the client's Agence
        const branchCode = client.agenceId.toString().padStart(3, '0') ? client.agence.id.toString().padStart(3, '0') : null;
        if (!branchCode) {
            return res.status(400).json({ message: 'Agence non trouvée pour ce client' });
        }

        // Generate the account number
        const bankCode = '12'; // Example bank code
        const accountNumber = await generateAccountNumber();

        // Generate the RIB by concatenating bankCode, branchCode, accountNumber, and categoryCode
        const rib = `${bankCode}${branchCode}${categoryCode}${accountNumber}`;
        const categoryId = categoryCode;

        // Create the account with the generated RIB
        const compte = await Compte.create({
            clientId,
            rib,
            categoryId
        });

        res.status(201).json(compte);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
        console.log(error)

    }
};

// Controller to get all accounts
const getAllComptes = async (req, res) => {
    try {
        const comptes = await Compte.findAll({
            include: [
                {
                    model: Client,
                    as: 'client',
                    include: [{model: Agence,as: 'agence'}]
                },
                { model: Category, as: 'category' }
            ]
        });
        res.status(200).json(comptes);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
        console.log(error)
    }
};

const getAllComptesByClient = async (req, res) => {
    const { clientId } = req.params;
    try {
        const comptes = await Compte.findAll({
            where: { clientId: clientId },
            include: [
                {
                    model: Client,
                    as: 'client',
                    include: [{model: Agence,as: 'agence'}]
                },
                { model: Category, as: 'category' }
            ]
        });
        if (!comptes) {
            return res.status(404).json({ message: 'Compte not found for this client' });
        }
        res.status(200).json(comptes);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
        console.log(error)
    }
};

const getCompteById = async (req, res) => {
    const { rib } = req.params;

    try {
        const compte = await Compte.findOne({
            where: { rib: rib }, // Find compte by rib
            include: [
                {
                    model: Client,
                    as: 'client'
                },
                {
                    model: Category,
                    as: 'category'
                }
            ]
        });

        if (!compte) {
            return res.status(404).json({ message: 'Compte not found' });
        }

        res.status(200).json(compte);
    } catch (error) {
        console.error('Error retrieving compte:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    createCompte,
    getAllComptes,
    getAllComptesByClient,
    getCompteById
};
