var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res,next) => {

  models.materias.findAll({attributes: ["id","nombre","id_carrera"],
      
      /////////se agrega la asociacion 
      include:[{as:'Carrera-Relacionada', model:models.carreras, attributes: ["id","nombre", "id_instituto"]}]
      ////////////////////////////////

    }).then(materias => res.send(materias)).catch(error => { return next(error)});
});

router.post("/", (req, res) => {
  models.materias
    .create({ nombre: req.body.nombre,id_carrera:req.body.id_carrera })
    .then(materias => res.status(201).send({ id: materias.id }))
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

const findmateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materias
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(materias => (materias ? onSuccess(materias) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findmateria(req.params.id, {
    onSuccess: materias => res.send(materias),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = materias =>
    materias
      //Metemos esta linea para poder hacer put de nombre o id_carrera, indistintamente.
      //.update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .update({ nombre: req.body.nombre, id_carrera: req.body.id_carrera  }, { fields: ["nombre", "id_carrera"] })
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
    findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = materias =>
    materias
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
