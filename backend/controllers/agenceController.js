const Agence = require('../models/agence');

// Create a new Agence
exports.createAgence = async (req, res) => {
    const { nom, adresse, telephone, latitude, longitude } = req.body;
    const status = true;
    try {
        const newAgence = await Agence.create({
            nom,
            adresse,
            telephone,
            latitude,
            longitude,
            status
        });
        res.status(201).json(newAgence);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'agence', error });
    }
};

// Get all Agences
exports.getAllAgences = async (req, res) => {
    try {
        const agences = await Agence.findAll();
        res.status(200).json(agences);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des agences', error });
    }
};

// Get a single Agence by ID
exports.getAgenceById = async (req, res) => {
    const { id } = req.params;

    try {
        const agence = await Agence.findByPk(id);
        if (!agence) {
            return res.status(404).json({ message: 'Agence non trouvée' });
        }
        res.status(200).json(agence);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'agence', error });
    }
};

// Update an Agence
exports.updateAgence = async (req, res) => {
    const { id } = req.params;
    const { nom, adresse, telephone, latitude, longitude, status } = req.body;

    try {
        const agence = await Agence.findByPk(id);
        if (!agence) {
            return res.status(404).json({ message: 'Agence non trouvée' });
        }

        agence.nom = nom || agence.nom;
        agence.adresse = adresse || agence.adresse;
        agence.telephone = telephone || agence.telephone;
        agence.latitude = latitude || agence.latitude;
        agence.longitude = longitude || agence.longitude;
        agence.status = status !== undefined ? status : agence.status;

        await agence.save();
        res.status(200).json(agence);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'agence', error });
    }
};

// Delete an Agence
exports.deleteAgence = async (req, res) => {
    const { id } = req.params;

    try {
        const agence = await Agence.findByPk(id);
        if (!agence) {
            return res.status(404).json({ message: 'Agence non trouvée' });
        }

        await agence.destroy();
        res.status(200).json({ message: 'Agence supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'agence', error });
    }
};
