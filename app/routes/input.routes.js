module.exports = function(app) {

    let Input = require('./../models/inputs');

    // Obtener todos los ingresos.
    app.get('/api/v1/inputs', function(req, res) {
        Input.find().lean().exec()
            .then(function (inputs) {
                res.status(200).json({
                    message: 'OK!. Ingresos obtenidos correctamente.',
                    inputs: inputs
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    inputs: null
                });
            });
    });
};