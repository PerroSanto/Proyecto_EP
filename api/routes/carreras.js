var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {

  const paginaComoNumero = Number.parseInt(req.query.pagina); /////parsea el parametro a numero
  const limiteComoNumero = Number.parseInt(req.query.limite);

  let pagina = 0;
  if(!Number.isNaN(paginaComoNumero) && paginaComoNumero > 0) {
      pagina = paginaComoNumero;
  };   ///////asegura que la pagina recibida sea un numero

  let limite = 30;
  if(!Number.isNaN(limiteComoNumero) && limiteComoNumero > 0 && limiteComoNumero < 10) {
     limite= limiteComoNumero;
  };

  models.carreras
    .findAndCountAll({
      limit: limite,
      offset: pagina * limite,
      attributes: ["id", "nombre", "id_instituto"],
      /////////se agrega la asociacion 
      include:[{as:'Instituto-Relacionado', model:models.institutos, attributes: ["id","nombre"]}]
      ////////////////////////////////
    
    //Devolvemos los registros y ademas elcalculo de la cantidad de paginas.
    }).then(carreras => res.send({
      contenido: carreras.rows,
      totalPaginas: Math.ceil(carreras.count / limite)
    })).catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.carreras
    .create({ nombre: req.body.nombre, id_instituto:req.body.id_instituto })
    .then(carreras => res.status(201).send({ id: carreras.id }))
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

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carreras
    .findOne({
      attributes: ["id", "nombre", "id_instituto"],
      where: { id },
      /////////se agrega la asociacion 
      include:[{as:'Instituto-Relacionado', model:models.institutos, attributes: ["id","nombre"]}]
      ////////////////////////////////
    })
    .then(carreras => (carreras ? onSuccess(carreras) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carreras => res.send(carreras),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = carreras =>
    carreras
      .update({ nombre: req.body.nombre, id_instituto: req.body.id_instituto }, { fields: ["nombre","id_instituto"] })
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
    findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = carreras =>
    carreras
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
