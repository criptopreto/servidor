const {Schema,model} = require('mongoose');
const SaimeSchema = new Schema({
    cedula: {type: String},
    nombreCompleto: {type: String},
    fechaNacimiento: {type: String},
    paisNacimiento: {type: String},
    sexo: {type: String},
    foto: {type: Boolean},
    estadoCivil: {type: String},
    timestamp: {type: Date, default: Date.now}
}, {collection: 'saime'});

module.exports = {
    saime: model('saime', SaimeSchema),
}