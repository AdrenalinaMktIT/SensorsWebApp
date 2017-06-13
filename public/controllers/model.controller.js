angular.module('modelController', [])

// inject the Alert service factory into our controller
    .controller('ModelCtrl', function ($http, $uibModal, $log, Models, AppAlert, uiGridConstants, allModels, allTypes) {

        let vm = this;

        vm.formData = {};

        vm.lang = 'es';

        vm.gridOptions = {
            enableSorting: true,
            gridMenuShowHideColumns: false,
            enableFiltering: true,
            showGridFooter: true,
            columnDefs: [
                { field: 'name', cellClass:'text-center', sort: { direction: uiGridConstants.ASC, priority: 0 }, displayName: 'NOMBRE', enableHiding: false, width: '20%' },
                { field: 'sensors_config[0]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_1', enableHiding: false, width: '10%' },
                { field: 'sensors_config[1]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_2', enableHiding: false, width: '10%' },
                { field: 'sensors_config[2]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_3', enableHiding: false, width: '10%' },
                { field: 'sensors_config[3]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_4', enableHiding: false, width: '10%' },
                { field: 'sensors_config[4]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_5', enableHiding: false, width: '10%' },
                { field: 'sensors_config[5]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_6', enableHiding: false, width: '10%' },
                { field: 'sensors_config[6]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_7', enableHiding: false, width: '10%' },
                { field: 'sensors_config[7]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_8', enableHiding: false, width: '10%' },
                { field: 'sensors_config[8]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_9', enableHiding: false, width: '10%' },
                { field: 'sensors_config[9]', cellTemplate:'<p class="bg-info">{{COL_FIELD}}</p>', cellClass:'text-center', displayName: 'SENSOR_10', enableHiding: false, width: '10%' },
                { field: 'crud', cellClass:'text-center', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, width: '20%', enableSorting: false, exporterSuppressExport: true,
                    cellTemplate:
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button>',
                }
            ],
            enableGridMenu: true
        };

        vm.types = allTypes.data.types;
        vm.models = allModels.data.models;
        loadSensorsModel();

        function loadModels() {
            Models.getAll()
                .then(function successCallback(response) {
                    vm.models = response.data.models;
                    loadSensorsModel();
                }, function errorCallback(response) {
                    console.log('Error: ' + response);
                });
        }

        function loadSensorsModel() {
            sensors_config = _.map(vm.models, function(item) {
                let sensors_config = new Array(10).fill('');
                let positions = _.pluck(item.sensors_config, 'position');
                let types = _.pluck(item.sensors_config, 'type');
                _.each(positions, function (pos, idx, list) {
                    sensors_config[pos-1] = types[idx].name;
                });

                return item.sensors_config = sensors_config;
            });
            vm.gridOptions.data = vm.models;
        }

        vm.openModal = function (id, mode) {

            let vm = this;

            vm.mode = mode;

            if (mode !== 'add') {

                Models.get(id)
                    .then(function successCallback(response) {

                        let model = {
                            modelId: response.data.model._id,
                            name: response.data.model.name,
                            selectedSensors: response.data.model.sensors_config
                        };

                        let modalInstance = $uibModal.open({
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'modelModalContent.html',
                            controller: 'ModelModalInstanceCtrl',
                            controllerAs: 'vm',
                            size: 'lg',
                            resolve: {
                                model: function () {
                                    return model;
                                },
                                types: function () {
                                    return vm.types;
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
                                    let sensors_config = _.map(data.model.sensors_config, function(item) {
                                        item.type = item.type.id;
                                        return item;
                                    });

                                    let modelData = {
                                        name: data.model.name,
                                        sensors_config: sensors_config

                                    };
                                    Models.update(data.model.modelId, modelData)
                                        .then(function(response) {
                                            if (response.status === 200) {
                                                loadModels();
                                                AppAlert.add('success', response.data.message);
                                            } else {
                                                AppAlert.add('danger', response.data.message);
                                            }
                                        })
                                        .catch(function(error) {
                                            AppAlert.add('danger', error.message);
                                        });
                                    break;
                                case 'delete':
                                    Models.delete(data.model.modelId)
                                        .then(function(response) {
                                            if (response.status === 200) {
                                                loadModels();
                                                AppAlert.add('success', response.data.message);
                                            } else {
                                                AppAlert.add('danger', response.data.message);
                                            }
                                        })
                                        .catch(function(error) {
                                            AppAlert.add('danger', error.message);
                                        });
                                    break;
                            }
                        }, function () {
                            $log.info('modal-component dismissed at: ' + new Date());
                        });
                    })


            } else {

                let modalInstance = $uibModal.open({
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'modelModalContent.html',
                    controller: 'ModelModalInstanceCtrl',
                    controllerAs: 'vm',
                    size: 'lg',
                    resolve: {
                        model: function () {
                            return null;
                        },
                        types: function () {
                            return vm.types;
                        },
                        mode: function () {
                            return mode;
                        }
                    }
                });

                modalInstance.result.then(function(data) {

                    let sensors_config = _.map(data.model.sensors_config, function(item) {
                        item.type = item.type.id;
                        return item;
                    });

                    let modelData = {
                        name: data.model.name,
                        sensors_config: sensors_config

                    };
                    Models.create(modelData)
                        .then(function(response) {
                            if (response.status === 201) {
                                loadModels();
                                AppAlert.add('success', response.data.message);
                            } else {
                                AppAlert.add('danger', response.data.message);
                            }
                        })
                        .catch(function(error) {
                            AppAlert.add('danger', error.status + ' - ' + error.statusText);
                        });
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };
    });

angular.module('modelController').controller('ModelModalInstanceCtrl', function ($uibModalInstance, model, types, mode) {
    let vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    vm.model = model;

    vm.types = types;

    vm.selectedSensors = [];

    vm.isDisabled = true;

    if (mode !== 'add') {
        vm.selectedSensors = vm.model.selectedSensors;
    }

    switch (mode) {
        case 'read':
            vm.modalName = "Detalle Modelo";
            vm.isView = true;
            break;
        case 'update':
            vm.modalName = "Actualizar Modelo";
            vm.isDisabled = false;
            vm.isUpdate = true;
            break;
        case 'delete':
            vm.modalName = "Eliminar Modelo";
            vm.isDelete = true;
            break;
        case 'add':
            vm.modalName = "Nuevo Modelo";
            vm.isDisabled = false;
            vm.isAdd = true;
            break;
    }

    vm.remove = function (position) {
        vm.selectedSensors = _.reject(vm.selectedSensors, function(item){ return item.position == position; });
    };

    vm.addSensor = function () {
        if (vm.selectedSensors.length < 10) {

            vm.selectedSensors = _.reject(vm.selectedSensors, function(item){ return item.position == vm.inlineRadioOption; });

            vm.selectedSensors.push({
                position: vm.inlineRadioOption,
                type: {
                    name: vm.type.selected.name,
                    units: vm.type.selected.units,
                    id: vm.type.selected._id
                }
            })
        }
    };

    vm.add = function (modelForm) {
        if (modelForm.$valid) {
            if (vm.selectedSensors.length >= 1) {
                vm.model.sensors_config = vm.selectedSensors;
                $uibModalInstance.close({mode: 'add', model: vm.model});
            } else {
                // TODO mostrar alerta de 1 sensor minimo requerido.
            }
        }
    };

    vm.update = function (modelForm) {
        if (modelForm.$valid) {
            if (vm.selectedSensors.length >= 1) {
                vm.model.sensors_config = vm.selectedSensors;
                $uibModalInstance.close({mode: 'update', model: vm.model});
            } else {
                // TODO mostrar alerta de 1 sensor minimo requerido.
            }
        }
    };

    vm.delete = function () {
        $uibModalInstance.close({mode: 'delete', model: vm.model});
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.back = function () {
        $uibModalInstance.dismiss('back');
    };
});