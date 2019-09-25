const {Schema,model} = require('mongoose');
const CoordenadasSchema = new Schema({
    latitud: {type: String},
    longitud: {type: String},
    username: {type: String},
    direccion: {type: String},
    fecha: {type: Date, default: Date.now}
}, {collection: 'coordenadas'});

module.exports = model('coordenadas', CoordenadasSchema);