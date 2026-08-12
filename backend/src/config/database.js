const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

module.exports = sequelize;
