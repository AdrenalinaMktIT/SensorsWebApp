module.exports = function(app) {

    var Device = require('./../models/device');
    var Measure = require('./../models/measure');
    var Model  = require('./../models/model');
    var Sensor  = require('./../models/sensor');

    // Calcular un nuevo reporte.
    app.post('/api/v1/reports', function(req, res) {
        Measure.find({
            imei: 292207061990001,
            /*timestamp: { '$gte': req.body.dateFrom, '$lte': req.body.dateTo }*/

        })
            .populate({
                path: 'imei',
                model: 'Device',
                populate: {
                    path: 'model',
                    model: 'Model',
                    populate: {
                        path: 'sensors',
                        model: 'Sensor'
                    }
                }
            })
            .exec(function (err, measures) {
                console.log(measures);
                res.json(measures);
            });
    });
};