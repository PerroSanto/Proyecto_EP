var express = require("express");
var router = express.Router();
var models = require("../models");
var validador = require("./validador");

router.get("/", validador.validateToken, (req, res,next) => {

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

  models.materias.findAndCountAll({
    limit: limite,
    offset: pagina * limite,
    attributes: ["id","nombre","id_carrera"],
      
      /////////se agrega la asociacion 
      include:[{as:'Carrera-Relacionada', model:models.carreras, attributes: ["id","nombre", "id_instituto"]}]
      ////////////////////////////////

    }).then(materias => res.send({
      contenido: materias.rows,
      totalPaginas: Math.ceil(materias.count / limite)
      }))
    
    .catch(error => { return next(error)});
});

router.post("/", validador.validateToken, (req, res) => {
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
      where: { id },
      /////////se agrega la asociacion 
      include:[{as:'Carrera-Relacionada', model:models.carreras, attributes: ["id","nombre", "id_instituto"]}]
      ////////////////////////////////
    })
    .then(materias => (materias ? onSuccess(materias) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", validador.validateToken, (req, res) => {
  findmateria(req.params.id, {
    onSuccess: materias => res.send(materias),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", validador.validateToken, (req, res) => {
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

router.delete("/:id", validador.validateToken, (req, res) => {
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
