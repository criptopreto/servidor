'use strict'

const bcrypt    = require('bcrypt');
const passport  = require('passport');
const jwt       = require('jsonwebtoken');
const uuid      = require('uuid');
const pool      = require('../database.mysql');

let controller = {
    register: (req, res) =>{
        console.log(req.body);
        if(!req.body.username || !req.body.password || !req.body.correo) {
            res.json({error: true, mensaje: "Datos inválidos"});
            return
        }
        pool.query("SELECT * from usuario where username='" + req.body.username + "'", (err, result)=>{
            if(err) res.json({error: true, mensaje:"Error con la base de datos"});
            if(result.length > 0){
                console.log("Existe")
                res.json({error: true, mensaje: "El usuario existe"});
            }else{
                var hash = bcrypt.hashSync(req.body.password, parseInt(process.env.BCRYPT_ROUNDS));
                var usuario = {
                    idusuario: uuid(),
                    username: req.body.username,
                    nombres: req.body.nombres,
                    apellidos: req.body.apellidos,
                    password: hash,
                    correo: req.body.correo,
                    sexo: req.body.sexo,
                    rol: req.body.rol,
                    estado: req.body.estado,
                    imagen: req.body.imagen
                }
                pool.query('INSERT INTO usuario SET ?', usuario, (err, rows, fields)=>{
                    console.log(err)
                    err ? res.json({error: true, mensaje: "Error en la base de datos"}) : res.json({error: false, mensaje: "Usuario Registrado"});
                });
                
            }
        })
    },
    login: (req, res) =>{
        passport.authenticate("local", {session: false}, (error, user)=>{
            if(error|| !user){
                res.json({error: {mensaje: "Usuario o contraseña incorrectos."}});
            }else{
                let exp = parseInt(Date.now() / 1000) + parseInt(process.env.JWT_LIFETIME)
                const payload = {
                    sub: user.idusuario,
                    exp,
                    username: user.username
                }

                const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET, {algorithm: process.env.JWT_ALGORITHMS});
                res.json({  token });
            }
        })(req,res);
    },
    actual: (req, res)=>{
        res.json({usuario: req.user, token: req.token})
    }
}

module.exports = controller;