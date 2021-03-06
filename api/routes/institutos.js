var express = require("express");
var router = express.Router();
var models = require("../models");
var validador = require("./validador");

router.get("/", validador.validateToken, (req, res, next) => {

  const paginaComoNumero = Number.parseInt(req.query.pagina); /////parsea el parametro a numero
  const limiteComoNumero = Number.parseInt(req.query.limite);

  let pagina = 0;
  if(!Number.isNaN(paginaComoNumero) && paginaComoNumero > 0) {
      pagina = paginaComoNumero;
  };   ///////asegura que la pagina recibida sea un numero

  let limite = 30;
  if(!Number.isNaN(limiteComoNumero) && limiteComoNumero > 0) {
     limite= limiteComoNumero;
  };

  models.institutos
    .findAndCountAll({
      limit: limite,
      offset: pagina * limite,
      attributes: ["id", "nombre"],
    })
    //Devolvemos los registros y ademas elcalculo de la cantidad de paginas.
  .then(institutos => res.send({
    contenido: institutos.rows,
    totalPaginas: Math.ceil(institutos.count / limite)
    }))
    .catch(() => res.sendStatus(500));
});

router.post("/", validador.validateToken, (req, res) => {
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

router.get("/:id", validador.validateToken, (req, res) => {
  findInstituto(req.params.id, {
    onSuccess: institutos => res.send(institutos),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", validador.validateToken, (req, res) => {
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

router.delete("/:id", validador.validateToken, (req, res) => {
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