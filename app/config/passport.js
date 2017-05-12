// config/passport.js
var _ = require('underscore');
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport, auditLog) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

		// find a user whose name is the same as the forms username
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'name' :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'Ese usuario ya ha sido creado.'));
            } else {

				// if there is no user with that email
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.name = username;
                newUser.password = newUser.generateHash(password); // use the generateHash function in our user model

				// save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with username and password from our form

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

            // find a user whose name is the same as the forms username
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'name' :  username }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err) {
                    auditLog.logEvent(null, JSON.stringify(headersObj), 'local-login', 'passport', null, 'Error. ' + err);
                    return done(err);
                }

                // if no user is found, return the message
                if (!user) {
                    auditLog.logEvent(null, JSON.stringify(headersObj), 'local-login', 'passport', null, 'Error. Usuario inexistente.');
                    return done(null, false, req.flash('loginMessage', 'Usuario inexistente.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!user.validPassword(password)) {
                    auditLog.logEvent(null, JSON.stringify(headersObj), 'local-login', 'passport', null, 'Error. Contraseña incorrecta.');
                    return done(null, false, req.flash('loginMessage', 'Contraseña incorrecta.')); // create the loginMessage and save it to session as flashdata
                }

                // all is well, return successful user
                auditLog.logEvent(null, JSON.stringify(headersObj), 'local-login', 'passport', JSON.stringify(user.toObject()), 'Ingreso Correcto.');
                return done(null, user);
            });

        }));
};