module.exports = function(app) {

    var _ = require('underscore');

    var Calculation = require('./../models/calculation');
    var Device = require('./../models/device');
    var Measure = new require('./../models/measure');

    /*
     La fórmula para calcular el índice de temperatura-humedad (ITH) es:
     ITH = 0.8°Ta + ((humedad relativa del aire/100)*(Ta - 14.3)) + 46.4,
     donde Ta = temperatura del aire [ºC].
     La fórmula que se utiliza para calcular el índice está diseñada para dar un valor entre 70 y 80.
     Por lo general las personas se encuentran confortables cuando posee un valor de 70, y casi nadie se siente confortable si el índice posee un valor de 80.
     */
    var thiCalculation = function(tempData, humData) {
        return 0.8 * tempData + ((humData / 100) * (tempData - 14.3)) + 46.4;
    };

    // Obtener todos los posibles calculos.
    app.get('/api/v1/calculations', function(req, res) {
        Calculation.find({})
            .then(function (calculations) {
                res.status(200).json({
                    message: 'OK!. Calculos disponibles obtenidos correctamente.',
                    calculations: calculations
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    calculations: null
                });
            });
    });

    // Obtener los equipos disponibles para determinado tipo de calculo.
    app.get('/api/v1/calculations/:calc_id', function(req, res) {
        Calculation.findById(req.params.calc_id)
            .then(function (calculation) {
                if (!calculation) {
                    res.status(404).json({
                        message: 'No encontrado!. Calculo inexistente.',
                        calculation: null
                    });
                } else {
                    Device.find()
                        .populate({
                            path: 'model',
                            model: 'Model',
                            populate: {
                                path: 'sensors',
                                model: 'Sensor'
                            }
                        })
                        .then(function (devices) {
                            var validDevices = [];
                            devices.forEach(function(device, index, arr) {
                                var sensorTypes = _.pluck(device.model.sensors, 'type');
                                var validDevice = _.every(calculation.required_sensors, function(reqSensor) {
                                    return _.contains(sensorTypes, reqSensor);
                                });
                                if (validDevice) {
                                    validDevices.push(device);
                                }
                            });

                            res.status(200).json({
                                message: 'OK!. Equipos obtenidos correctamente.',
                                devices: validDevices
                            });
                        })
                        .catch(function (err) {
                            res.status(500).json({
                                message: 'Error interno de servidor. Por favor, intente nuevamente.',
                                devices: null
                            });
                        });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    calculation: null
                });
            });
    });

    //  Calculo de Indice de Temperatura-Humedad (ITH).
    app.post('/api/v1/calculations/thi', function(req, res) {
        var deviceImei = req.body.deviceImei;
        var temperatureSensorIdx = req.body.temperatureSensorIdx;
        var humiditySensorIdx = req.body.humiditySensorIdx;
        Measure.find({
            imei: deviceImei,
            timestamp: { '$gte': new Date(req.body.dateFrom), '$lte': new Date(req.body.dateTo) }
        }).sort({ timestamp: 1 })
            .then(function (measures) {
                var thiCalcs = [];
                measures.forEach(function(measure, index, arr) {
                    var thiCalc = thiCalculation(measure.data[temperatureSensorIdx], measure.data[humiditySensorIdx]);
                    thiCalcs.push({
                        "timestamp": measure.timestamp,
                        "thiCalc": thiCalc
                    });
                });

                res.status(200).json({
                    message: 'OK!. Calculos de Indice Temperatura-Humedad.',
                    thiCalcs: thiCalcs
                });
            })
            .catch(function (err) {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    thiCalcs: null
                });
            });
    });
};