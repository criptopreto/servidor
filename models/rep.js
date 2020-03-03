const {Schema,model} = require('mongoose');
const RepSchema = new Schema({
    ESTADO: {type: String},
    MUNICIPIO: {type: String},
    PARROQUIA: {type: String},
    TIPO:{type: String},
    CEDULA:{type: String},
    NOMBRES:{type: String},
    CENTRO:{type: String},
    NUM:{type: String},
    SEXO:{type: String}
},{collection: 'rep'});

module.exports = model('rep', RepSchema);