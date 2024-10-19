// models/transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Compte = require('./compte');
const Client = require('./client');
const User = require('./user');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('dépot', 'retrait', 'transfert'),
        allowNull: false
    },
    montant: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    motif: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transferRib: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// Associations
Transaction.belongsTo(Compte, { as: 'compte', foreignKey: 'compteRib' });
Transaction.belongsTo(User, { as: 'approuveParCharge', foreignKey: 'approuveParChargeId' });
Transaction.belongsTo(Client, { as: 'approuveParClient', foreignKey: 'approuveParClientId' });

module.exports = Transaction;
