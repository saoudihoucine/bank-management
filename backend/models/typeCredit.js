const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const TypeCredit = sequelize.define('TypeCredit', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = TypeCredit;
