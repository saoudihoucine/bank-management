const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Agence = sequelize.define('Agence', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    adresse: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telephone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    latitude: {
        type: DataTypes.STRING,
        allowNull: false
    }
    , longitude: {
        type: DataTypes.STRING,
        allowNull: false
    },

    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});

module.exports = Agence;
