module.exports = function(app) {

    var Alert = require('./../models/alert');
    var Sensor = require('./../models/sensor');
    var Profile = require('./../models/profile');

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

    // Crea una nueva alerta
    app.post('/api/v1/alerts', function(req, res) {
        Alert.findOne({ 'name' :  req.body.name })
            .then(function(alert) {
                if (alert) {
                    res.status(409).json({
                        message: 'Conflicto!. Alerta existente.',
                        user: null
                    });
                } else {
                    var newAlert = new Alert();
                    newAlert.name = req.body.name;
                    newAlert.Sensor = Sensor.findOne({'_id' : req.body.sensor._id});
                    newAlert.Profile = Profile.findOne({'_id' : req.body.profile._id});
                    newAlert.greater_than =  req.body.greater_than;
                    newAlert.less_than =  req.body.less_than;

                    newAlert.save()
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

    // TODO Eliminar una alerta.
    app.delete('/api/v1/alerts/:alert_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });

    // Obtener una alerta.
    app.get('/api/v1/alerts/:alert_id', function(req, res) {
        Alert.findById(req.params.alert_id)
            .then(function (alert) {
                if (!alert) {
                    res.status(404).json({
                        message: 'No encontrada!. Alerta inexistente.',
                        alert: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Alerta obtenido correctamente.',
                        alert: alert
                    });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    alert: null
                });
            });
    });

    // TODO Actualizar una alerta.
    app.put('/api/v1/alerts/:alert_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });
};