module.exports = function(app) {

    var Group = require('./../models/group');

    // Obtener todos los grupos.
    app.get('/api/v1/groups', function(req, res) {
        Group.find()
            .then(function (groups) {
                res.status(200).json({
                    message: 'OK!. Grupos obtenidos correctamente.',
                    groups: groups
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    groups: null
                });
            });
    });

    // TODO Crear un nuevo grupo.
    app.post('/api/v1/groups', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Eliminar un grupo.
    app.delete('/api/v1/groups/:group_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Obtener un grupo.
    app.get('/api/v1/groups/:group_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Actualizar un grupo.
    app.put('/api/v1/groups/:group_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });
};