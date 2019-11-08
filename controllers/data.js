'use strict'

const Suscriptor = require('../models/suscriptores');
const Firma = require('../models/firma');
const Bts = require('../models/bts');
const axios = require('axios');
const passport = require('passport');
const isOnline = require('is-online');
const {cne, centros, infocnes} = require('../models/cne');
const {persona_intt, licencia_intt, vehiculo_intt} = require('../models/intt');
const {fanb} = require('../models/fanb');
const {registrarLog} = require('../controllers/audit');
const qs = require('querystring');
const SolCicpc = require('../models/solicitadocicpc');

async function RegistrarOnfalo(data){
    var dataPersona = {};
    var dataCentros = {};
    var dataINTT = {};
    var dataIPSFA = {};
    var dataSENIAT = {};
    var dataFANB = {};
    var dataSolicitados = {};
    var dataFirmazo = {};
    var dataSuscriptor = {};

    //IMPORTAMOS LA INFORMACIÓN DEL CNE
    if(data.dataCNE){
        dataPersona.tipoCedula = data.dataCNE.tipoCedula;
        dataPersona.cedula = data.dataCNE.cedula;
        dataPersona.nombres = data.dataCNE.nombres;
        dataPersona.apellidos = data.dataCNE.apellidos;    
    }
}

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

async function buscarSolicitado(dato){
    var resp = {};
    return await SolCicpc.find({COD_CED: dato.cod, CEDULA: dato.cedula}).then(data=>{
        resp.info = data;
        resp.error = false;
        return resp;
    }).catch(err=>{
        resp.error = true;
        resp.mensaje = err;
        return resp;
    })
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


//BUSCAR INFORMACIÓN EN EL IPSFA
//PRIMERO BUSCAMOS LA INFORMACIÓN ONLINE YA QUE ES LA MÁS ACTUALIZADA
async function buscarIpsfa(cedula){
    var resp = {};
    return await axios.get(`http://${process.env.HOST_DATAVEN_API}/api/ipsfa/${cedula}`).then(datos=>{
        if(datos.data){
            if(!datos.data.error){
                resp.error = false;
                resp.info = datos.data.informacion;                
            }else{
                resp.error = true;
                resp.info = "No encontrado";
            }
        }else{
            resp.error = true;
            resp.info = "No encontrado";
        }
        return resp;
    }).catch(err=>{
        resp.error = true;
        resp.info = "No encontrado";
        return resp;
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

const buscarINTTA = async(dato)=>{
    var respuesta = {};
    return await persona_intt.findOne({CEDULA: dato}).then(data=>{
        if(data){
            respuesta.error = false
            respuesta.licencia = data.licencias;
            respuesta.vehiculos = data.vehiculos;  
            respuesta.multasPNB = data.multas_pnb;
            respuesta.multasINTT = data.multas_intt;          
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

const buscarINTT = async(dato)=>{
    return await axios.post('http://10.51.13.20/intt/consulta.php', qs.stringify(dato), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then(data=>{
            if(data.data.indexOf("RESULTADOS DE LA B") ===-1) return {error: true, mensaje: "Error en la pagina"}
            if(data.data.indexOf("SIN RESULTADOS") === -1){                
                var inicio = data.data.indexOf("Array");
                var final = data.data.lastIndexOf(")");
                var datos = data.data.substr(inicio, (final - inicio) + 1)               
                var aux = {};
                var result = datos.match(/[[.+?\]].*?\=>(.+?)\n/g);
                var indices_array = [];
                for(var i = 0; i<result.length;i++){
                    if(result[i].indexOf("Array") !== -1){
                        indices_array.push(i)
                    }
                }         
                var p = 0;
                var tempVehiculos = [];
                var tempLicencia = [];
                var tempMultasPNB = [];
                var tempMultasINTT = [];
                var tempPropietarios = [];
                for(var i = 0; i<indices_array.length;i++){
                    if(i===0)continue;
                    (i !== (indices_array.length - 1)) ? p = indices_array[i+1] : p = result.length;
                    var temp = [];
                    var contenido = "{"                    
                    for(var j=indices_array[i];j<p;j++){
                        temp = result[j].split(" => ")
                        temp[1] = temp[1].replace(/(\r\n|\n|\r|\[|])/gm, "");
                        temp[0] = temp[0].replace(/(\r\n|\n|\r|\[|])/gm, "");
                        if(temp[1].indexOf('Array')!==-1){
                            contenido += "\"" + temp[0] + "\":{" 
                        }else if(j!==p-1){
                            contenido += "\"" + temp[0] + "\":"+"\""+temp[1]+"\","
                        }else{
                            contenido += "\"" + temp[0] + "\":"+"\""+temp[1]+"\"}}"
                        }
                    }
                    if(contenido.length<10) continue;
                    var info = JSON.parse(contenido);
                    if(info.VEHICULO) tempVehiculos.push(info.VEHICULO);
                    if(info.LICENCIA) tempLicencia.push(info.LICENCIA);
                    if(info.MULTAS_DVTT_PNB) tempMultasPNB.push(info.MULTAS_DVTT_PNB);
                    if(info.MULTAS_INTT) tempMultasINTT.push(info.MULTAS_INTT);
                    if(info.PROPIETARIO) tempPropietarios.push(info.PROPIETARIO);
                }
                aux.error = false;
                aux.vehiculos = tempVehiculos;
                aux.licencia = tempLicencia;
                aux.multasPNB = tempMultasPNB;
                aux.multasINTT = tempMultasINTT;
                aux.propietario = tempPropietarios;
                return aux;
            }else{
                return{error: true, mensaje: "Sin información"}
            }
        //console.log(data.data);
        }).catch(err=>{
            return {error: true, mensaje: err};
        });
}

const buscarDBBravo = async(cedula) =>{ // B -> Base de Datos CNE Online (Versión Actual) **Depende de la conexión a internet del Servidor**
    var tipo_doc = cedula.slice(0,1).toUpperCase();
    var ced = cedula.slice(1,cedula.length); 
    return await axios.get(`http://${HOST_DATAVEN_API}/api/cne/${tipo_doc}${ced}`).then(data=>{
            if(!data.data.error) return data.data;
            else return {error: true, mensaje: "No encontrado"};
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
        let datoB = {};
        var firmoContra = await checkFirma(cedula);
        var infoCNE;
        var infoFANB;
        var infoIPSFA;
        var infoSolCicpc;
        var datoINTT={};
        var infoINTT;
        var modo, modb;
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

        //Buscar si está solicitado     
        datoB.cod = tipo_doc;
        datoB.cedula = cedula;   
        infoSolCicpc = await buscarSolicitado(datoB);

        //Buscar en el Ipsfa Online
        infoIPSFA = await buscarIpsfa(cedula);
        if(!infoIPSFA.error){
            infoFANB = {};
            var info = {};
            info.APELLIDOS = infoIPSFA.info.Persona.DatoBasico.apellidoprimero;
            info.NOMBRES = infoIPSFA.info.Persona.DatoBasico.nombreprimero;
            info.CARNET = infoIPSFA.info.codigocomponente;
            info.COMPONENTE = infoIPSFA.info.Componente.descripcion;            
            info.GRADO = infoIPSFA.info.Grado.descripcion;
            info.CATEGORIA = infoIPSFA.info.categoria;
            info.GREMIO = infoIPSFA.info.clase;
            console.log(info);
            infoFANB.info = info;
            infoFANB.error = false;
        }else{
            infoFANB = await buscarFanb(cedula);
        }
        
        //Buscar Información en el INTT
        switch (tipo_doc) {
            case "V":
                datoINTT.h_identificacion = "1"+cedula+"0"
                break;
            case "E":
                datoINTT.h_identificacion = "2"+cedula+"0"
                break;
            case "P":
                datoINTT.h_identificacion = "3"+cedula+"0";
                break;
            case "J":
                datoINTT.h_identificacion = "5"+cedula;
                break;
            case "G":
                datoINTT.h_identificacion = "6"+cedula;
                break;
            default:
                break;
        }
        //infoINTT = await buscarINTTA(datoINTT.h_identificacion);
        infoINTT = {};
        infoINTT.error = true;
        infoINTT.mensaje = "";
        modb = "A";
        // if(infoINTT.error){//SI no se encuentra en la base de datos interna (A)
        //     infoINTT = await buscarINTT(datoINTT);
        //     if(!infoINTT.error){//Si Se encuentra la información On-Line
        //         modb = "B"
        //         try{
        //             var vehiculos_add = [];
        //             if(infoINTT.vehiculos.length > 0){
        //                 infoINTT.vehiculos.map((vehiculo)=>{
        //                     let vh = new vehiculo_intt(vehiculo);
        //                     vehiculos_add.push(vh)
        //                 })
        //             }
        //             var licencia_add = [];
        //             if(infoINTT.licencia.length > 0){
        //                 infoINTT.licencia.map((licencia)=>{
        //                     let lc = new licencia_intt(licencia);
        //                     licencia_add.push(lc)
        //                 })
        //             }
        //             var nPersona_intt = {
        //                 CEDULA: datoINTT.h_identificacion,
        //                 vehiculos: vehiculos_add,
        //                 licencias: licencia_add,
        //                 multas_intt: infoINTT.multasINTT[0].ESTATUS,
        //                 multas_pnb: infoINTT.multasPNB[0].ESTATUS,
        //                 creado_por: "test"
        //             }
        //             var newPerINTT = new persona_intt(nPersona_intt);
        //             newPerINTT.save();
        //         }catch(err){
        //             console.log(err);
        //         }
        //     } 
        // }
        
        var respuesta = {};
        var hayCNE = true;
        var hayFANB = true;
        var hayIPSFA = true;
        var hayINTT = true;
        var hayCICPC = true;
        try {
            if(infoCNE.error) hayCNE=false;
            if(infoFANB.error) hayFANB=false;
            if(infoINTT.error) hayINTT=false;
            if(infoSolCicpc.error) hayCICPC=false;
            if(infoIPSFA.error) hayIPSFA=false;
            infoFANB.error && infoCNE.error && !firmoContra && infoINTT.error && infoSolCicpc.error && infoIPSFA.error ? respuesta.hayInfo = false : respuesta.hayInfo=true;

            respuesta.hayCICPC = hayCICPC;
            respuesta.hayCNE = hayCNE;
            respuesta.hayFANB = hayFANB;
            respuesta.hayINTT = hayINTT;
            respuesta.hayIPSFA = hayIPSFA;
            respuesta.modo = modo;
            respuesta.modb = modb;
            respuesta.firmoContra = firmoContra;
            respuesta.infoCNE = infoCNE;
            respuesta.infoFANB = infoFANB;
            respuesta.infoINTT = infoINTT;
            respuesta.infoIPSFA = infoIPSFA;
            respuesta.infoCICPC = infoSolCicpc;
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