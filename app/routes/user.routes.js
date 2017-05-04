module.exports = function(app) {

    var User = require('./../models/user');

    // Obtener todos los usuarios.
    app.get('/api/v1/users', function(req, res) {
        User.find({})
            .then(function (users) {
                res.status(200).json({
                    message: 'OK!. Usuarios obtenidos correctamente.',
                    users: users
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    users: null
                });
            });
    });

    // Obtener los usuarios filtrando por cliente.
    app.get('/api/v1/users/client/:clientId', function (req, res) {
        User.find({"client_id": req.params.clientId}).populate('client_id').exec()
            .then(function (users) {
                res.status(200).json({
                    message: 'OK!. Usuarios obtenidos correctamente.',
                    users: users
                });
            })
            .catch(function (err) {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    users: null
                });
            });
    });

    // Crear un nuevo usuario.
    app.post('/api/v1/users', function(req, res) {
        User.findOne({ 'name' :  req.body.name })
            .then(function(user) {
                if (user) {
                    res.status(409).json({
                        message: 'Conflicto!. Usuario existente.',
                        user: null
                    });
                } else {
                    var newUser = new User();
                    newUser.name = req.body.name;
                    newUser.password = newUser.generateHash(req.body.password);
                    newUser.description = req.body.description;
                    newUser.client_id = req.body.client;
                    newUser.user_type = req.body.type;
                    newUser.timezone_id = req.body.timezone;
                    newUser.active = req.body.active;

                    newUser.save()
                        .then(function(user) {
                            res.status(201).json({
                                message: 'OK!. Usuario creado correctamente.',
                                user: user
                            });
                        })
                        .catch(function () {
                            res.status(500).json({
                                message: 'Error interno de servidor. Por favor, intente nuevamente.',
                                user: null
                            });
                        });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    user: null
                });
            });
    });

    // Eliminar un usuario.
    app.delete('/api/v1/users/:user_id', function(req, res) {
        User.findByIdAndRemove(req.params.user_id)
            .then(function(user) {
                if (!user) {
                    res.status(404).json({
                        message: 'No encontrado!. Usuario inexistente.',
                        user: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Usuario eliminado correctamente.',
                        user: user
                    });
                    user.remove();
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    user: null
                });
            });
    });

    // Obtener un usuario.
    app.get('/api/v1/users/:user_id', function(req, res) {
        User.findById(req.params.user_id)
            .then(function (user) {
                if (!user) {
                    res.status(404).json({
                        message: 'No encontrado!. Usuario inexistente.',
                        user: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Usuario obtenido correctamente.',
                        user: user
                    });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    user: null
                });
            });
    });

    // Actualizar un usuario.
    app.put('/api/v1/users/:user_id', function(req, res) {
        User.findById(req.params.user_id)
            .then(function(user) {
                if (!user) {
                    res.status(404).json({
                        message: 'No encontrado!. Usuario inexistente.',
                        user: null
                    });
                } else {
                    // TODO chequear que si se cambio el nombre, este no exista en la base de datos.
                    user.name = req.body.name || user.name;
                    user.password = user.generateHash(req.body.password) || user.password;
                    user.description = req.body.description || user.description;
                    user.client_id = req.body.client || user.client_id;
                    user.user_type = req.body.type || user.user_type;
                    user.timezone_id = req.body.timezone || user.timezone_id;
                    user.active = req.body.active;

                    user.save()
                        .then(function (user) {
                            res.status(200).json({
                                message: 'OK!. Usuario actualizado correctamente.',
                                user: user
                            })
                        })
                        .catch(function () {
                            res.status(500).json({
                                message: 'Error interno de servidor. Por favor, intente nuevamente.',
                                user: null
                            });
                        });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    user: null
                });
            });
    });
};