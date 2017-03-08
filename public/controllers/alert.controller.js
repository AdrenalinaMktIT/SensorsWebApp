angular.module('alertController', [])

// inject the Alert service factory into our controller
    .controller('AlertCtrl', function ($http, $uibModal, $log, Alerts) {

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
                { field: 'name', displayName: 'NOMBRE', enableHiding: false, width: '15%' },
                { field: 'profile.name', displayName: 'PERFIL', enableHiding: false, width: '20%' },
                { field: 'sensor.name', displayName: 'SENSOR', enableHiding: false, width: '25%' },
                { field: 'less_than', displayName: 'MENOR QUE', enableHiding: false, width: '10%' },
                { field: 'greater_than', displayName: 'MAYOR QUE', enableHiding: false, width: '10%' },
                { field: 'crud', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, enableSorting: false, exporterSuppressExport: true,
                    cellTemplate:
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button>',
                width: '20%'}
            ],
            enableGridMenu: true
        };

        // GET =====================================================================
        // when landing on the page, get all alerts and show them
        // use the service to get all the alerts
        loadAlerts();

        function loadAlerts() {
            Alerts.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.alerts = response.data.alerts;
                    vm.gridOptions.data = response.data.alerts;
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

                Alerts.get(id)
                    .then(function successCallback(response) {

                        vm.id = response.data.alert._id;
                        vm.name = response.data.alert.name;
                        vm.password = response.data.alert.password;
                        vm.description = response.data.alert.description;
                        vm.client = response.data.alert.client_id;
                        vm.type = response.data.alert.alert_type;
                        vm.timezone = response.data.alert.timezone_id;
                        vm.active = response.data.alert.active;

                        var alert = {
                            alertId: vm.id,
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
                                alert: function () {
                                    return alert;
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
                                    var alertData = {
                                        alertId: data.alert.alertId,
                                        name: data.alert.name,
                                        password: data.alert.password,
                                        description: data.alert.description,
                                        client: data.alert.client._id,
                                        type: data.alert.type,
                                        timezone: data.alert.timezone._id,
                                        active: data.alert.active !== 'No'
                                    };
                                    Alerts.update(data.alert.alertId, alertData);
                                    break;
                                case 'delete':
                                    Alerts.delete(data.alert.alertId);
                                    break;
                                case 'add':
                                    var alertData = {
                                        //alertId: data.alert.alertId,
                                        name: data.alert.name,
                                        password: data.alert.password,
                                        description: data.alert.description,
                                        client: data.alert.client._id,
                                        type: data.alert.type,
                                        timezone: data.alert.timezone._id,
                                        active: data.alert.active !== 'No'
                                    };
                                    Alerts.add(alertData);
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
                        alert: function () {
                            return null;
                        },
                        mode: function () {
                            return mode;
                        }
                    }
                });

                modalInstance.result.then(function (data) {

                    var alertData = {
                        //alertId: data.alert.alertId,
                        name: data.alert.name,
                        password: data.alert.password,
                        description: data.alert.description,
                        client: data.alert.client._id,
                        type: data.alert.type,
                        timezone: data.alert.timezone._id,
                        active: data.alert.active !== 'No'
                    };
                    Alerts.create(alertData);
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };
    });

angular.module('alertController').controller('ModalInstanceCtrl', function ($uibModalInstance, alert, mode) {
    var vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    vm.alert = alert;

    vm.actives = ['Si', 'No'];

    vm.types = ['Admin', 'Monitoreo'];

    vm.isDisabled = true;

    if (mode != 'add') {
        vm.alert.active = alert.active ? 'Si' : 'No';
        vm.alert.type = alert.type;
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
        $uibModalInstance.close({mode: 'add', alert: vm.alert});
    };

    vm.update = function () {
        $uibModalInstance.close({mode: 'update', alert: vm.alert});
    };

    vm.delete = function () {
        $uibModalInstance.close({mode: 'delete', alert: vm.alert});
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.back = function () {
        $uibModalInstance.dismiss('back');
    };
});