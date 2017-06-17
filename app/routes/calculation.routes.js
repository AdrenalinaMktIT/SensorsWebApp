module.exports = function(app) {

    var _ = require('underscore');

    // load math.js
    var math = new require('mathjs');

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

    /*
     Potencia activa “P” [W].
     Se busca expresar la potencia activa en KWh ya que de esta forma se
     expresan los resultados en las facturas de los proveedores de energía
     eléctrica.
     P[KWh] = P_promedio / 1000
     donde
     P__promedio = V__promedio * I__promedio * cos(phi)_promedio
     ---------------------------------------------------------------------------
     Potencia aparente “S” [VA]
     S[KVAh] = S__promedio / 1000
     donde
     S_promedio = V_promedio * I_promedio
     ---------------------------------------------------------------------------
     Potencia reactiva “Q” [VAr]
     Q[KVArh] = Q_promedio / 1000
     donde
     Q_promedio = V_promedio * I_promedio * sen(phi)_promedio
     */
    var paraCalculation = function(voltageSensorData, currentSensorData, phaseAngleSensorData) {
        var paraCalcs = {};

        var meanVoltage = math.mean(voltageSensorData);
        var meanCurrent = math.mean(currentSensorData);
        var meanCosPhaseAngle = math.mean(math.cos(phaseAngleSensorData));
        var meanSinPhaseAngle = math.mean(math.sin(phaseAngleSensorData));

        var meanP = math.chain(meanVoltage)
            .multiply(meanCurrent)
            .multiply(meanCosPhaseAngle)
            .divide(1000)
            .done();     // P[KWh]

        var meanS = math.chain(meanVoltage)
            .multiply(meanCurrent)
            .divide(1000)
            .done();     // S[KVAh]

        var meanQ = math.chain(meanVoltage)
            .multiply(meanCurrent)
            .multiply(meanSinPhaseAngle)
            .divide(1000)
            .done();     // Q[KVArh]

        paraCalcs.meanP = meanP;
        paraCalcs.meanS = meanS;
        paraCalcs.meanQ = meanQ;

        return paraCalcs;

    };

    // Obtener todos los posibles calculos.
    app.get('/api/v1/calculations', function(req, res) {
        Calculation.find({}).populate('required_sensors')
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

    //  Calculo de Potencia Activa/Reactiva/Aparente (PARA).
    app.post('/api/v1/calculations/para', function(req, res) {
        var deviceImei = req.body.deviceImei;
        var voltageSensorIdx = req.body.voltageSensorIdx;
        var currentSensorIdx = req.body.currentSensorIdx;
        var phaseAngleSensorIdx = req.body.phaseAngleSensorIdx;

        Measure.find({
            imei: deviceImei,
            timestamp: { '$gte': new Date(req.body.dateFrom), '$lte': new Date(req.body.dateTo) }
        }).sort({ timestamp: 1 })
            .then(function (measures) {

                var voltageSensorData = [];
                var currentSensorData = [];
                var phaseAngleSensorData = [];

                measures.forEach(function(measure, index, arr) {
                    voltageSensorData.push(measure.data[voltageSensorIdx]);
                    currentSensorData.push(measure.data[currentSensorIdx]);
                    phaseAngleSensorData.push(measure.data[phaseAngleSensorIdx]);
                });
                var paraCalcs = paraCalculation(voltageSensorData, currentSensorData, phaseAngleSensorData);

                res.status(200).json({
                    message: 'OK!. Calculos de Potencia Activa/Reactiva/Aparente.',
                    paraCalcs: paraCalcs
                });
            })
            .catch(function (err) {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    paraCalcs: null
                });
            });
    });
};