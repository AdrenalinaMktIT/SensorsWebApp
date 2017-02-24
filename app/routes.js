// app/routes.js
module.exports = function(app, passport) {

    var Alert = require('./models/alert');
    var Carrier = require('./models/carrier');
    var Client = require('./models/client');
    var Device = require('./models/device');
    var Group = require('./models/group');
    var Model = require('./models/model');
    var Profile = require('./models/profile');
    var Sensor = require('./models/sensor');
    var Timezone = require('./models/timezone');
    var Type = require('./models/type');
    var User = require('./models/user');

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // API ---------------------------------------------------------------------
    // get all alerts
    app.get('/api/alerts', function(req, res) {

        Alert.find(function(err, alerts) {

            if (err)
                res.send(err);

        }).populate('sensor profile')
            .exec(function (err, alerts) {
                if (err) return handleError(err);
                res.json(alerts);
            });
    });
    
    // get all carriers
    app.get('/api/carriers', function(req, res) {

        Carrier.find(function(err, carriers) {

            if (err)
                res.send(err);

            res.json(carriers);
        });
    });

    // get all clients
    app.get('/api/clients', function(req, res) {

        Client.find(function(err, clients) {

            if (err)
                res.send(err);

            res.json(clients);
        });
    });

    // get all devices
    app.get('/api/devices', function(req, res) {

        Device.find(function(err, devices) {
            if (err)
                res.send(err);
        })
            .populate('model client_id')
            .exec(function (err, devices) {
                if (err) return handleError(err);
                res.json(devices);
            });
    });

    // get all groups
    app.get('/api/groups', function(req, res) {

        Group.find(function(err, groups) {

            if (err)
                res.send(err);

            res.json(groups);
        });
    });

    // get all models
    app.get('/api/models', function(req, res) {

        Model.find(function(err, models) {

            if (err)
                res.send(err);

            res.json(models);
        });
    });

    // get all profiles
    app.get('/api/profiles', function(req, res) {

        Profile.find(function(err, profiles) {
            if (err)
                res.send(err);
        })
            .populate('carrier timezone_id')
            .exec(function (err, profiles) {
                if (err) return handleError(err);
                res.json(profiles);
            });
    });

    // get all sensors
    app.get('/api/sensors', function(req, res) {

        Sensor.find(function(err, sensors) {
            if (err)
                res.send(err);
        })
            .populate('type group')
            .exec(function (err, sensors) {
                if (err) return handleError(err);
                res.json(sensors);
            });
    });

    // get all timezones
    app.get('/api/timezones', function(req, res) {

        Timezone.find(function(err, timezones) {

            if (err)
                res.send(err);

            res.json(timezones);
        });
    });

    // get all types
    app.get('/api/types', function(req, res) {

        Type.find(function(err, types) {

            if (err)
                res.send(err);

            res.json(types);
        });
    });
    
    // get all users
    app.get('/api/users', function(req, res) {

        User.find(function(err, users) {

            if (err)
                res.send(err);

            res.json(users);
        });
    });

    // create user and send back all users after creation
    app.post('/api/users', function(req, res) {

        // create a user, information comes from AJAX request from Angular
        // find a user whose name is the same as the forms username
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'name' :  req.body.name }, function(err, user) {
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
                newUser.name = req.body.name;
                newUser.password = newUser.generateHash(req.body.password); // use the generateHash function in our user model
                newUser.description = req.body.description;
                newUser.client_id = req.body.client;
                newUser.user_type = req.body.type;
                newUser.timezone = req.body.timezone;
                newUser.active = req.body.active;

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    });

    app.post('/api/clients', function(req, res) {

        Client.findOne({ 'name' :  req.body.name }, function(err, client) {
            if (err)
                return done(err);

            if (client) {
                return done(null, false, req.flash('signupMessage', 'Ese usuario ya ha sido creado.'));
            } else {

                var newClient = new Client();

                // set the user's local credentials
                newClient.name = req.body.name;
                newClient.password = newUser.generateHash(req.body.password); // use the generateHash function in our user model
                newClient.description = req.body.description;
                newClient.client_id = req.body.client;
                newClient.user_type = req.body.type;
                newClient.timezone = req.body.timezone;
                newClient.active = req.body.active;

                newClient.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newClient);
                });
            }
        });
    });

    // delete a user
    app.delete('/api/users/:user_id', function(req, res) {
        User.remove({
            _id : req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            // get and return all the users after you create another
            User.find(function(err, users) {
                if (err)
                    res.send(err);
                res.json(users);
            });
        });
    });

    // delete a client
    app.delete('/api/clients/:client_id', function(req, res) {
        Client.remove({
            _id : req.params.client_id
        }, function(err, client) {
            if (err)
                res.send(err);

            Client.find(function(err, clients) {
                if (err)
                    res.send(err);
                res.json(clients);
            });
        });
    });

    // get a profile
    app.get('/api/profiles/:profile_id', function(req, res) {
        Profile.find({
            _id : req.params.profile_id
        }, function(err, profile) {
            if (err)
                res.send(err);

            res.json(profile);
        });
    });

    // get a user
    app.get('/api/users/:user_id', function(req, res) {
        User.find({
            _id : req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            res.json(user);
        });
    });

    // get a client
    app.get('/api/clients/:client_id', function(req, res) {
        Client.find({
            _id : req.params.client_id
        }, function(err, client) {
            if (err)
                res.send(err);

            res.json(client);
        });
    });

    // get a timezone
    app.get('/api/timezones/:timezone_id', function(req, res) {
        Timezone.find({
            _id : req.params.timezone_id
        }, function(err, timezone) {
            if (err)
                res.send(err);

            res.json(timezone);
        });
    });

    // update a user
    app.put('/api/users/:user_id', function(req, res) {
        User.findOne({
            _id : req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);
            else {
                // Update each attribute with any possible attribute that may have been submitted in the body of the request
                // If that attribute isn't in the request body, default back to whatever it was before.
                user.name = req.body.name || user.name;
                user.password = user.generateHash(req.body.password) || user.password;
                user.description = req.body.description || user.description;
                user.client_id = req.body.client || user.client_id;
                user.user_type = req.body.type || user.user_type;
                user.timezone_id = req.body.timezone || user.timezone_id;
                user.active = req.body.active;

                // Save the updated document back to the database
                user.save(function(err) {
                    if (err)
                        throw err;
                    res.send(user);
                });
            }
        });
    });

    // update a client
    app.put('/api/clients/:client_id', function(req, res) {
        User.find({
            _id : req.params.client_id
        }, function(err, client) {
            if (err)
                res.send(err);

            clients.name = req.body.name;
            clients.password = req.body.password;
            clients.description = req.body.description;
            clients.client_id = req.body.client;
            clients.user_type = req.body.type;
            clients.timezone = req.body.timezone;
            clients.active = req.body.active;
        });
    });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}