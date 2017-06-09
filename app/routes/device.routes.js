module.exports = function(app) {

    let Device = require('./../models/device');

    // Obtener todos los equipos.
    app.get('/api/v1/devices', function(req, res) {
        Device.find().populate('model sensors client_id').exec()
            .then(function (devices) {
                res.status(200).json({
                    message: 'OK!. Alertas obtenidas correctamente.',
                    devices: devices
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    devices: null
                });
            });
    });

    // TODO Crear un nuevo equipo.
    app.post('/api/v1/devices', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Eliminar un equipo.
    app.delete('/api/v1/devices/:device_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Obtener un equipo.
    app.get('/api/v1/devices/:device_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Actualizar un equipo.
    app.put('/api/v1/devices/:device_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });
};