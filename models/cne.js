const {Schema,model} = require('mongoose');
const CneSchema = new Schema({
    nacionalidad: {type: String},
    cedula: {type: String},
    primer_apellido: {type: String},
    segundo_apellido: {type: String},
    primer_nombre: {type: String},
    segundo_nombre: {type: String},
    cod_centro: {type: String},
}, {collection: 'cne'});

const CentrosOldSchema = new Schema({
    codigo: {type: String},
    nombre: {type: String},
    direccion: {type: String},
    cod_nuevi: {type: String}
}, {collection: 'cne_centros_old'});

const CentrosNewSchema = new Schema({
    CODIGO: {type: String},
    NOMBRE: {type: String},
    DIRECCION: {type: String},
    REDI: {type: String},
    ZODI: {type: String},
    ESTADO: {type: String},
    MUNICIPIO: {type: String},
    PARROQUIA: {type: String},
    COORDENADAS: {type: {type: String, enum: ["Point"]}}
}, {collection: 'cne_centros'});

const InfocnesSchema = new Schema({
    cedula: {type: String},
    nombre: {type: String},
    estado: {type: String},
    municipio: {type: String},
    parroquia: {type: String},
    centro: {type: String},
    direccion: {type: String},
}, {collection: 'infocnes'});

module.exports = {
    cne: model('cne', CneSchema),
    centros_new: model('cne_centros', CentrosNewSchema),
    centros_old: model('cne_centros_old', CentrosOldSchema),
    infocnes: model('infocnes', InfocnesSchema)
}