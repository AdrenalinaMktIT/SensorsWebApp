module.exports = function(app) {

    var Client = require('./../models/client');

    // Obtener todos los clientes.
    app.get('/api/v1/clients', function(req, res) {
        Client.find({})
            .then(function (clients) {
                res.status(200).json({
                    message: 'OK!. Clientes obtenidos correctamente.',
                    clients: clients
                });
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    clients: null
                });
            });
    });

    // Crear un nuevo cliente.
    app.post('/api/v1/clients', function(req, res) {
        Client.findOne({ 'name' :  req.body.name })
            .then(function(client) {
                if (client) {
                    res.status(409).json({
                        message: 'Conflicto!. Cliente existente.',
                        client: null
                    });
                } else {
                    var newClient = new Client();
                    newClient.name = req.body.name;
                    newClient.app_id = req.body.app_id;
                    newClient.logo = req.body.logo;
                    newClient.css = req.body.css;
                    newClient.pdf_certified = req.body.pdf_certified.type;
                    newClient.active = req.body.active;

                    newClient.save()
                        .then(function(client) {
                            res.status(201).json({
                                message: 'OK!. Cliente creado correctamente.',
                                client: client
                            });
                        })
                        .catch(function () {
                            res.status(500).json({
                                message: 'Error interno de servidor. Por favor, intente nuevamente.',
                                client: null
                            });
                        });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    client: null
                });
            });
    });

    // Eliminar un cliente.
    app.delete('/api/v1/clients/:client_id', function(req, res) {
        Client.findByIdAndRemove(req.params.client_id)
            .then(function(client) {
                if (!client) {
                    res.status(404).json({
                        message: 'No encontrado!. Cliente inexistente.',
                        client: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Cliente eliminado correctamente.',
                        client: client
                    });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    client: null
                });
            });
    });

    // Obtener un cliente.
    app.get('/api/v1/clients/:client_id', function(req, res) {
        Client.findById(req.params.client_id)
            .then(function (client) {
                if (!client) {
                    res.status(404).json({
                        message: 'No encontrado!. Cliente inexistente.',
                        client: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Cliente obtenido correctamente.',
                        client: client
                    });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    client: null
                });
            });
    });

    // Obtener los calculos diponibles asociados a un cliente.
    app.get('/api/v1/clients/getAssociatedCalculations/:client_id', function(req, res) {
        Client.findById(req.params.client_id).populate('available_calculations')
            .then(function (client) {
                if (!client) {
                    res.status(404).json({
                        message: 'No encontrado!. Calculos del cliente inexistentes.',
                        calculations: null
                    });
                } else {
                    res.status(200).json({
                        message: 'OK!. Calculos del cliente obtenidos correctamente.',
                        calculations: client.available_calculations
                    });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    calculations: null
                });
            });
    });

    // Actualizar un cliente.
    app.put('/api/v1/clients/:client_id', function(req, res) {
        Client.findById(req.params.client_id)
            .then(function(client) {
                if (!client) {
                    res.status(404).json({
                        message: 'No encontrado!. Usuario inexistente.',
                        client: null
                    });
                } else {
                    // TODO chequear que si se cambio el nombre, este no exista en la base de datos.
                    client.name = req.body.name || client.name;
                    client.app_id = req.body.app_id || client.app_id;
                    client.logo = req.body.logo || client.logo;
                    client.css = req.body.css || client.css;
                    client.pdf_certified = req.body.pdf_certified.type || client.pdf_certified;
                    client.active = req.body.active || client.active;

                    client.save()
                        .then(function (client) {
                            res.status(200).json({
                                message: 'OK!. Cliente actualizado correctamente.',
                                client: client
                            })
                        })
                        .catch(function () {
                            res.status(500).json({
                                message: 'Error interno de servidor. Por favor, intente nuevamente.',
                                client: null
                            });
                        });
                }
            })
            .catch(function () {
                res.status(500).json({
                    message: 'Error interno de servidor. Por favor, intente nuevamente.',
                    client: null
                });
            });
    });
};