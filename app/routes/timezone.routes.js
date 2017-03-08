module.exports = function(app) {

    var Timezone = require('./../models/timezone');

    // Obtener todos los husos horarios.
    app.get('/api/v1/timezones', function (req, res) {
        Timezone.find()
            .then(function (timezones) {
                res.status(200).json({
                    message: 'OK!. Husos horarios obtenidos correctamente.',
                    timezones: timezones
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    timezones: null
                });
            });
    });

    // Obtener un huso horario.
    app.get('/api/v1/timezones/:timezone_id', function(req, res) {
        Timezone.findById(req.params.timezone_id)
            .then(function (timezone) {
                if (!timezone) {
                    res.status(404).json({
                        message: 'No encontrado!. Huso horario inexistente.',
                        timezone: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Huso horario obtenido correctamente.',
                        timezone: timezone
                    });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    timezone: null
                });
            });
    });
};