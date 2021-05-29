var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res,next) => {

  models.alumnos.findAll({attributes: ["id","nombre","apellido","id_carrera"],
      
      /////////se agrega la asociacion 
      include:[{as:'Carrera-Relacionada', model:models.carreras, attributes: ["id","nombre","id_instituto"]}]
      ////////////////////////////////

    }).then(alumnos => res.send(alumnos)).catch(error => { return next(error)});
});

router.post("/", (req, res) => {
  models.alumnos
    .create({ nombre: req.body.nombre,apellido: req.body.apellido,id_carrera:req.body.id_carrera })
    .then(alumnos => res.status(201).send({ id: alumnos.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra materia con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumnos
    .findOne({
      attributes: ["id", "nombre", "apellido", "id_carrera"],
      where: { id }
    })
    .then(alumnos => (alumnos ? onSuccess(alumnos) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findAlumno(req.params.id, {
    onSuccess: alumnos => res.send(alumnos),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = alumnos =>
  alumnos
      //Metemos esta linea para poder hacer put de nombre o id_carrera, indistintamente.
      //.update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .update({ nombre: req.body.nombre,apellido: req.body.apellido,id_carrera: req.body.id_carrera  }, { fields: ["nombre","apellido","id_carrera"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = alumnos =>
  alumnos
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;