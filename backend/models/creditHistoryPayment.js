const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const DemandeCredit = require('./DemandeCredit');

const HistoryPayment = sequelize.define('HistoryPayment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    monthlyPayment: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dueDatePayment: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statut: {
        type: DataTypes.ENUM('Not Paid', 'Paid'),
        defaultValue: 'Not Paid'
    }
}, {
    tableName: 'HistoryPayment', // Nom de la table
    timestamps: true // Assure la création des colonnes createdAt et updatedAt
});

HistoryPayment.belongsTo(DemandeCredit, { foreignKey: 'creditId', as: 'credit' });

module.exports = HistoryPayment;
