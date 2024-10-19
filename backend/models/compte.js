const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Client = require('./client');
const Category = require('./categorie');

// Fonction pour générer le prochain numéro de compte


// Définir le modèle Compte
const Compte = sequelize.define('Compte', {
    rib: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
    },
    solde: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    }
});

Compte.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Compte.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });




module.exports = Compte;
