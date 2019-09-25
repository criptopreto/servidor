const {Schema,model} = require('mongoose');
const BtsSchema = new Schema({
    REGION: {type: String},
    CELLID: {type: String},
    NOMBRE_SECTOR: {type: String},
    NOMBRE: {type: String},
    SECTOR: {type: String},
    LONGITUD: {type: String},
    LATITUD: {type: String},
    AZIMUT: {type: String},
    DELECTICO: {type: String},
    DMECANICO: {type: String},
    BCCH: {type: String},
    BSC: {type: String},
    ESTADO: {type: String},
    MUNICIPIO: {type: String},
    MERCADO: {type: String},
    DIRECCION: {type: String},
    LONGITUDGM: {type: String},
    LATITUDGM: {type: String},
    ALTURA: {type: String},
    CODRF: {type: String},
    LAC: {type: String},
    OBJETIVO: {type: String},
    PARROQUIA: {type: String},
    RADIOMAPA: {type: String},
    COMPANY: {type: String}
}, {collection: 'bts'});

module.exports = model('bts', BtsSchema);