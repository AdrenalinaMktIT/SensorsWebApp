module.exports = function(app) {

    var Sensor = require('./../models/sensor');

    // Obtener todos los sensores.
    app.get('/api/v1/sensors', function (req, res) {
        Sensor.find().populate('type group').sort({'group.name': 1}).exec()
            .then(function (sensors) {
                res.status(200).json({
                    message: 'OK!. Sensores obtenidos correctamente.',
                    sensors: sensors
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    sensors: null
                });
            });
    });

    // Obtener los sensores filtrando por tipo.
    app.get('/api/v1/sensors/type/:type_id', function (req, res) {
        Sensor.find({"type": req.params.type_id}).populate('group').exec()
            .then(function (sensors) {
                res.status(200).json({
                    message: 'OK!. Sensores obtenidos correctamente.',
                    sensors: sensors
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    sensors: null
                });
            });
    });

    // TODO Crear un nuevo sensor.
    app.post('/api/v1/sensors', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Eliminar un sensor.
    app.delete('/api/v1/sensors/:sensor_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Obtener un sensor.
    app.get('/api/v1/sensors/:sensor_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Actualizar un sensor.
    app.put('/api/v1/sensors/:sensor_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });
};