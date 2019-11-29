'use strict'
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var UserSchema = Schema({
    username: {type: String},
    nombres: {type: String},
    apellidos: {type: String},
    password: {type: String},
    correo: {type: String},
    sexo: {type: String},
    rol: {type: String},
    estado: {type: String},
    imagen: {type: String},
    creado_en: {type: Date, default: Date.now},
    modificado_en: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', UserSchema, "users");