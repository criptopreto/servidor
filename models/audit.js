const {Schema,model} = require('mongoose');
const LogBusquedaSchema = new Schema({
    idusuario: {type: String},
    username: {type: String},
    nombres: {type: String},
    apellidos: {type: String},
    tipo_busqueda: {type: String},
    dato_buscado: {type: String},
    timestamp: {type: Date, default: Date.now}
}, {collection: 'logbusquedas'});

module.exports = {
    logBusqueda: model('logbusquedas', LogBusquedaSchema)
}