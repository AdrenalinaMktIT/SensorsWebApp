module.exports = function(app) {

    var Device = new require('./../models/device');
    var Measure = new require('./../models/measure');
    var Model  = new require('./../models/model');
    var Sensor  = new require('./../models/sensor');

    // Calcular un nuevo reporte.
    app.post('/api/v1/reports', function(req, res) {
        var sensorIds = req.body.sensors;
        Measure.find({
            timestamp: { '$gte': new Date(req.body.dateFrom), '$lte': new Date(req.body.dateTo) }
        })
            .sort({'timestamp': -1})
            .limit(20)
            .populate({
                path: 'imei',
                model: 'Device',
                populate: {
                    path: 'model',
                    model: 'Model',
                    populate: {
                        path: 'sensors',
                        model: 'Sensor'/*,
                        match: {
                            _id: { $in: sensorIds }
                        }*/
                    }
                }
            })
            .exec(function (err, measures) {
                measures.reverse();
                res.json(measures.filter(function(doc){
                    return doc.imei.model.sensors.length;
                }));
            });
    });

    app.get('/api/v1/status', function(req, res) {
        var sensorIds = [], modelId, sensorIdx, imei, sensorAndModels = [];
        var jsonResponse = '';
        // busco los ids de todos los sensores y los guardo en un arreglo.

        Measure.aggregate([{
            $project: {
                _id: 0,
                imei: 1,
                data: 1,
                timestamp: 1
            }
        },
            {
                $sort: {
                    imei: -1,
                    timestamp: -1
                }
            },
            {
                $group: {
                    _id: "$imei",
                    last_measure_by_device: {
                        $first: "$$ROOT"
                    }
                }
            },
            {
                $lookup: {
                    from: 'devices',
                    localField: 'last_measure_by_device.imei',
                    foreignField: '_id',
                    as: 'device'
                }
            },
            {
                $unwind: "$device"
            },
            {
                $lookup: {
                    from: 'models',
                    localField: 'device.model',
                    foreignField: '_id',
                    as: 'model'
                }
            },
            {
                $unwind: "$model"
            },
            {
                $unwind: {
                    path: '$last_measure_by_device.data',
                    includeArrayIndex: 'data_idx'
                }
            },
            {
                $unwind: {
                    path: '$model.sensors',
                    includeArrayIndex: 'sensor_idx'
                }
            },
            {
                $project: {
                    "device.name": 1,
                    "model.name": 1,
                    "data_idx": 1,
                    "sensor_idx": 1,
                    sensor: "$model.sensors",
                    data: "$last_measure_by_device.data",
                    timestamp: "$last_measure_by_device.timestamp",
                    cmp_data_and_sensor_idx: {
                        $cmp: ['$data_idx',
                            '$sensor_idx']
                    }
                }
            },
            {
                $match: {
                    cmp_data_and_sensor_idx: 0
                }
            },
            {
                $project: {
                    "device": 1,
                    "model": 1,
                    "sensor": 1,
                    "data": 1,
                    "timestamp": 1
                }
            },
            {
                $lookup: {
                    from: 'sensors',
                    localField: 'sensor',
                    foreignField: '_id',
                    as: 'sensor'
                }
            },
            {
                $unwind: "$sensor"
            },
            {
                $lookup: {
                    from: 'types',
                    localField: 'sensor.type',
                    foreignField: '_id',
                    as: 'sensor.type'
                }
            },
            {
                $unwind: "$sensor.type"
            }], function (err, result) {
            if (err) {
                next(err);
            } else {
                res.json(result);
            }
        });
    });
};