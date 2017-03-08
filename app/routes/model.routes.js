module.exports = function(app) {

    var Model = require('./../models/model');

    // Obtener todos los modelos.
    app.get('/api/v1/models', function (req, res) {
        Model.find()
            .then(function (models) {
                res.status(200).json({
                    message: 'OK!. Modelos obtenidos correctamente.',
                    models: models
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    models: null
                });
            });
    });

    // TODO Crear un nuevo modelo.
    app.post('/api/v1/models', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Eliminar un modelo.
    app.delete('/api/v1/models/:model_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Obtener un modelo.
    app.get('/api/v1/models/:model_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Actualizar un modelo.
    app.put('/api/v1/models/:model_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });
};