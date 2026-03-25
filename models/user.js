const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
  });

  // hooks
  User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  // associations
  User.associate = (models) => {
    User.hasOne(models.Profile, {
      as: 'profile',
      foreignKey: { name: 'userId', allowNull: false },
      onDelete: 'CASCADE',
    });
  };

  return User;
};
