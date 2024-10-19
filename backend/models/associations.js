const Client = require('./client');
const Category = require('./categorie');
const Compte = require('./compte');

// Client-Compte Association
Client.hasMany(Compte, { foreignKey: 'clientId', as: 'comptes' });
Compte.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Category-Compte Association
Category.hasMany(Compte, { foreignKey: 'categoryId', as: 'comptes' });
Compte.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = { Client, Category, Compte };
