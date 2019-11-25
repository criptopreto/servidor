const {Schema,model} = require('mongoose');
const PaisesSchema = new Schema({
    NOMBRE: {type: String},
    NAME: {type: String},
    NOM: {type: String},
    ISO: {type: String},
    PCODE: {type: String},
}, {collection: 'paises'});

module.exports = {
    paises: model('paises', PaisesSchema),
}