const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('my_auth_app', 'admin', '12345678', {
  host: 'database-1.ctogw60a0eux.ap-southeast-2.rds.amazonaws.com',
  dialect: 'mysql',
  port: 3306,
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
