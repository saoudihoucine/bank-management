const { Sequelize } = require('sequelize');
require('dotenv').config();

DB_HOST="localhost"
DB_NAME="banque_app"
DB_USER="root"
DB_PASSWORD=""
JWT_SECRET="JWT_SECRET"


const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    // logging: false

});

module.exports = sequelize;
