'use strict';
module.exports = (sequelize, DataTypes) => {
  const alumnos = sequelize.define('alumnos', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  alumnos.associate = function(models) {
  //asociacion a carrera (pertenece a:)
  alumnos.belongsTo(models.carreras// modelo al que pertenece
    ,{
      as : 'Carrera-Relacionada',  // nombre de mi relacion
      foreignKey: 'id_carrera'     // campo con el que voy a igualar
     })
  };
  return alumnos;
};