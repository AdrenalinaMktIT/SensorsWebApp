module.exports = function(app) {

    let utils = require('../config/lib/utils');

    let Device = new require('./../models/device');
    let Measure = new require('./../models/measure');
    let Sensor  = new require('./../models/sensor');

    let async = new require('async');
    let _ = require('underscore');

    function xlsPdfExportQuery(dateFrom, dateTo, sensorIds, isXlsExport, callback) {

        let results = [];

        // assuming openFiles is an array of file names
        async.eachSeries(sensorIds, function(sensorId, callback) {


            Measure.aggregate([{
                $match: {
                    timestamp: {
                        $gte: new Date(dateFrom),
                        $lte: new Date(dateTo)
                    }
                }
            },
                {
                    $project: {
                        _id: 0,
                        imei: 1,
                        modelAndVersion: 1,
                        data: 1,
                        timestamp: 1
                    }
                },
                {
                    $sort: {
                        timestamp: -1
                    }
                },
                {
                    $lookup: {
                        from: 'devices',
                        localField: 'imei',
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
                        path: '$device.sensors',
                        includeArrayIndex: 'sensor_idx'
                    }
                },
                {
                    $match: {
                        //'model.sensors': sensorIds[i]
                        'device.sensors': sensorId
                    }
                },
                {
                    $unwind: {
                        path: '$data',
                        includeArrayIndex: 'data_idx'
                    }
                },
                {
                    $project: {
                        "data_idx": 1,
                        "sensor_idx": 1,
                        "data": 1,
                        "timestamp": 1,
                        sensor: "$device.sensors",
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
                }]).then(function(result) {

                results = results.concat(result);
                callback();

            }).catch(function (err) {
                console.log(err);
                callback(err);
            });

        }, function(err) {
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A file failed to process');
            } else {
                if (isXlsExport) {

                    utils.createXlsBinary(results, function(binary) {
                        callback(binary);
                    }, function(error) {
                        console.log('ERROR:' + error);
                    });

                } else {

                    utils.createPdfBinary(results, function(binary) {
                        callback(binary);
                    }, function(error) {
                        console.log('ERROR:' + error);
                    });

                }
            }
        });
    }

    // Calcular un nuevo reporte.
    app.post('/api/v1/lastSensorMeasures', function(req, res) {
        let sensorId = req.body.sensorId;
        let modelId = null;
        let imei = null;

        Device.find({
            sensors: sensorId
        }).lean().exec()
            .then(function (device) {
                imei = device[0]._id;

                if (imei) {

                    Measure.find({
                        imei: imei
                    })
                        .sort({'timestamp': -1})
                        .limit(20)
                        .populate({
                            path: 'imei',
                            model: 'Device',
                            populate: {
                                path: 'sensors',
                                model: 'Sensor'
                            }
                        })
                        .exec(function (err, measures) {
                            res.json(measures.reverse());
                        });
                }

            }).catch(function (err) {
            console.log(err);
        });
    });

    // Calcular un nuevo reporte.
    app.post('/api/v1/reports', function(req, res) {
        let sensorIds = req.body.sensors;

        let results = [];
        async.eachSeries(sensorIds, function(sensorId, callback) {

            let imei = null;

            Device.find({
                sensors: sensorId
            }).lean().exec()
                .then(function (device) {
                    imei = device[0]._id;

                    if (imei) {

                        Measure.find({
                            timestamp: { '$gte': new Date(req.body.dateFrom), '$lte': new Date(req.body.dateTo) },
                            imei: imei
                        })
                            .sort({'timestamp': -1})
                            //.limit(20)
                            .populate({
                                path: 'imei',
                                model: 'Device',
                                populate: {
                                    path: 'sensors',
                                    model: 'Sensor',
                                    populate: {
                                        path: 'type',
                                        model: 'Type'
                                    }
                                }
                            })
                            .lean().exec(function (err, measures) {
                            measures = _.filter(measures, function(measure){
                                let indexOfSensor = _.indexOf(_.pluck(measure.imei.sensors, '_id'), sensorId);
                                measure.data = measure.data[indexOfSensor];
                                measure.sensorId = sensorId;
                                measure.sensorName = measure.imei.sensors[indexOfSensor].name;
                                measure.sensorType = measure.imei.sensors[indexOfSensor].type;
                                return true;
                            });
                            results = results.concat(measures.reverse());
                            callback();
                        });
                    }

                }).catch(function (err) {
                console.log(err);
                callback(err);
            });

        }, function(err) {
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A file failed to process');
            } else {
                res.json(results);
            }
        });
    });

    app.get('/api/v1/status', function(req, res) {
        let imei;
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
            // unwind del campo de tipo array 'device.sensors' y ademas agrego el campo 'sensor_idx' con el indice de el arreglo.
            {
                $unwind: {
                    path: '$device.sensors',
                    includeArrayIndex: 'sensor_idx'
                }
            },
            {
                $project: {
                    "device.name": 1,
                    "model.name": 1,
                    "data_idx": 1,
                    "sensor_idx": 1,
                    sensor: "$device.sensors",
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
            }]).allowDiskUse(true)
             .exec(function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.json(result);
                    }
            });
    });

    // Reporte de Lecturas en formato xls (tipo Excel).
    app.post('/api/v1/xlsMeasureReport', function(req, res) {
        let dateFrom = req.body.dateFrom;
        let dateTo = req.body.dateTo;
        let sensorIds = req.body.sensors;
        let timeLapseInMinutes = req.body.timeLapseInMinutes;

        xlsPdfExportQuery(dateFrom, dateTo, sensorIds, true, function(binary) {
            res.contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(binary);
        }, function(error) {
            res.send('ERROR:' + error);
        });
    });

    // Reporte de Lecturas en formato pdf (tipo Acrobat Reader).
    app.post('/api/v1/pdfMeasureReport', function(req, res) {
        let dateFrom = req.body.dateFrom;
        let dateTo = req.body.dateTo;
        let sensorIds = req.body.sensors;
        let timeLapseInMinutes = req.body.timeLapseInMinutes;

        xlsPdfExportQuery(dateFrom, dateTo, sensorIds, false, function(binary) {
            res.contentType('application/pdf');
            res.send(binary);
        }, function(error) {
            res.send('ERROR:' + error);
        });
    });
};