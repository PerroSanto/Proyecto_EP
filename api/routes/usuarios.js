var express = require("express");
var router = express.Router();
var models = require("../models");
var bcrypt = require('bcrypt');
var fetch = require('node-fetch')
const usuarios = require("../models/usuarios");

//Creamos un usuario
router.post("/signup", async (req, res) => {
  //Nos traemos el usuario desde el body
  const usuario = await req.body.usuario;
  const password = await req.body.password; 

  //Obtenemos el largo de la password
  const passwordLength = password.length;

  //Con bcrypt generamos el salt y hasheamos la contraseña.
  const salt = await bcrypt.genSalt()
  const hashPassword = await bcrypt.hash(password, salt);

  //Consultamos la API para validar que el formato y dominio del mail es valido.
  const APIkey = '582bea147cb424edc08b9909583659aa'
  const api = await fetch (`http://apilayer.net/api/check?access_key=${APIkey}&email=${usuario}`);
  const apiJSON = await api.json();
  const usuarioValido = await apiJSON.format_valid
  const smtpValido = await apiJSON.smtp_check

//Luego de algunas validaciones insertamos el usuario en la tabla o devolvemos un error.
if (usuarioValido && smtpValido && passwordLength > 6){
  models.usuarios
    .create({ 
        usuario: usuario,
        password: hashPassword})   
    .then(usuarios => res.status(201)
    .send({ id: usuarios.id }))
    .catch(error => {
      //El usuario es unico y esta definido en el modelo
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: el usuario ya existe')
      }
      else {
        res.sendStatus(500)
      }
    });
  }else {
    res.status(400).send('Bad request: el usuario o la contraseña no son validos')
  }
});

//Consultamos un usuario
router.post("/signin", async (req, res) => {
  //Nos traemos el usuario desde el body
  const usuario = await req.body.usuario;
  const password = await req.body.password;  

  //Buscamos si existe el usuario en la base
  const findUsuario =  await models.usuarios.findOne({ where: { usuario: usuario } });

  //Si el usuario existe validamos, sino devolvemos error
  if (findUsuario !== null){
    //Si el hash de la password matchea con la que paso el usuario damos ok, sino error.
    if (await bcrypt.compare(password, findUsuario.password)){
      res.status(200).send('OK');
    }else{
      res.status(500).send('Usuario o password invalidos')
    }
  }else {
    res.status(500).send('Debe especificar usuario y password')
  }
  });

module.exports = router;
