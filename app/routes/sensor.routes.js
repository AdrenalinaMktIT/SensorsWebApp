module.exports = function(app) {

    var Sensor = require('./../models/sensor');

    // Obtener todos los sensores.
    app.get('/api/v1/sensors', function (req, res) {
        Sensor.find().populate('type group').exec()
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