// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Agence = require('./agence');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false,
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
    
    role: {
        type: DataTypes.ENUM('Admin', 'ChargeClientele', 'DirecteurFinancement'),
        allowNull: false
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true  
    }
});


User.belongsTo(Agence, { foreignKey: 'agenceId', as: 'agence' });


// User.belongsTo(Agence, {
//     foreignKey: 'agenceId',
//     as: 'agence',
//     allowNull: true,
//     constraints: false,
//     onDelete: 'SET NULL',
//     scope: {
//         role: 'ChargeClientele'
//     }
// });

module.exports = User;
