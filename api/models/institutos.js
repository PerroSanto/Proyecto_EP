'use strict';
module.exports = (sequelize, DataTypes) => {
  const institutos = sequelize.define('institutos', {
    nombre: DataTypes.STRING
  }, {});
  institutos.associate = function(models) {
    // associations can be defined here
  };
  return institutos;
};