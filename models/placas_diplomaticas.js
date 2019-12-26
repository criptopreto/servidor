const {Schema,model} = require('mongoose');
const PlacasDiplomaticas = new Schema({
    NUMERO: {type: String},
    DIPLOMATICO: {type: String},
}, {collection: 'placas_diplomaticas'});

module.exports = model('placas_diplomaticas', PlacasDiplomaticas);