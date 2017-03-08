module.exports = function(app) {

    var Type = require('./../models/type');

    // Obtener todos los tipos de sensor.
    app.get('/api/v1/types', function (req, res) {
        Type.find()
            .then(function (types) {
                res.status(200).json({
                    message: 'OK!. Tipos de sensor obtenidos correctamente.',
                    types: types
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    types: null
                });
            });
    });

    // Obtener un tipo de sensor.
    app.get('/api/v1/types/:type_id', function(req, res) {
        Type.findById(req.params.type_id)
            .then(function (type) {
                if (!type) {
                    res.status(404).json({
                        message: 'No encontrado!. Tipo de sensor inexistente.',
                        type: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Tipo de sensor obtenido correctamente.',
                        type: type
                    });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    type: null
                });
            });
    });
};