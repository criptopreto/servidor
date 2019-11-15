'use strict'
/*Configurar Variables de Entorno*/
require('dotenv').config();
/*Dependencias*/
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const user_routes = require('./routes/user');
const data_routes = require('./routes/data');
const customMdw = require('./middleware/custom');
const coordenadas = require('./models/coordenadas');
const exphbs = require('express-handlebars');

/*Inicializacion*/
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

global.busqueda = {};

/*##Base de Datos##*/
//MONGODB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true
}).catch((err)=>{
    console.error('\x1b[41m\x1b[33m%s\x1b[0m', "Error al conectarse a la Base de Datos MongoDB:"); console.error(err); process.exit(1)
}).then(()=>{console.log('\x1b[44m\x1b[33m%s\x1b[0m', "Base de Datos MongoDB Conectada")});

//MYSQL
const pool = require('./database.mysql');

/*Configuracion*/
app.set('puerto', process.env.PUERTO || 8080);
passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    session: false
}, (username, password, done)=>{
    pool.query("Select * from usuario where username='" + username + "'", (err, result)=>{
        if(err) return done(err, null);
        if(!result) return done(null,false);
        if(result.length <= 0) return done(null, false); //El usuario no existe
        else if (!bcrypt.compareSync(password, result[0].password)){return done(null, false)} //contraseña incorrecta
        return done(null, result[0]) //Login Ok
    });
}));

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
opts.algorithms = [process.env.JWT_ALGORITHMS];

passport.use(new JwtStrategy(opts, (jwt_payload, done)=>{
    pool.query("Select * from usuario where idusuario='" + jwt_payload.sub + "'", (err, usuario) => {
        if(err) return done(err, null) //Error en la bd
        if(usuario.length <=0) return done(null, false) //Usuario no encontrado
        return done(null, usuario[0]);
    })
}));

/*Middlewares*/
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use('/registro', express.static('public'));
app.use('/control', express.static('public'));
app.use('/archivos', express.static('public'));

//VISTAS
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

/*routes*/
app.use('/api', user_routes);
app.use('/', data_routes);
app.use(customMdw.errorHandler);
app.use(customMdw.notFoundHandler);

/*Inicio del Servidor*/
server.listen(app.get('puerto'), async () => {
    console.log(`Servidor iniciado en el puerto: ${app.get('puerto')}`);
});

/* Socket.io */

const dashboard = io.of('/dashboard'); //Namespace: dashboard
const suscriptores = io.of('/suscriptores'); //Namespace: suscriptores
const control = io.of('/botcontrol'); //Namespace: Control de los BOT

//###Name espace: dashboard
const logs = require('./controllers/logs');
dashboard.on('connection', (socket)=>{
    console.log('(B)Hay 1 conexión: ', socket.id);
    socket.on('enviar-data', datos=>{
        console.log(datos)
    });

    socket.on('upd-conexion', async function(){
        const data = await logs() || [];
        socket.emit('dato-inicial', data);
    });
    socket.on('disconnect', ()=>{
        console.log("Se desconectó: ", socket.id);
    });
});

//### | Namespace: control
control.on('connection', socket=>{
    console.log("Control: Hay 1 conexión: ", socket.id);
    
    //Iniciar Sesión SAIME
    socket.on('iniciar-sesion', ()=>{
        console.log("Control: Solicitud de inicio de sesión al SAIME recibida");
        console.log("Enviando comando al BOT");
        control.emit("control-inicio");
    });

    socket.on('buscar-cedula', data=>{
        console.log("Control: Buscar la cédula: ", data);
        console.log("Enviando comando al BOT");
        busqueda.procesado = true;
        control.emit("control-cedula", data);
    });

    socket.on('respuesta-cedula', data=>{
        console.log("Control: Respuesta de la solicitud de información de la cédula.");
        console.log("Emitiendo información al cliente");
        control.emit("ctrl-resp-cedula", data);
    });

    socket.on('check-status', (data)=>{
        console.log("Control: Comprobando el estado de la sesión del SAIME");
        console.log("Enviando Comando al BOT");
        if(Object.keys(io.of('/botcontrol').clients().connected).length < 2){
            control.emit('error-bot');
        }else{
            control.emit('control-status', data);
        }
    });

    socket.on('bot-status', (data)=>{
        console.log("Control: Respuesta de estado del Bot");
        console.log("Enviando la respuesta al cliente");
        control.emit('response-status', data)
    });

    socket.on('bot-respuesta', (data)=>{
        console.log("Control: Recibiendo Respuesta del Bot");
        console.log("Control: Enviando la Respuesta al Cliente");
        control.emit("response-respuesta", data);
    })
});

//### | Namespace: suscriptores
suscriptores.on('connection', (socket)=>{    
    console.log('(A)Hay 1 Conexión: ', socket.id);

    socket.on('enviar-data', (data)=>{
        console.log("(A)Data recibida: ", data); 
        console.log("Enviando mensaje a dashboard:");
        dashboard.emit('data-sus', data);
    });

    socket.on('upd-log', (msg)=>{
        dashboard.emit('new-log', msg)
    });

    console.log('User Conncetion');

    socket.on('connect user', function(user){
        console.log("Connected user ");
        io.emit('connect user', user);
    });

    socket.on('on typing', function(typing){
        console.log("Typing.... ");
        io.emit('on typing', typing);
    });

    socket.on('chat message', function(msg){
        console.log("Message " + msg['message']);
        suscriptores.emit('chat message', msg);
    });

    socket.on('coordenadas', function(msg){
        //let json = JSON.parse(msg);
        let newCoord = new coordenadas(msg);
        newCoord.save();
        console.log(msg);
        console.log(new Date());
        suscriptores.emit('coordenadasX', msg);
    });
});