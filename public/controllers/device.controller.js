angular.module('deviceController', [])

// inject the Device service factory into our controller
    .controller('DeviceCtrl', function ($http, $uibModal, $log, Devices) {

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
                { field: '_id', displayName: 'IMEI', enableHiding: false },
                { field: 'description', displayName: 'DESCRIPCION', enableHiding: false },
                { field: 'model.name', displayName: 'MODELO', enableHiding: false },
                { field: 'client_id.name', displayName: 'CLIENTE', enableHiding: false },
                { field: 'crud', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, enableSorting: false, exporterSuppressExport: true,
                    cellTemplate:
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button>' }
            ],
            enableGridMenu: true
        };

        // GET =====================================================================
        // when landing on the page, get all devices and show them
        // use the service to get all the devices
        loadDevices();

        function loadDevices() {
            Devices.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.devices = response.data.devices;
                    vm.gridOptions.data = response.data.devices;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }

        vm.openModal = function (id, mode) {

            var vm = this;

            vm.mode = mode;

            if (mode != 'add') {

                Devices.get(id)
                    .then(function successCallback(response) {

                        vm.id = response.data.device._id;
                        vm.name = response.data.device.name;
                        vm.password = response.data.device.password;
                        vm.description = response.data.device.description;
                        vm.client = response.data.device.client_id;
                        vm.type = response.data.device.device_type;
                        vm.timezone = response.data.device.timezone_id;
                        vm.active = response.data.device.active;

                        var device = {
                            deviceId: vm.id,
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
                            resolve: {
                                device: function () {
                                    return device;
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
                                    var deviceData = {
                                        deviceId: data.device.deviceId,
                                        name: data.device.name,
                                        password: data.device.password,
                                        description: data.device.description,
                                        client: data.device.client._id,
                                        type: data.device.type,
                                        timezone: data.device.timezone._id,
                                        active: data.device.active !== 'No'
                                    };
                                    Devices.update(data.device.deviceId, deviceData);
                                    break;
                                case 'delete':
                                    Devices.delete(data.device.deviceId);
                                    break;
                                case 'add':
                                    var deviceData = {
                                        //deviceId: data.device.deviceId,
                                        name: data.device.name,
                                        password: data.device.password,
                                        description: data.device.description,
                                        client: data.device.client._id,
                                        type: data.device.type,
                                        timezone: data.device.timezone._id,
                                        active: data.device.active !== 'No'
                                    };
                                    Devices.add(deviceData);
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
                    resolve: {
                        device: function () {
                            return null;
                        },
                        mode: function () {
                            return mode;
                        }
                    }
                });

                modalInstance.result.then(function (data) {

                    var deviceData = {
                        name: data.device.name,
                        password: data.device.password,
                        description: data.device.description,
                        client: data.device.client._id,
                        type: data.device.type,
                        timezone: data.device.timezone._id,
                        active: data.device.active !== 'No'
                    };
                    Devices.create(deviceData);
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };

    });

angular.module('deviceController').controller('ModalInstanceCtrl', function ($uibModalInstance, device, mode) {
    var vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    vm.device = device;

    vm.actives = ['Si', 'No'];

    vm.types = ['Admin', 'Monitoreo'];

    vm.isDisabled = true;

    if (mode != 'add') {
        vm.device.active = device.active ? 'Si' : 'No';
        vm.device.type = device.type;
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
        $uibModalInstance.close({mode: 'add', device: vm.device});
    };

    vm.update = function () {
        $uibModalInstance.close({mode: 'update', device: vm.device});
    };

    vm.delete = function () {
        $uibModalInstance.close({mode: 'delete', device: vm.device});
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.back = function () {
        $uibModalInstance.dismiss('back');
    };
});