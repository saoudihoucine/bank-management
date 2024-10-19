const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Agence = require('./agence');  // Importation de l'agence

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.STRING(8),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: {
                args: /^[0-9]{8}$/, // Validation pour 8 chiffres
                msg: 'L\'ID doit être une chaîne de 8 chiffres.'
            }
        }
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    adresse: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true  // Par défaut, l'utilisateur est actif
    }
});

// Relation avec l'Agence (Un client appartient à une seule agence)
Client.belongsTo(Agence, { foreignKey: 'agenceId', as: 'agence' });




module.exports = Client;
