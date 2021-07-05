'use strict';
module.exports = (sequelize, DataTypes) => {
  const usuarios = sequelize.define('usuarios', {
    usuario: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  usuarios.associate = function(models) {
    // associations can be defined here
  };
  return usuarios;
};