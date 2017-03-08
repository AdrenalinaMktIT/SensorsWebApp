module.exports = function(app) {

    var Carrier = require('./../models/carrier');

    // Obtener todos los proveedores de companias moviles.
    app.get('/api/v1/carriers', function(req, res) {
        Carrier.find({})
            .then(function (carriers) {
                res.status(200).json({
                    message: 'OK!. Companias moviles obtenidas correctamente.',
                    carriers: carriers
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    carriers: null
                });
            });
    });
};