module.exports = function(app) {

    let Device = require('./../models/device');
    let Model = require('./../models/model');
    let Sensor = require('./../models/sensor');
    let mongoose = require('mongoose'),
        Schema = mongoose.Schema;


    // Obtener todos los equipos.
    app.get('/api/v1/devices', function(req, res) {
        Device.find().populate('model sensors client_id').exec()
            .then(function (devices) {
                res.status(200).json({
                    message: 'OK!. Equipos obtenidos correctamente.',
                    devices: devices
                });
            })
            .catch(function (err) {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    cause: err
                });
            });
    });

     app.post('/api/v1/devices', function(req, res) {
         Device.findOne({ 'name' :  req.body.name })
             .then(function(device) {
                 if (device) {
                     res.status(409).json({
                         message: 'Conflicto!. Equipo existente.',
                         user: null
                     });
                 } else {
                     var newDevice = new Device();
                     newDevice._id = req.body.id;
                     newDevice.name = req.body.name;
                     newDevice.client_id = req.body.client;
                     newDevice.timezone_id = req.body.timezone;
                     newDevice.active = req.body.active;
                     newDevice.model = req.body.model;
                     newDevice.cell_number = req.body.cell_number;
                     newDevice.carrier = req.body.carrier;
                     newDevice.sensors = [null, null, null, null, null, null, null, null, null, null];

                    /* Model.findOne({ '_id' : newDevice.model._id })
                         .then(function(model) {*/
                             //var sensors = [null, null, null, null, null, null, null, null, null, null];
                             req.body.model.sensors_config.forEach(function(item){
                                 var sensor = new Sensor();
                                 sensor.name = req.body.id  + "/" + item.position.type;
                                 sensor.type = item.type;
                                 sensor.save();
                                 newDevice.sensors[item.position] = sensor._id;
                             });

                     newDevice.save()
                         .then(function(newDevice) {
                             res.status(201).json({
                                 message: 'OK!. Usuario creado correctamente.',
                                 device: newDevice
                             });
                         })
                         .catch(function () {
                             res.status(500).json({
                                 message: 'Error interno de servidor. Por favor, intente nuevamente.',
                                 device: null
                             });
                         });
                 }
             })
             .catch(function () {
                 res.status(500).json({
                     message: 'Error interno de servidor. Por favor, intente nuevamente.',
                     device: null
                 });
             });
    });

    // TODO Eliminar un equipo.
    app.delete('/api/v1/devices/:device_id', function(req, res) {
        Device.findByIdAndRemove(req.params.device_id)
            .then(function(device) {
                if (!device) {
                    res.status(404).json({
                        message: 'No encontrado!. Equipo inexistente.',
                        device: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Equipo eliminado correctamente.',
                        device: device
                    });
                    device.sensors.forEach(function(item){
                        if (item != null){
                            Sensor.findByIdAndRemove(item)
                                .then(function(sensor){
                                    sensor.remove();
                                });
                        }
                    });
                    device.remove();
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    user: null
                });
            });
    });

    // TODO Obtener un equipo.
    app.get('/api/v1/devices/:device_id', function(req, res) {
        Device.findById(req.params.device_id)
            .then(function (device) {
                if (!device) {
                    res.status(404).json({
                        message: 'No encontrado!. Equipo inexistente.',
                        device: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Equipo obtenido correctamente.',
                        device: device
                    });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    device: null
                });
            });
    });

    // TODO Actualizar un equipo.
    app.put('/api/v1/devices/:device_id', function(req, res) {
        res.status(501).json({
            message: 'No implementado'
        });
    });
};