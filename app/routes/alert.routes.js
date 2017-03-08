module.exports = function(app) {

    var Alert = require('./../models/alert');

    // Obtener todas las alertas.
    app.get('/api/v1/alerts', function(req, res) {
        Alert.find().populate('sensor profile').exec()
            .then(function (alerts) {
                res.status(200).json({
                    message: 'OK!. Alertas obtenidas correctamente.',
                    alerts: alerts
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    alerts: null
                });
            });
    });

    // TODO Crear una nueva alerta.
    app.post('/api/v1/alerts', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Eliminar una alerta.
    app.delete('/api/v1/alerts/:alert_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Obtener una alerta.
    app.get('/api/v1/alerts/:alert_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // TODO Actualizar una alerta.
    app.put('/api/v1/alerts/:alert_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });
};