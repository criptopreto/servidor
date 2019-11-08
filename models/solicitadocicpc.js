const {Schema,model} = require('mongoose');
const SolcicpcSchema = new Schema({
    PRIMER_NOMBRE: {type: String},
    SEGUNDO_NOMBRE: {type: String},
    PRIMER_APELLIDO: {type: String},
    SEGUNDO_APELLIDO: {type: String},
    COD_CED: {type: String},
    CEDULA: {type: String},
    INDOCUMENTADO: {type: String},
    ACTIVO: {type: String},
    FECHA_NACIMIENTO: {type: String},
    PASAPORTE: {type: String},
    EDAD: {type: String},
    OBSERVACIONES: {type: String},
    COD_ESTADO: {type: String},
    SEXO: {type: String},
    COD_RAZON_ESTADO: {type: String},
    ESTADO_CIVIL: {type: String},
    RAZON_ESTADO: {type: String},
    OFICIO_ACTA_PROCESAL: {type: String},
    ESTADO_PERSONA: {type: String},
    RAZON_PERSONA: {type: String}
}, {collection: 'solcicpc'});

module.exports = model('solcicpc', SolcicpcSchema);