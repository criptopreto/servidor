const {logBusqueda} = require('../models/audit');

const registrarLog = async data => {
    //data = {idusuario, tipo_busqueda, dato_buscado, timestamp}
    let registro = new logBusqueda(data);
    await registro.save((err)=>{
        if(err) return false;
        return true;
    });
}

const ultimosRegistros = async (req, res, next) => {
    console.log(req.params.id)
    var limit = req.params.id
    await logBusqueda.find().hint({$natural: -1}).limit(parseInt(limit)).then(data=>{
        res.json(data)
    }).catch(err=>{
        next(err);
    });
}

const ultimosRegistrosPersonas = async (req, res, next) => {
    console.log(req.params.id)
    var limit = req.params.id
    await logBusqueda.find({tipo_busqueda: 2}).hint({$natural: -1}).limit(parseInt(limit)).then(data=>{
        res.json(data)
    }).catch(err=>{
        next(err);
    });
}

const ultimosRegistrosNumeros = async (req, res, next) => {
    console.log(req.params.id)
    var limit = req.params.id
    await logBusqueda.find({tipo_busqueda: 1}).hint({$natural: -1}).limit(parseInt(limit)).then(data=>{
        res.json(data)
    }).catch(err=>{
        next(err);
    });
}

module.exports = {
    registrarLog: registrarLog,
    ultimosRegistrosGeneral: ultimosRegistros,
    ultimosRegistrosPersonas: ultimosRegistrosPersonas,
    ultimosRegistrosNumeros: ultimosRegistrosNumeros
}