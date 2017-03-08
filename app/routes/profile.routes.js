module.exports = function(app) {

    var Profile = require('./../models/profile');

    // Obtener todos los perfiles.
    app.get('/api/v1/profiles', function (req, res) {
        Profile.find().populate('carrier timezone_id').exec()
            .then(function (profiles) {
                res.status(200).json({
                    message: 'OK!. Perfiles obtenidos correctamente.',
                    profiles: profiles
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    profiles: null
                });
            });
    });

    // TODO Crear un nuevo perfil.
    app.post('/api/v1/profiles', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Eliminar un perfil.
    app.delete('/api/v1/profiles/:profile_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Obtener un perfil.
    app.get('/api/v1/profiles/:profile_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Actualizar un perfil.
    app.put('/api/v1/profiles/:profile_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });
};