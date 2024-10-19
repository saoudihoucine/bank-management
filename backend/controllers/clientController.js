const Client = require('../models/client');
const Agence = require('../models/agence');
const bcrypt = require('bcrypt');

// Create a new Client
exports.createClient = async (req, res) => {
    const { id, nom, prenom, email,adresse, password, agenceId } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(adresse)
        const newClient = await Client.create({
            id,
            nom,
            prenom,
            email,
            password: hashedPassword,
            adresse,
            agenceId
        });
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du client', error });
    }
};

// Get all Clients
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.findAll({ include: { model: Agence, as: 'agence' } });
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des clients', error });
    }
};

// Get a Client by ID
exports.getClientById = async (req, res) => {
    const { id } = req.params;
    try {
        const client = await Client.findOne({ where: { id }, include: { model: Agence, as: 'agence' } });
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du client', error });
    }
};

// Update a Client
exports.updateClient = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, agenceId,adresse, active } = req.body;
    try {
        const client = await Client.findOne({ where: { id } });
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        await client.update({
            nom,
            prenom,
            email,
            agenceId,
            adresse,
            active
        });
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du client', error });
    }
};

// Delete a Client
exports.deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const client = await Client.findOne({ where: { id } });
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        await client.destroy();
        res.status(200).json({ message: 'Client supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du client', error });
    }
};
