'use strict';
module.exports = (sequelize, DataTypes) => {
  const carreras = sequelize.define('carreras', {
    nombre: DataTypes.STRING
  }, {});
  carreras.associate = function(models) {
    // associations can be defined here
  };
  return carreras;
};