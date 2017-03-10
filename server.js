// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session = require('express-session');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var configDB = require('./app/config/database.js');

// configuration ===============================================================

require('./app/config/passport')(passport); // pass passport for configuration

app.use(express.static(__dirname + '/public'));

mongoose.connect(configDB.remoteUrl);
mongoose.Promise = require('bluebird');
var db = mongoose.connection;

// CONNECTION EVENTS
// Conexion con Mongo exitosa.
db.on('connected', function () {
    console.log('Mongoose abierto en: ' + configDB.remoteUrl);
});

// Conexion con Mongo fallida.
db.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// // Conexion con Mongo desconectada.
db.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// log every request to the console
app.use(morgan('dev'));

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(cookieParser());

app.set('views', __dirname + '/public/views');

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'adrenalinamktsensoreswebappnodejs',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(flash()); // use connect-flash for flash messages stored in session

app.use(favicon(__dirname + '/public/assets/img/favicon.ico'));

// Funcion Middleware que es llamada para cada request.
// En este caso siempre hago un check para ver si la base de datos esta conectada.
app.use(function (req, res, next) {
    console.log('Request Time:', Date.now());
    next();
});

// APP routes ======================================================================
require('./app/routes/app.routes')(app, passport); // load our routes and pass in our app and fully configured passport
// API routes ======================================================================
require('./app/routes/alert.routes')(app);
require('./app/routes/carrier.routes')(app);
require('./app/routes/client.routes')(app);
require('./app/routes/device.routes')(app);
require('./app/routes/group.routes')(app);
require('./app/routes/model.routes')(app);
require('./app/routes/profile.routes')(app);
require('./app/routes/sensor.routes')(app);
require('./app/routes/timezone.routes')(app);
require('./app/routes/type.routes')(app);
require('./app/routes/user.routes')(app);

// Manejador error cod. HTTP 404.
app.use(function(req, res) {
    res.status(400).render('404.ejs', {title: '404: Recurso no encontrado'});
});

// Manejador error cod. HTTP 500.
app.use(function(error, req, res, next) {
    res.status(500).render('500.ejs', {title:'500: Error interno de servidor.', error: error});
});

// launch ======================================================================
app.listen(port);
console.log('Sensores WebApp escuchando sobre puerto ' + port);