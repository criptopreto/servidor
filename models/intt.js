const {Schema,model} = require('mongoose');
const PersonaIntt = new Schema({
    cedula: {type: String},
    vehiculos: [VehiculosInttSchema],
    licencias: [LicenciaInttSchema],
    multas_intt: {type: String},
    multas_pnb: {type: String},
    creado_por: {type: String},
    creado_en: {type: String},
}, {collection: 'persona_intt'});

const VehiculosInttSchema = new Schema({
    cod_centro: {type: String},
    nombre_centro: {type: String},
    direccion_centro: {type: String},
}, {collection: 'cne_centros'});

const LicenciaInttSchema = new Schema({
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