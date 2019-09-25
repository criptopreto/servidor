const {Schema,model} = require('mongoose');
const SuscriptorSchema = new Schema({
    NUMERO: {type:String},
    COMPLETO: {type: String},
    CEDULA: {type: String},
    ESTADO: {type: String},
    MUNICIPIO: {type: String},
    NOMBRES: {type: String},
    APELLIDOS: {type: String}
});

module.exports = model('suscriptores', SuscriptorSchema);