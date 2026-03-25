const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Session = sequelize.define('Session', {
    token: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    expiresAt: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    createdAt: { 
      type: DataTypes.DATE, 
      allowNull: false,
      defaultValue: DataTypes.NOW 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    }
  });

  // associations
  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
  };

  return Session;
};

