const {Schema,model} = require('mongoose');
const FanbSchema = new Schema({
    nacionalidad: {type: String},
    cedula: {type: String},
    primer_apellido: {type: String},
    segundo_apellido: {type: String},
    primer_nombre: {type: String},
    segundo_nombre: {type: String},
    cod_centro: {type: String},
}, {collection: 'fanb'});

module.exports = {
    fanb: model('fanb', FanbSchema),
}