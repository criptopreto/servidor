const {Schema,model} = require('mongoose');
const FirmaSchema = new Schema({
    CEDULA: {type: String}
});

module.exports = model('firmacontras', FirmaSchema);