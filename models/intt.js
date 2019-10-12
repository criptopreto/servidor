const {Schema,model} = require('mongoose');
const PersonaIntt = new Schema({
    cedula: {type: String},
    vehiculos: [VehiculoInttSchema],
    licencias: [LicenciaInttSchema],
    multas_intt: {type: String},
    multas_pnb: {type: String},
    creado_por: {type: String},
    create_at: {type: Date, default: Date.now}
}, {collection: 'persona_intt'});

const VehiculoInttSchema = new Schema({
    placa: {type: String},
    propietario: [PropietarioInttSchema],
    year: {type: String},
    categoria: {type: String},
    categoria_id: {type: String},
    clase: {type: String},
    clase_id: {type: String},
    cod_denuncia: {type: String},
    color_principal: {type: String},
    color_principal_id: {type: String},
    color_secundario: {type: String},
    color_secundario_id: {type: String},
    d_status: {type: String},
    estatus: {type: String},
    fecha_denuncia: {type: String},
    marca: {type: String},
    marca_id: {type: String},
    modelo: {type: String},
    nomb_razon: {type: String},
    nomb_situacion: {type: String},
    placa_denuncia: {type: String},
    razon_denuncia: {type: String},
    serial_carrocieria: {type: String},
    serial_motor: {type: String},
    situacion_denuncia: {type: String},
    tipo: {type: String},
    tipo_id: {type: String},
    uso: {type: String},
    uso_id: {type: String}
}, {collection: 'vehiculo_intt'});

const LicenciaInttSchema = new Schema({
    nombres: {type: String},
    apellidos: {type: String},
    grado: {type: String},
    fecha_original: {type: String},
    fecha_renovacion: {type: String},
    condicion: {type: String}
}, {collection: 'licencia_intt'});

const PropietarioInttSchema = new Schema({
    
}, {collection: 'propietario_intt'})

module.exports = {
    persona_intt: model('persona_intt', PersonaIntt),
    vehiculo_intt: model('vehiculo_intt', VehiculoInttSchema),
    licencia_intt: model('licencia_intt', LicenciaInttSchema),
    propietario_intt: model('propietario_intt', PropietarioInttSchema)
}