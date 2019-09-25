const express           = require('express');
const router            = express.Router();
const customMdw         = require('../middleware/custom');
const SampleController  = require('../controllers/sample');
const UserController    = require('../controllers/user');

router.post('/iniciar_sesion', UserController.login);
router.post('/registrarse', UserController.register);

router.get('/usuario/actual', customMdw.ensureAuthenticated, UserController.actual);
// router.get('/user/:id')
router.get('/test', SampleController.unprotected);
router.get('/protected', customMdw.ensureAuthenticated, SampleController.protected);

module.exports = router;