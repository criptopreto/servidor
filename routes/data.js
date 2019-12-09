const express = require('express');
const router = express.Router();
const customMdw = require('../middleware/custom');
const DataController = require('../controllers/dataController');
const AuditController = require('../controllers/audit');
const multer = require('multer');
const path = require('path');
const mime = require('mime');
const uuid = require('uuid');
var storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, 'usuarios/perfil/img/')
    },
    filename: function(req, file, cb){
        console.log(req.params.id)
        console.log(file)
        let ext = path.extname(file.originalname);
        ext = ext.length > 1 ? ext : '.' + mime.getExtension(file.mimetype);
        cb(null, req.params.id + ext)
    }
});
const upload = multer({storage: storage});

router.get('/bts/', DataController.buscarBTS);
router.get('/numero/:id', customMdw.ensureAuthenticated, DataController.buscarNumero);
router.get('/cedula/:id', customMdw.ensureAuthenticated, DataController.buscarCedulaRif);
router.get('/infopersona/:id',DataController.buscarInfoSuscriptor);
router.get('/buscarpersona', DataController.buscarPersonaNombres);
// router.get('/intt', DataController.buscarINTT);

router.post('/token/verificar', DataController.verificarToken);
router.get('/audit/logbusqueda/:id',AuditController.ultimosRegistrosGeneral);
router.get('/audit/logbusquedaPersonas/:id',AuditController.ultimosRegistrosPersonas);
router.get('/audit/logbusquedaNumeros/:id',AuditController.ultimosRegistrosNumeros);
router.post('/numerolotes', customMdw.ensureAuthenticated, DataController.extraerLotes);
router.post('/perfil/avatar/:id',  upload.single('avatar'),(req, res) => {
    console.log(req.body.userid)
    res.json({msg: uuid()})
})

module.exports = router; 