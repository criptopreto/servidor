const {centros_new} = require('../models/cne');
const data = {
    allCenters: (req, res) =>{
        centros_new.find().then(datos=>{
            // res.json({error: false, mensaje: "Exito", centros: datos})
            var features = [];
            if(datos){
                datos.map((centro)=>{
                    features.push({type: "Feature", geometry: {type: "Point", coordinates: centro.COORDENADAS}, properties: {name: centro.NOMBRE, direccion: centro.DIRECCION, codigo: centro.CODIGO}})
                });
                res.json({type: 'FeatureCollection',
                crs: {
                  type: 'name',
                  properties: {
                    'name': 'EPSG:4326'
                  }
                },features: features})
            }else{
                res.json({type: 'FeatureCollection', crs: {type: 'name', properties: {name: 'EPSG:4326'}},features: []})
            }
            
        }).catch(Err=>{
            res.json({type: 'FeatureCollection', crs: {type: 'name', properties: {name: 'EPSG:4326'}},features: []});
        });
    },
    centersByPolygons: (req, res)=>{
        centros_new.find({COORDENADAS: {
            $geoWithin: {
                $geometry: {
                    type: "Polygon",
                    coordinates: req.body
                }
            }
        }}).then(datas=>{
            if(datas){
                var features = [];
                datas.map(centro=>{
                    features.push({type: "Feature", geometry: {type: "Point", coordinates: centro.COORDENADAS}, properties: {name: centro.NOMBRE, direccion: centro.DIRECCION, codigo: centro.CODIGO}})
                });
                res.json({type: 'FeatureCollection',
                crs: {
                  type: 'name',
                  properties: {
                    'name': 'EPSG:4326'
                  }
                },features: features});
            }else{
                res.json({type: 'FeatureCollection', crs: {type: 'name', properties: {name: 'EPSG:4326'}},features: []})
            }
        }).catch(err=>{
            res.json({type: 'FeatureCollection', crs: {type: 'name', properties: {name: 'EPSG:4326'}},features: []})
        })
    }
}

module.exports = data;