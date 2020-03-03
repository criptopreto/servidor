const {Schema,model} = require('mongoose');
const ConfiableSchema = new Schema({
    CEDULA: {type: String},
    NOMBRE: {type: String},
    CONSULTIVO: {type: String},
    DIPUTADOS:{type: String},
    PREPAROS:{type: String},
    RECHAZOS:{type: String},
    VALIDAS:{type: String},
    POSTREPARO:{type: String}
});

module.exports = model('confiable', ConfiableSchema);