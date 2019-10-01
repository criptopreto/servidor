'use strict'

const Suscriptor= require('../models/suscriptores');
const Firma     = require('../models/firma');
const Bts       = require('../models/bts');
const axios     = require('axios');
const passport  = require('passport');
const isOnline      = require('is-online');
const {cne, centros, infocnes} = require('../models/cne');
const {fanb} = require('../models/fanb');
const {registrarLog} = require('../controllers/audit');

async function buscarBTS(data) {
    let tipo = parseInt(data.tipo);
    let dato = data.dato.toUpperCase();
    let company = data.company.toUpperCase();
    let resp = {};
    if(tipo===1){ //Cell ID
        return await Bts.find({CELLID: dato, COMPANY: company}).then(data=>{
            if(data.length>0) {
                resp.error = false;
                resp.cantidad = data.length;
                resp.bts = data;
            }else{
                resp.error = true;
                resp.bts = "Ninguna BTS encontrada.";
            }
            return resp;
        }).catch(err=>{
            resp.error = true;
            resp.mensaje = err
            return resp;
        })
    }else if(tipo===2){ //Por Nombre de BTS
        if(company==='MOVILNET'){
            dato = new RegExp(dato);
            return await Bts.find({NOMBRE: dato, COMPANY: company}).then(data=>{
                if(data.length>0) {
                    resp.error = false;
                    resp.cantidad = data.length;
                    resp.bts = data;
                }else{
                    resp.error = true;
                    resp.bts = "Ninguna BTS encontrada.";
                }
                return resp;
            }).catch(err=>{
                resp.error = true;
                resp.mensaje = err
                return resp;
            })
        }else{
            dato = new RegExp(dato);
            return await Bts.find({NOMBRE_SECTOR: dato, COMPANY: company}).then(data=>{
                if(data.length>0) {
                    resp.error = false;
                    resp.cantidad = data.length;
                    resp.bts = data;
                }else{
                    resp.error = true;
                    resp.bts = "Ninguna BTS encontrada.";
                }
                return resp;
            }).catch(err=>{
                resp.error = true;
                resp.mensaje = err
                return resp;
            })
        }
    }else if(tipo ===3){ //Por Dirección
        dato = new RegExp(dato);
        return await Bts.find({DIRECCION: dato, COMPANY: company}).then(data=>{
            if(data.length>0) {
                resp.error = false;
                resp.cantidad = data.length;
                resp.bts = data;
            }else{
                resp.error = true;
                resp.bts = "Ninguna BTS encontrada.";
            }
            return resp;
        }).catch(err=>{
            resp.error = true;
            resp.mensaje = err
            return resp;
        })
    }else { //incorrecto
        resp.error = true;
        resp.mensaje = "Tipo incorrecto";
    }

}

async function checkFirma(cedula) {
    return await Firma.find({CEDULA: cedula}).then(data=>{
        if(data.length>0) return true;
        else return false;            
    }).catch(()=>{return false})
}

async function buscarDBCharlie (dato){ // C -> Base de datos CNE Offline (versión: 2012)
    var resp = {};
    return await cne.findOne({nacionalidad: dato.tipo, cedula: dato.cedula}).then(async (data)=>{
        return await centros.findOne({cod_centro: data.cod_centro}, 'nombre_centro direccion_centro').then(datac=>{
            resp.info = data;
            resp.error = false;
            resp.centro = datac;

            return resp;
        }).catch(err=>{
            resp.error = true;
            resp.mensaje = err;
            return(resp)
        })
    }).catch(err=>{
        resp.error = true;
        resp.mensaje = err;
        return(resp)
    })
}

async function buscarFanb(cedula){
    var resp = {};
    return await fanb.findOne({CEDULA: cedula}).then((data)=>{
        if(data){
            resp.error = false;
            resp.info = data;
        }else{
            resp.error = true;
            resp.info = "No encontrado";
        }
        
        return resp;
    }).catch(err=>{
        resp.error = true;
        resp.mensaje = err;
        return resp;
    });
}

const buscarDBBravo = async(cedula) =>{ // B -> Base de Datos CNE Online (Versión Actual) **Depende de la conexión a internet del Servidor**
    var tipo_doc = cedula.slice(0,1);
    var ced = cedula.slice(1,cedula.length); 
    return await axios.get(`http://cne.gob.ve/web/registro_electoral/ce.php?nacionalidad=${tipo_doc}&cedula=${ced}`).then(data=>{
            var respuesta = {}
            const info = data.data;
            let modo = 0;
            if(info.indexOf("<b>DATOS DEL ELECTOR</b>")>0){
                modo = 1
            }else if(info.indexOf("<strong>DATOS PERSONALES</strong>")>0){
                if(info.indexOf("no corresponde a un elector")>0){
                    respuesta.error = true;
                    respuesta.mensaje = "Persona no encontrada"
                    return respuesta;
                }else{
                    respuesta.error = true;
                    respuesta.mensaje = "Persona no encontrada"
                    return respuesta;
                }
            }else{
                respuesta.error = true;
                respuesta.mensaje = "Persona no encontrada"
                return respuesta;
            }
            if(modo===1){
                respuesta = {};
                let npos = 0;
                let infor = {};
                respuesta.error = false;
                //Obtener Cédula
                npos = info.indexOf('align="left">', info.indexOf('dula:')) + 13;
                infor.cedula = info.substr(npos, (info.indexOf('<', npos))-(npos)).trim();

                //Obtener Nombre
                npos = info.indexOf('align="left"><b>', info.indexOf('Nombre:')) + 16;
                infor.nombre = info.substr(npos, (info.indexOf('<', npos))-(npos)).trim();

                //Obtener Estado
                npos = info.indexOf('align="left">', info.indexOf('Estado:')) + 13;
                infor.estado = info.substr(npos, (info.indexOf('<', npos))-(npos)).trim();

                //Obtener Municipio
                npos = info.indexOf('align="left">', info.indexOf('Municipio:')) + 13;
                infor.municipio = info.substr(npos, (info.indexOf('<', npos))-(npos)).trim();

                //Obtener Parroquia
                npos = info.indexOf('align="left">', info.indexOf('Parroquia:')) + 13;
                infor.parroquia = info.substr(npos, (info.indexOf('<', npos))-(npos)).trim();

                //Obtener Centro
                npos = info.indexOf('"#0000FF">', info.indexOf('Centro:')) + 10;
                infor.centro = info.substr(npos, (info.indexOf('<', npos))-(npos)).trim();

                //Obtener Dirección
                npos = info.indexOf('"#0000FF">', info.indexOf('Direcci')) + 10;
                infor.direccion = info.substr(npos, (info.indexOf('<', npos))-(npos)).trim();
                respuesta.info = infor;

                return respuesta;
            }
        }).catch(err=>{
            const respuesta = {};
            respuesta.error = true;
            respuesta.mensaje = err;
            return respuesta;
        });
}

const buscarBDAlfa = async (cedula) => {
    var tipo_doc = cedula.slice(0,1);
    var ced = cedula.slice(1,cedula.length); 
    var respuesta = {};
    return await infocnes.findOne({cedula: `${tipo_doc}-${ced}`}).then(data=>{
        if(data){
            respuesta.error = false
            respuesta.info = data
        }else{
            respuesta.error = true;
            respuesta.mensaje = "Ningún registro encontrado"
        }        
        return respuesta;
    }).catch(err=>{
        respuesta.error = true;
        respuesta.mensaje = err;
        return respuesta;
    });
}

let controller = {    
    buscarNumero: async (req, res, next) =>{        
        //data = {idusuario, tipo_busqueda, dato_buscado, timestamp}
        var dataLog = {};
        dataLog.idusuario = req.user.id;
        dataLog.username = req.user.username;
        dataLog.nombres = req.user.nombres;
        dataLog.apellidos = req.user.apellidos;
        dataLog.tipo_busqueda = 1;
        dataLog.dato_buscado = req.params.id;
        await registrarLog(dataLog);
        await Suscriptor.find({NUMERO: req.params.id})
            .then(data=> {
                res.json({data});
                })
            .catch(err=>{
                next(err);
        });

    },
    extraerLotes: async(req, res)=>{
        var numeros = JSON.parse(req.body.numeros);
        if(!numeros){
            res.json({error: true, mensaje: "El número es incorrecto."});
            return;
        }
        await Suscriptor.find({NUMERO: {$in: numeros}})
        .then(data=>{
            res.json({error: false, data})
        })
        .catch(err=>{
                res.json({error: true, mensaje: err})
        });
    },
    buscarCedulaRif: async (req, res, next) =>{
        //data = {idusuario, tipo_busqueda, dato_buscado, timestamp}
        var dataLog = {};
        dataLog.idusuario = req.user.id;
        dataLog.username = req.user.username;
        dataLog.nombres = req.user.nombres;
        dataLog.apellidos = req.user.apellidos;
        dataLog.tipo_busqueda = 2;
        dataLog.dato_buscado = req.params.id;
        await registrarLog(dataLog);
        await Suscriptor.find({CEDULA: req.params.id}).limit(50)
            .then(data=> {
                res.json({data});
                })
            .catch(err=>{ 
                next(err);
            });
    },
    buscarInfoSuscriptor: async(req, res)=> {
        //Variables
        var internet = await isOnline();
        var tipo_doc = req.params.id.slice(0,1);
        var cedula = req.params.id.slice(1,req.params.id.length);
        var firmoContra = await checkFirma(cedula);
        var infoCNE;
        var infoFANB;
        var modo;
        //############# BUSCAR INFORMACIÓN DEL CNE ###############
        //Estrategia ABC || A -> BASE DE DATOS OFFLINE ACTUAL || B -> BASE DE DATOS ONLINE ACTUAL || C -> BASE DE DATOS OFFLINE 2012        
        infoCNE = await buscarBDAlfa(req.params.id); //BUSCAR LA INFORMACIÓN EN LA BASE DE DATOS (A)
        modo = 'A';
        if(infoCNE.error){ //SI no se encuentra en la base de datos (A)
            if(internet){ //Si hay Internet
                modo = 'B';
                infoCNE = await buscarDBBravo(req.params.id); //BUSCAR LA INFORMACIÓN EN LA BASE DE DATOS (B)
            }
            if(infoCNE.error){ // Si la BD (B) no tiene la información
                modo = 'C';
                infoCNE = await buscarDBCharlie({tipo: tipo_doc, cedula: cedula}); //BUSCAR LA INFORMACIÓN EN LA BASE DE DATOS (C)
            } else { // Si la BD (B) tiene la información la guardamos en la BD (A)
                try {
                    var newRegistro = new infocnes(infoCNE.info);
                    await newRegistro.save();
                } catch (error) {
                    console.log(error)
                }
            }
        }

        infoFANB = await buscarFanb(cedula);
        var respuesta = {};
        var hayCNE = true;
        var hayFANB = true;
        try {
            if(infoCNE.error===true) hayCNE=false;
            if(infoFANB.error===true) hayFANB=false;
            infoFANB.error && infoCNE.error && !firmoContra ? respuesta.hayInfo = false : respuesta.hayInfo=true;

            respuesta.hayCNE = hayCNE;
            respuesta.hayFANB = hayFANB;
            respuesta.modo = modo
            respuesta.firmoContra = firmoContra;
            respuesta.infoCNE = infoCNE;
            respuesta.infoFANB = infoFANB;
            res.json(respuesta);
        } catch (error) {
            console.log("Error: ", error);
            respuesta.hayInfo = false;
            res.json(respuesta);
        }        
    },    
    verificarToken: async (req, res, next) =>{
        passport.authenticate('jwt', {session: false}, (err, user, info)=>{
            //si hubo un error relacionado con la validez del token (error en su firma, caducado, etc)
            if(info) res.send(false)

            //si hubo un error en la consulta a la base de datos
            if (err) res.send(false)

            //si el token está firmado correctamente pero no pertenece a un usuario existente
            if (!user) res.send(false)
            
            //inyectamos los datos de usuario en la request
            res.send(true)
        })(req, res, next);
    },
    buscarBTS: async(req, res) =>{
        let dato = {};
        let miBTS;
        //Validar Datos
        if(req.query.tipo===''){
            res.json([])
            return;
        }else if(req.query.company !== 'DIGITEL' && req.query.company !== 'MOVILNET' && req.query.company !== 'MOVISTAR'){
            res.json([])
            return;
        }else if(req.query.dato ===''){
            res.json([])
            return;
        }
        //Asignación de datos
        dato.tipo = req.query.tipo;
        dato.company = req.query.company;
        dato.dato = req.query.dato;
        miBTS = await buscarBTS(dato);
        try {
            if(miBTS.error===true){
                res.json([]);
                return;
            }else{
                res.json({miBTS})
                return;
            }
        } catch (error) {
            res.json([]);
            return;
        }
    }
}

module.exports = controller;