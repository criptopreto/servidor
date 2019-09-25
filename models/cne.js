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

const CentrosSchema = new Schema({
    cod_centro: {type: String},
    nombre_centro: {type: String},
    direccion_centro: {type: String},
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
    centros: model('cne_centros', CentrosSchema),
    infocnes: model('infocnes', InfocnesSchema)
}