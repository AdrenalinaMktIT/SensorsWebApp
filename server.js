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
mongoose.connect(configDB.remoteUrl); // connect to our database

require('./app/config/passport')(passport); // pass passport for configuration

app.use(express.static(__dirname + '/public'));


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

//});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Sensores WebApp escuchando sobre puerto ' + port);