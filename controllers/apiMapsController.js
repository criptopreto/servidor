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
                    coordinates: [[
                        [ -66.83369636535646, 10.500955581665039 ],
                        [ -66.8236541748047, 10.500955581665039 ],
                        [ -66.82442665100099, 10.492243766784668 ],
                        [ -66.83442592620851, 10.493659973144531 ],
                        [ -66.83369636535646, 10.500955581665039 ]
                    ]]
                }
            }
        }}).then(data=>{
            res.json(data);
        }).catch(err=>{
            res.json(err)
        })
    }
}

module.exports = data;