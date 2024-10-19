const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Client = require('./client');
const TypeCredit = require('./typeCredit');
const Compte = require('./compte');

const DemandeCredit = sequelize.define('DemandeCredit', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    montant: {
        type: DataTypes.STRING,
        allowNull: false
    },
    interet: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mensualites: {
        type: DataTypes.STRING,
        allowNull: false
    },

    totalMontant: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duree: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currentProfile: {
        type: DataTypes.STRING,
        allowNull: false
    },
    netSalary: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statut: {
        type: DataTypes.ENUM('en attente', 'en cours de traitement', 'approuvée', 'refusée',"avis favorable"),
        defaultValue: 'en attente'
    },
    paidStatut: {
        type: DataTypes.ENUM('Paid', 'Not Paid'),
        defaultValue: 'Not Paid'
    },
    documents: {
        type: DataTypes.STRING,  // Use BLOB to store binary files directly
        allowNull: true
    },
    validateurs: {
        type: DataTypes.TEXT, // Utilisez TEXT pour stocker des JSON en MariaDB/MySQL
        defaultValue: '[]' // Utilisez une chaîne vide pour initialiser
    }
}, {
    tableName: 'DemandeCredits', // Nom de la table
    timestamps: true // Assure la création des colonnes createdAt et updatedAt
});

DemandeCredit.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
DemandeCredit.belongsTo(TypeCredit, { foreignKey: 'typeCreditId', as: 'typeCredit' });
DemandeCredit.belongsTo(Compte, { foreignKey: 'rib', as: 'compte' });

module.exports = DemandeCredit;
