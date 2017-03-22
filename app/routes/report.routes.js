module.exports = function(app) {

    var Device = require('./../models/device');
    var Measure = require('./../models/measure');
    var Model  = require('./../models/model');
    var Sensor  = require('./../models/sensor');

    // Calcular un nuevo reporte.
    app.post('/api/v1/reports', function(req, res) {
        var sensorIds = req.body.sensors;
        Measure.find({
            timestamp: { '$gte': new Date(req.body.dateFrom), '$lte': new Date(req.body.dateTo) }
        })
            .populate({
                path: 'imei',
                model: 'Device',
                populate: {
                    path: 'model',
                    model: 'Model',
                    populate: {
                        path: 'sensors',
                        model: 'Sensor',
                        match: {
                            _id: { $in: sensorIds }
                        }
                    }
                }
            })
            .exec(function (err, measures) {
                console.log(measures);
                res.json(measures.filter(function(doc){
                    return doc.imei.model.sensors.length;
                }));
            });
    });
};