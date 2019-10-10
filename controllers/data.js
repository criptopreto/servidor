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
const qs = require('querystring');

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

function json_encode (mixedVal) {
  var $global = (typeof window !== 'undefined' ? window : global)
  $global.$locutus = $global.$locutus || {}
  var $locutus = $global.$locutus
  $locutus.php = $locutus.php || {}

  var json = $global.JSON
  var retVal
  try {
    if (typeof json === 'object' && typeof json.stringify === 'function') {
      // Errors will not be caught here if our own equivalent to resource
      retVal = json.stringify(mixedVal)
      if (retVal === undefined) {
        throw new SyntaxError('json_encode')
      }
      return retVal
    }

    var value = mixedVal

    var quote = function (string) {
      var escapeChars = [
        '\u0000-\u001f',
        '\u007f-\u009f',
        '\u00ad',
        '\u0600-\u0604',
        '\u070f',
        '\u17b4',
        '\u17b5',
        '\u200c-\u200f',
        '\u2028-\u202f',
        '\u2060-\u206f',
        '\ufeff',
        '\ufff0-\uffff'
      ].join('')
      var escapable = new RegExp('[\\"' + escapeChars + ']', 'g')
      var meta = {
        // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
      }

      escapable.lastIndex = 0
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        var c = meta[a]
        return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0)
          .toString(16))
          .slice(-4)
      }) + '"' : '"' + string + '"'
    }

    var _str = function (key, holder) {
      var gap = ''
      var indent = '    '
      // The loop counter.
      var i = 0
      // The member key.
      var k = ''
      // The member value.
      var v = ''
      var length = 0
      var mind = gap
      var partial = []
      var value = holder[key]

      // If the value has a toJSON method, call it to obtain a replacement value.
      if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
        value = value.toJSON(key)
      }

      // What happens next depends on the value's type.
      switch (typeof value) {
        case 'string':
          return quote(value)

        case 'number':
          // JSON numbers must be finite. Encode non-finite numbers as null.
          return isFinite(value) ? String(value) : 'null'

        case 'boolean':
        case 'null':
          // If the value is a boolean or null, convert it to a string. Note:
          // typeof null does not produce 'null'. The case is included here in
          // the remote chance that this gets fixed someday.
          return String(value)

        case 'object':
          // If the type is 'object', we might be dealing with an object or an array or
          // null.
          // Due to a specification blunder in ECMAScript, typeof null is 'object',
          // so watch out for that case.
          if (!value) {
            return 'null'
          }

          // Make an array to hold the partial results of stringifying this object value.
          gap += indent
          partial = []

          // Is the value an array?
          if (Object.prototype.toString.apply(value) === '[object Array]') {
            // The value is an array. Stringify every element. Use null as a placeholder
            // for non-JSON values.
            length = value.length
            for (i = 0; i < length; i += 1) {
              partial[i] = _str(i, value) || 'null'
            }

            // Join all of the elements together, separated with commas, and wrap them in
            // brackets.
            v = partial.length === 0 ? '[]' : gap
              ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
              : '[' + partial.join(',') + ']'
            gap = mind
            return v
          }

          // Iterate through all of the keys in the object.
          for (k in value) {
            if (Object.hasOwnProperty.call(value, k)) {
              v = _str(k, value)
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v)
              }
            }
          }

          // Join all of the member texts together, separated with commas,
          // and wrap them in braces.
          v = partial.length === 0 ? '{}' : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}'
          gap = mind
          return v
        case 'undefined':
        case 'function':
        default:
          throw new SyntaxError('json_encode')
      }
    }

    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.
    return _str('', {
      '': value
    })
  } catch (err) {
    // @todo: ensure error handling above throws a SyntaxError in all cases where it could
    // (i.e., when the JSON global is not available and there is an error)
    if (!(err instanceof SyntaxError)) {
      throw new Error('Unexpected error type in json_encode()')
    }
    // usable by json_last_error()
    $locutus.php.last_error_json = 4
    return null
  }
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
                }
                aux.error = false;
                aux.vehiculos = tempVehiculos;
                aux.licencia = tempLicencia;
                aux.multasPNB = tempMultasPNB;
                aux.multasINTT = tempMultasINTT;
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
        var datoINTT={};
        var infoINTT;
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


        //Buscar Información en el INTT
        console.log(tipo_doc);
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
        infoINTT = await buscarINTT(datoINTT);

        var respuesta = {};
        var hayCNE = true;
        var hayFANB = true;
        var hayINTT = true;
        try {
            if(infoCNE.error===true) hayCNE=false;
            if(infoFANB.error===true) hayFANB=false;
            if(infoINTT.error===true) hayINTT=false;
            infoFANB.error && infoCNE.error && !firmoContra && infoINTT.error ? respuesta.hayInfo = false : respuesta.hayInfo=true;

            respuesta.hayCNE = hayCNE;
            respuesta.hayFANB = hayFANB;
            respuesta.hayINTT = hayINTT;
            respuesta.modo = modo
            respuesta.firmoContra = firmoContra;
            respuesta.infoCNE = infoCNE;
            respuesta.infoFANB = infoFANB;
            respuesta.infoINTT = infoINTT;
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