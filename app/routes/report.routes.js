module.exports = function(app) {

    var Device = new require('./../models/device');
    var Measure = new require('./../models/measure');
    var Model  = new require('./../models/model');
    var Sensor  = new require('./../models/sensor');

    // Calcular un nuevo reporte.
    app.post('/api/v1/lastSensorMeasures', function(req, res) {
        var sensorId = req.body.sensorId;
        var modelId = null;
        var imei = null;

        Model.find({
            sensors: sensorId
        }).lean().exec()
            .then(function (model) {
                modelId = model[0]._id;

                if (modelId) {
                    Device.find({
                        model: modelId
                    }).lean().exec()
                        .then(function (device) {
                            imei = device[0]._id;

                            if (imei) {

                                Measure.find({
                                    /*timestamp: { '$gte': new Date(req.body.dateFrom), '$lte': new Date(req.body.dateTo) },*/
                                    imei: imei
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
                                                model: 'Sensor'
                                            }
                                        }
                                    })
                                    .exec(function (err, measures) {
                                        measures.reverse();
                                        res.json(measures.filter(function(doc){
                                            return doc.imei.model._id === modelId;
                                        }));
                                    });

                            }

                        }).catch(function (err) {
                        console.log(err);
                    });
                }

            }).catch(function (err) {
            console.log(err);
        });
    });

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
                        model: 'Sensor',
                        match: {
                            _id: { $in: sensorIds }
                        }
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
            // proyecto solo las propiedades imei, data y timestamp de la coleccion 'measures'.
            $project: {
                _id: 0,
                imei: 1,
                data: 1,
                timestamp: 1
            }
        },
            //  ordeno por orden descendiente por imei y luego por timestamp.
            {
                $sort: {
                    imei: -1,
                    timestamp: -1
                }
            },
            //  agrupo por numero de imei quedandome con las lecturas mas recientes y agrego nueva clave 'last_measure_by_device' que contiene los campos imei, data y timestamp.
            {
                $group: {
                    _id: "$imei",
                    last_measure_by_device: {
                        $first: "$$ROOT"
                    }
                }
            },
            // creo un nuevo campo 'device' en el resultado donde cargo la entidad equipo correspondiente al imei.
            {
                $lookup: {
                    from: 'devices',
                    localField: 'last_measure_by_device.imei',
                    foreignField: '_id',
                    as: 'device'
                }
            },
            // unwind ya que el campo de tipo array 'device' tiene un unico valor que matchea.
            {
                $unwind: "$device"
            },
            // cargo en la referencia 'device.model' la entidad modelo correspondiente al equipo.
            {
                $lookup: {
                    from: 'models',
                    localField: 'device.model',
                    foreignField: '_id',
                    as: 'model'
                }
            },
            // unwind ya que el campo de tipo array 'device.model' tiene un unico valor que matchea.
            {
                $unwind: "$model"
            },
            // unwind del campo de tipo array 'last_measure_by_device.data' y ademas agrego el campo 'data_idx' con el indice de el arreglo.
            {
                $unwind: {
                    path: '$last_measure_by_device.data',
                    includeArrayIndex: 'data_idx'
                }
            },
            // unwind del campo de tipo array 'model.sensors' y ademas agrego el campo 'sensor_idx' con el indice de el arreglo.
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
            // me quedo solo con las lecturas para los cuales los indices de data y sensor coincidan.
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