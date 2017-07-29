angular.module('alertController', [])

// inject the Alert service factory into our controller
    .controller('AlertCtrl', function ($http, $uibModal, $log, Alerts, Profiles, Sensors) {

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
        loadProfiles();
        loadSensors();

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

        function loadProfiles() {
            Profiles.getAll()
                .then(function successCallback(response) {
                    vm.profiles = response.data.profiles;
                }, function errorCallback(response) {
                    console.log('Error: ' + response);
                });
        }

        function loadSensors() {
            Sensors.getAll()
                .then(function successCallback(response) {
                    vm.sensors = response.data.sensors;
                }, function errorCallback(response) {
                   console.log('Error: ' + response);
                });
        }

        function loadClients(){
            Clients.getAll()
                .then(function sucessCallback(response){
                    vm.clients = response.data.clients;
                }, function errorCallback(response){
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
                        vm.profile = response.data.profile;
                        vm.sensor = response.data.sensor;
                        vm.greater_than = response.data.greater_than;
                        vm.less_than = response.data.less_than;

                        var alert = {
                            alertId: vm.id,
                            name: vm.name,
                            profile: vm.profile,
                            sensor: vm.sensor,
                            greater_than: vm.greater_than,
                            less_than: vm.less_than
                        };

                        var modalInstance = $uibModal.open({
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'myModalContent.html',
                            controller: 'AlertModalInstanceCtrl',
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
                                        alertId: data.alert.Id,
                                        name: data.alert.name,
                                        sensor: data.alert.sensor,
                                        profile: data.alert.profile,
                                        greater_than: data.alert.greater_than,
                                        less_than: data.alert.less_than
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
                                        sensor: data.alert.sensor,
                                        profile: data.alert.profile,
                                        greater_than: data.alert.greater_than,
                                        less_than: data.alert.less_than
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
                    controller: 'AlertModalInstanceCtrl',
                    controllerAs: 'vm',
                    size: 'lg',
                    //appendTo: parentElem,
                    resolve: {
                        alert: function () {
                            return null;
                        },
                        sensors: function(){
                              return vm.sensors;
                        },
                        profiles: function() {
                            return vm.profiles;
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
                        sensor: data.alert.sensor,
                        profile: data.alert.profile,
                        greater_than: data.alert.greater_than,
                        less_than: data.alert.less_than
                    };
                    Alerts.create(alertData);
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };
    });

angular.module('alertController').controller('AlertModalInstanceCtrl', function ($uibModalInstance, alert, mode, sensors, profiles) {
    var vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    vm.alert = alert;

    vm.sensors = sensors;

    vm.profiles = profiles;

    switch (mode) {
        case 'read':
            vm.modalName = "Detalle Alerta";
            vm.isView = true;
            break;
        case 'update':
            vm.modalName = "Actualizar Alerta";
            vm.isDisabled = false;
            vm.isUpdate = true;
            break;
        case 'delete':
            vm.modalName = "Eliminar Alerta";
            vm.isDelete = true;
            break;
        case 'add':
            vm.modalName = "Nueva Alerta";
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