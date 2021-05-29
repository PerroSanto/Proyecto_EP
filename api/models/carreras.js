'use strict';
module.exports = (sequelize, DataTypes) => {
  const carreras = sequelize.define('carreras', {
    nombre: DataTypes.STRING,
    id_instituto: DataTypes.INTEGER
  }, {});
  carreras.associate = function(models) {
    // associations can be defined here
     carreras.belongsTo(models.institutos// modelo al que pertenece
      ,{
        as : 'Instituto-Relacionado',  // nombre de mi relacion
        foreignKey: 'id_instituto'     // campo con el que voy a igualar
      })
    ///////////
  };
  return carreras;
};