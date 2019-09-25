const {logBusqueda} = require('../models/audit');

const logPersonas = async ()=>{
    return await logBusqueda.find({tipo_busqueda: 2}).hint({$natural: -1}).limit(3).then(data=>{
        return data;
    }).catch(err=>{
        return err
    });
}

module.exports = logPersonas;