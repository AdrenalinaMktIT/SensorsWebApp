module.exports = function(app) {

    let Model = require('./../models/model');

    // Obtener todos los modelos.
    app.get('/api/v1/models', function (req, res) {
        Model.find().populate('sensors_config.type').exec()
            .then(function (models) {
                res.status(200).json({
                    message: 'OK!. Modelos obtenidos correctamente.',
                    models: models
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    models: null
                });
            });
    });

    // Crear un nuevo modelo.
    app.post('/api/v1/models', function(req, res) {
        Model.findOne({ 'name' :  req.body.name })
            .then(function(model) {
                if (model) {
                    res.status(409).json({
                        message: 'Conflicto!. Modelo existente.',
                        model: model
                    });
                } else {
                    let newModel = new Model();
                    newModel.name = req.body.name;
                    newModel.sensors_config = req.body.sensors_config;

                    newModel.save()
                        .then(function(model) {
                            res.status(201).json({
                                message: 'OK!. Modelo creado correctamente.',
                                model: model
                            });
                        })
                        .catch(function (err) {
                            res.status(500).json({
                                message: 'Error interno de servidor. Por favor, intente nuevamente.',
                                cause: err
                            });
                        });
                }
            })
            .catch(function (err) {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    cause: err
                });
            });
    });

    // Eliminar un modelo.
    app.delete('/api/v1/models/:model_id', function(req, res) {
        Model.findByIdAndRemove(req.params.model_id)
            .then(function(model) {
                if (!model) {
                    res.status(404).json({
                        message: 'No encontrado!. Modelo inexistente.',
                        model: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Modelo eliminado correctamente.',
                        model: model
                    });
                    model.remove();
                }
            })
            .catch(function (err) {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    cause: err
                });
            });
    });

    // Obtener un modelo.
    app.get('/api/v1/models/:model_id', function(req, res) {
        Model.findById(req.params.model_id).populate('sensors_config.type').exec()
            .then(function (model) {
                if (!model) {
                    res.status(404).json({
                        message: 'No encontrado!. Modelo inexistente.',
                        model: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Modelo obtenido correctamente.',
                        model: model
                    });
                }
            })
            .catch(function (err) {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    cause: err
                });
            });
    });

    // Actualizar un modelo.
    app.put('/api/v1/models/:model_id', function(req, res) {
        Model.findById(req.params.model_id)
            .then(function(model) {
                if (!model) {
                    res.status(404).json({
                        message: 'No encontrado!. Modelo inexistente.',
                        model: null
                    });
                } else {
                    // TODO chequear que si se cambio el nombre, este no exista en la base de datos.
                    model.name = req.body.name || model.name;
                    model.sensors_config = req.body.sensors_config || model.sensors_config;

                    model.save()
                        .then(function (model) {
                            res.status(200).json({
                                message: 'OK!. Modelo actualizado correctamente.',
                                model: model
                            })
                        })
                        .catch(function (err) {
                            res.status(500).json({
                                message: 'Error interno de servidor. Por favor, intente nuevamente.',
                                cause: err
                            });
                        });
                }
            })
            .catch(function (err) {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    cause: err
                });
            });
    });
};