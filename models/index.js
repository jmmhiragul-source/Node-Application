const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('my_auth_app', 'root', '12345678', {
  host: 'localhost',
  dialect: 'mysql',
});

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
