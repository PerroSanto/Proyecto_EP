var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  models.institutos
    .findAndCountAll({
      attributes: ["id", "nombre"],
    })
    .then(institutos => res.send(institutos))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.institutos
    .create({ nombre: req.body.nombre })
    .then(institutos => res.status(201).send({ id: institutos.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findInstituto = (id, { onSuccess, onNotFound, onError }) => {
  models.institutos
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(institutos => (institutos ? onSuccess(institutos) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findInstituto(req.params.id, {
    onSuccess: institutos => res.send(institutos),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = institutos =>
    institutos
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findInstituto(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = institutos =>
    institutos
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findInstituto(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;