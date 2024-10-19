// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Compte = require('./compte');


const Category = sequelize.define('Category', {
    code: {
        type: DataTypes.STRING(4),
        primaryKey: true,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Category;
