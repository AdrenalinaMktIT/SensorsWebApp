angular.module('sensorController', [])

// inject the Sensor service factory into our controller
    .controller('SensorCtrl', function ($http, $uibModal, $log, Sensors) {

        var vm = this;

        vm.formData = {};

        vm.lang = 'es';

        vm.gridOptions = {
            enableSorting: true,
            /*paginationPageSizes: [25, 50, 75],
             paginationPageSize: 25,*/
            gridMenuShowHideColumns: false,
            enableFiltering: true,
            /*enableRowHeaderSelection: true,*/
            showGridFooter: true,
            columnDefs: [
                { field: 'name', displayName: 'NOMBRE', enableHiding: false },
                { field: 'description', displayName: 'DESCRIPCION', enableHiding: false },
                { field: 'image', displayName: 'TIPO', enableHiding: false },
                { field: 'crud', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, enableSorting: false,
                    cellTemplate:
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button>' }
            ],
            enableGridMenu: true
        };

        // GET =====================================================================
        // when landing on the page, get all sensors and show them
        // use the service to get all the sensors
        loadSensors();

        function loadSensors() {
            Sensors.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.sensors = response.data;
                    console.log(response.data);
                    vm.gridOptions.data = response.data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }

        // CREATE ==================================================================
        // when submitting the add form, send the text to the node API
        vm.createSensor = function() {

            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject(vm.formData)) {

                // call the create function from our service (returns a promise object)
                Sensors.create(vm.formData)

                // if successful creation, call our get function to get all the new sensors
                    .then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        vm.formData = {}; // clear the form so our sensor is ready to enter another
                        vm.sensors = response.data;
                        console.log(response.data);
                        vm.gridOptions.data = response.data;
                    }, function errorCallback(response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        console.log('Error: ' + response);
                    });
            }
        };

        // UPDATE ==================================================================
        vm.openModal = function (id, mode) {

            var vm = this;

            vm.mode = mode;

            if (mode != 'add') {

                //vm.getSensor(id);
                Sensors.get(id)
                // if successful creation, call our get function to get all the new sensors
                    .then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        //vm.sensor = response.data[0];

                        vm.id = response.data[0]._id;
                        vm.name = response.data[0].name;
                        vm.password = response.data[0].password;
                        vm.description = response.data[0].description;
                        vm.client = response.data[0].client_id;
                        vm.type = response.data[0].sensor_type;
                        vm.timezone = response.data[0].timezone_id;
                        vm.active = response.data[0].active;

                        var sensor = {
                            sensorId: vm.id,
                            name: vm.name,
                            password: vm.password,
                            description: vm.description,
                            client: vm.client,
                            type: vm.type,
                            timezone: vm.timezone,
                            active: vm.active
                        };

                        var modalInstance = $uibModal.open({
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'myModalContent.html',
                            controller: 'ModalInstanceCtrl',
                            controllerAs: 'vm',
                            size: 'lg',
                            //appendTo: parentElem,
                            resolve: {
                                sensor: function () {
                                    return sensor;
                                },
                                mode: function () {
                                    return mode;
                                }
                            }
                        });

                        modalInstance.result.then(function (data) {
                            switch (data.mode) {
                                case 'read':
                                    break;
                                case 'update':
                                    var sensorData = {
                                        sensorId: data.sensor.sensorId,
                                        name: data.sensor.name,
                                        password: data.sensor.password,
                                        description: data.sensor.description,
                                        client: data.sensor.client._id,
                                        type: data.sensor.type,
                                        timezone: data.sensor.timezone._id,
                                        active: data.sensor.active !== 'No'
                                    };
                                    Sensors.update(data.sensor.sensorId, sensorData);
                                    break;
                                case 'delete':
                                    Sensors.delete(data.sensor.sensorId);
                                    break;
                                case 'add':
                                    var sensorData = {
                                        //sensorId: data.sensor.sensorId,
                                        name: data.sensor.name,
                                        password: data.sensor.password,
                                        description: data.sensor.description,
                                        client: data.sensor.client._id,
                                        type: data.sensor.type,
                                        timezone: data.sensor.timezone._id,
                                        active: data.sensor.active !== 'No'
                                    };
                                    Sensors.add(sensorData);
                                    break;
                            }
                        }, function () {
                            $log.info('modal-component dismissed at: ' + new Date());
                        });
                    })


            } else {

                var modalInstance = $uibModal.open({
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'myModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    controllerAs: 'vm',
                    size: 'lg',
                    //appendTo: parentElem,
                    resolve: {
                        sensor: function () {
                            return null;
                        },
                        mode: function () {
                            return mode;
                        }
                    }
                });

                modalInstance.result.then(function (data) {

                    var sensorData = {
                        //sensorId: data.sensor.sensorId,
                        name: data.sensor.name,
                        password: data.sensor.password,
                        description: data.sensor.description,
                        client: data.sensor.client._id,
                        type: data.sensor.type,
                        timezone: data.sensor.timezone._id,
                        active: data.sensor.active !== 'No'
                    };
                    Sensors.create(sensorData);
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };

        // DELETE ==================================================================
        // delete a sensor after checking it
        vm.deleteSensor = function(id) {
            Sensors.delete(id)
            // if successful creation, call our get function to get all the new sensors
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.sensors = response.data;
                    console.log(response.data);
                    vm.gridOptions.data = response.data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        };
    });

angular.module('sensorController').controller('ModalInstanceCtrl', function ($uibModalInstance, sensor, mode) {
    var vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    vm.sensor = sensor;

    vm.actives = ['Si', 'No'];

    vm.types = ['Admin', 'Monitoreo'];

    vm.isDisabled = true;

    if (mode != 'add') {
        vm.sensor.active = sensor.active ? 'Si' : 'No';
        vm.sensor.type = sensor.type;
    }

    switch (mode) {
        case 'read':
            vm.modalName = "Detalle Usuario";
            vm.isView = true;
            break;
        case 'update':
            vm.modalName = "Actualizar Usuario";
            vm.isDisabled = false;
            vm.isUpdate = true;
            break;
        case 'delete':
            vm.modalName = "Eliminar Usuario";
            vm.isDelete = true;
            break;
        case 'add':
            vm.modalName = "Nuevo Usuario";
            vm.isDisabled = false;
            vm.isAdd = true;
            break;
    }

    console.log(mode);

    vm.ok = function () {
        $uibModalInstance.dismiss('ok');
    };

    vm.add = function () {
        $uibModalInstance.close({mode: 'add', sensor: vm.sensor});
    };

    vm.update = function () {
        $uibModalInstance.close({mode: 'update', sensor: vm.sensor});
    };

    vm.delete = function () {
        $uibModalInstance.close({mode: 'delete', sensor: vm.sensor});
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.back = function () {
        $uibModalInstance.dismiss('back');
    };
});