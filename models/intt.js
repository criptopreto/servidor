const {Schema,model} = require('mongoose');
const LicenciaInttSchema = new Schema({
    NOMBRES: {type: String},
    APELLIDOS: {type: String},
    GRADO: {type: String},
    FECHA_ORIGINAL: {type: String},
    FECHA_RENOVACION: {type: String},
    CONDICION: {type: String}
}, {collection: 'licencia_intt'});

const PropietarioInttSchema = new Schema({
    n_identificacion: {type: String},
    dig_rif: {type: String},
    primer_apellido: {type: String},
    primer_nombre: {type: String},
    segundo_apellido: {type: String},
    segundo_nombre: {type: String},
    razon_social: {type: String},
    tipo_identificacion: {type: String}
}, {collection: 'propietario_intt'})

const VehiculoInttSchema = new Schema({
    PLACA: {type: String},
    PROPIETARIO: [PropietarioInttSchema],
    ANIA: {type: String},
    CATEGORIA: {type: String},
    CATEGORIA_ID: {type: String},
    CLASE: {type: String},
    CLASE_ID: {type: String},
    COD_DENUNCIA1: {type: String},
    COLOR_PRINCIPAL: {type: String},
    COLOR_PRINCIPAL_ID: {type: String},
    COLOR_SECUNDARIO: {type: String},
    COLOR_SECUNDARIO_ID: {type: String},
    D_STATUS: {type: String},
    ESTATUS: {type: String},
    FECHA_DENUNCIA1: {type: String},
    MARCA: {type: String},
    MARCA_ID: {type: String},
    MODELO: {type: String},
    NOMB_RAZON1: {type: String},
    NOMB_SITUACION1: {type: String},
    PLACA_DENUNCIA1: {type: String},
    RAZON_DENUNCIA1: {type: String},
    SERIAL_CARROCERIA: {type: String},
    SERIAL_MOTOR: {type: String},
    SITUACION_DENUNCIA1: {type: String},
    TIPO: {type: String},
    TIPO_ID: {type: String},
    USO: {type: String},
    USO_ID: {type: String}
}, {collection: 'vehiculo_intt'});

const PersonaIntt = new Schema({
    CEDULA: {type: String},
    vehiculos: [VehiculoInttSchema],
    licencias: [LicenciaInttSchema],
    multas_intt: {type: String},
    multas_pnb: {type: String},
    creado_por: {type: String},
    create_at: {type: Date, default: Date.now}
}, {collection: 'persona_intt'});

module.exports = {
    persona_intt: model('persona_intt', PersonaIntt),
    vehiculo_intt: model('vehiculo_intt', VehiculoInttSchema),
    licencia_intt: model('licencia_intt', LicenciaInttSchema),
    propietario_intt: model('propietario_intt', PropietarioInttSchema)
}