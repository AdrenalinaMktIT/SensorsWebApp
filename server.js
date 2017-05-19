// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session = require('express-session');
var http = require('http');
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose').set('debug', true);
var passport = require('passport');
var flash    = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var configDB = require('./app/config/database.js');
var moment = require('moment');
var _ = require('underscore');
const chalk = require('chalk');
const log = console.log;

// configuration ===============================================================
require('./app/config/passport')(passport); // pass passport for configuration

var uri = configDB.remoteUrl;

var options = {
    db: { native_parser: true },
    server: {
        reconnectTries: Number.MAX_VALUE,   // Good way to make sure mongoose never stops trying to reconnect
        socketOptions: {
            keepAlive: 1,
            socketTimeout: 20000 ,
            connectTimeoutMS: 30000
        }
    }
};

mongoose.Promise = require('bluebird');

mongoose.connect(uri, options);

mongoose.connection.on('connecting', function() {
    log(chalk.blue.bgYellow.bold(uri + ' conectando...'));
});

mongoose.connection.on('error', function(error) {
    log(chalk.bgRed.bold(error));
});

mongoose.connection.on('timeout', function(error) {
    log(chalk.bgRed.bold(error));
});

mongoose.connection.on('connected', function() {
    log(chalk.bgGreen.bold(uri + ' conectado!'));
});

mongoose.connection.once('open', function() {
    log(chalk.green.bold(uri + ' conexion abierta.'));
});

mongoose.connection.on('close', function() {
    log(chalk.blue.bgBlack.bold(uri + ' conexion cerrada.'));
});

mongoose.connection.on('reconnected', function () {
    log(chalk.blue.bgBlue.bold(uri + ' reconectado!'));
});

mongoose.connection.on('disconnected', function() {
    log(chalk.white.bgRed.bold(uri + ' desconectado!'));
});

var app = express();

var server = http.createServer(app);

app.use(express.static(__dirname + '/public'));

app.use(morgan(developmentFormatLine));

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

app.set('superSecret', 'adrenalinamktsensoreswebappnodejs'); // secret variable for webtokens.

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
    log(chalk.white.bgBlue.bold('Request Time: ', moment().format("DD-MM-YYYY HH:mm:ss")));
    logRequestInDatabase(req, res, next);
    //next();
});

// APP routes ======================================================================
require('./app/routes/app.routes')(app, passport); // load our routes and pass in our app and fully configured passport

// Funcion Middleware que es llamada para cada API request.
app.use(function (req, res, next) {
    isLoggedIn(req, res, next);
});

// API routes ======================================================================
require('./app/routes/alert.routes')(app);
require('./app/routes/calculation.routes')(app);
require('./app/routes/carrier.routes')(app);
require('./app/routes/client.routes')(app);
require('./app/routes/device.routes')(app);
require('./app/routes/group.routes')(app);
require('./app/routes/input.routes')(app);
require('./app/routes/model.routes')(app);
require('./app/routes/profile.routes')(app);
require('./app/routes/report.routes')(app);
require('./app/routes/sensor.routes')(app);
require('./app/routes/timezone.routes')(app);
require('./app/routes/type.routes')(app);
require('./app/routes/user.routes')(app);

var Input = require('./app/models/inputs');


// Manejador error cod. HTTP 404.
app.use(function(req, res) {
    res.status(404).render('404.ejs', {title: '404: Recurso no encontrado'});
});

// Manejador error cod. HTTP 500.
app.use(function(error, req, res, next) {
    res.status(500).render('500.ejs', {title:'500: Error interno de servidor.', error: error});
});

// launch ==    ====================================================================
//app.listen(port);
server.listen(port);
log(chalk.white.underline.bgMagenta('Sensores WebApp escuchando sobre puerto ' + port));

var gracefulExit = function() {
    mongoose.connection.close(function () {
        log(chalk.blue.bgYellow.bold(uri + ' disconnected through app termination...'));
        process.exit(0);
    });
};

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

// log every request to the console
function developmentFormatLine(tokens, req, res) {
    // get the status code if response written
    var status = tokens.status(req, res);

    // get status color
    var statusColor = status >= 500
        ? 'red' : status >= 400
            ? 'yellow' : status >= 300
                ? 'cyan' : 'green';

    return chalk.reset(padRight(tokens.method(req, res) + ' ' + tokens.url(req, res), 30))
        + ' ' + chalk[statusColor](status)
        + ' ' + chalk.reset(padLeft(tokens['response-time'](req, res) + ' ms', 8))
        + ' ' + chalk.reset('-')
        + ' ' + chalk.reset(tokens.res(req, res, 'content-length') || '-');
}

function padLeft(str, len) {
    return len > str.length
        ? (new Array(len - str.length + 1)).join(' ') + str
        : str
}
function padRight(str, len) {
    return len > str.length
        ? str + (new Array(len - str.length + 1)).join(' ')
        : str
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.status(401).render('401.ejs', {title:'401: No posee autorizacion.'});
}

// funcion middleware para loguear en base de datos las peticiones.
function logRequestInDatabase(req, res, next) {

    var method = req.method,
        path = req.url;

    var headersObj = _.pick(req.headers, 'host', 'user-agent');

    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var port = req.headers['x-forwarded-port'] ||
        req.connection.remotePort ||
        req.socket.remotePort ||
        req.connection.socket.remotePort;

    _.extendOwn(headersObj, {ip: ip, port: port});

    Input.create({ actor: req.session.passport.user || '', date: new Date(), origin: JSON.stringify(headersObj), action: method + ' ' + path, label: 'express', object: '', description: '' }, function (err, input) {
        if (err) return handleError(err);
        // saved!
    });

    return next();
}