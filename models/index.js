if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'my_auth_app',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
  }
);

const User = require('./user')(sequelize);
const Profile = require('./profile')(sequelize);
const Session = require('./session')(sequelize);

// Model registry and association hookups
const models = { User, Profile, Session };
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
