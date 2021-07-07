var express = require("express");
var router = express.Router();
var models = require("../models");
var bcrypt = require('bcrypt');
var fetch = require('node-fetch')
var jwt = require('jsonwebtoken')
require('dotenv').config('./.env');
const APIkey = process.env.APIKEY;
const secret = process.env.SECRET;

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
  const api = await fetch (`http://apilayer.net/api/check?access_key=${APIkey}&email=${usuario}`);
  const apiJSON = await api.json();
  const usuarioValido = await apiJSON.format_valid
  const smtpValido = await apiJSON.smtp_check
  const minPasswordLength = 6

//Luego de algunas validaciones insertamos el usuario en la tabla o devolvemos un error.
if (usuarioValido && smtpValido && passwordLength >= minPasswordLength){
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
      
      //Aca se llama a la funcion para generar la apikey
      const accessToken = generateAccessToken(usuario);
      
      res.header('authotization', accessToken).json({
        message: 'Usuario autenticado',
        token: accessToken
      })
      console.log(accessToken)
    }else{
      res.status(500).send('Usuario o password invalidos')
    }
  }else {
    res.status(500).send('Debe especificar usuario y password validos')
  }

  function generateAccessToken(usuario){
    return jwt.sign(usuario, secret);
  }

  });

module.exports = router;
