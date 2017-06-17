angular.module('clientController', [])
    .controller('ClientCtrl', function ($uibModal, $log, Clients, AppAlert, uiGridConstants, allCalculations, allClients) {

        let vm = this;

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
                { field: 'name', cellClass:'text-center', sort: { direction: uiGridConstants.ASC, priority: 0 }, displayName: 'NOMBRE', enableHiding: false, width: '30%' },
                { field: 'app_id', cellClass:'text-center', displayName: 'ID DE APLICACION', enableHiding: false, width: '15%' },
                { field: 'available_calculations', cellClass:'text-center', displayName: 'CALCULOS DISPONIBLES', enableHiding: false, width: '30%' },
                { field: 'crud', cellClass:'text-center', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, width: '20%', enableSorting: false, exporterSuppressExport: true,
                    cellTemplate:
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button>',
                }
            ],
            enableGridMenu: true
        };


        // You can be sure that allClients are ready to use!
        vm.calculations = allCalculations.data.calculations;
        vm.gridOptions.data = vm.clients = allClients.data.clients;

        function loadClients() {
            Clients.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.clients = response.data.clients;
                    vm.gridOptions.data = response.data.clients;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }

        vm.openModal = function (id, mode) {

            let vm = this;

            vm.mode = mode;

            if (mode !== 'add') {

                Clients.get(id)
                    .then(function successCallback(response) {
                        vm.client = {};
                        vm.client.clientId = response.data.client._id;
                        vm.client.name = response.data.client.name;
                        vm.client.appId = response.data.client.app_id;
                        vm.client.logo = response.data.client.logo;
                        vm.client.cssName = response.data.client.css_name;
                        vm.client.pdfCertified = response.data.client.pdf_certified ? "1" : "0";
                        vm.selectedCalculations = response.data.client.available_calculations;
                        vm.client.active = response.data.client.active ? "1" : "0";

                        let modalInstance = $uibModal.open({
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'ClientModalContent.html',
                            controller: 'ClientModalInstanceCtrl',
                            controllerAs: 'vm',
                            size: 'lg',
                            resolve: {
                                calculations: function () {
                                    return vm.calculations;
                                },
                                selectedCalculations: function () {
                                    return vm.selectedCalculations;
                                },
                                client: function () {
                                    return vm.client;
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
                                    let clientData = {
                                        clientId: data.user.clientId,
                                        name: data.client.name,
                                        appId: data.client.appId,
                                        logo: data.client.logo,
                                        cssName: data.client.cssName,
                                        pdfCertified: data.client.pdfCertified,
                                        availableCalculations: _.pluck(data.client.available_calculations, '_id'),
                                        active: data.client.active
                                    };
                                    Clients.update(data.client.clientId, clientData)
                                        .then(function(response) {
                                            if (response.status === 200) {
                                                loadClients();
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
                                    Clients.delete(data.client.clientId)
                                        .then(function(response) {
                                            if (response.status === 200) {
                                                loadClients();
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
                    templateUrl: 'ClientModalContent.html',
                    controller: 'ClientModalInstanceCtrl',
                    controllerAs: 'vm',
                    size: 'lg',
                    resolve: {
                        calculations: function () {
                            return vm.calculations;
                        },
                        selectedCalculations: function () {
                            return null;
                        },
                        client: function () {
                            return null;
                        },
                        mode: function () {
                            return mode;
                        }
                    }
                });

                modalInstance.result.then(function (data) {

                    let clientData = {
                        name: data.client.name,
                        appId: data.client.appId,
                        logo: data.client.logo,
                        cssName: data.client.cssName,
                        pdfCertified: data.client.pdfCertified,
                        availableCalculations: _.pluck(data.client.available_calculations, '_id'),
                        active: data.client.active
                    };
                    Clients.create(clientData)
                        .then(function(response) {
                            if (response.status === 201) {
                                loadClients();
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

angular.module('clientController').controller('ClientModalInstanceCtrl', function ($uibModalInstance, calculations, selectedCalculations, client, mode) {
    let vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    _.filter(calculations, function(item){
        return _.each(selectedCalculations, function(item2){
            item._id == item2;
        })
    });

    vm.calculations = _.reject(calculations, function(item){ return item._id == selectedCalculations; });

    vm.selectedCalculations = _.filter(calculations, function(item){ return item._id == selectedCalculations; });

    vm.client = client;

    vm.isDisabled = true;

    switch (mode) {
        case 'read':
            vm.modalName = "Detalle Cliente";
            vm.isView = true;
            break;
        case 'update':
            vm.modalName = "Actualizar Cliente";
            vm.isDisabled = false;
            vm.isUpdate = true;
            break;
        case 'delete':
            vm.modalName = "Eliminar Cliente";
            vm.isDelete = true;
            break;
        case 'add':
            vm.modalName = "Nuevo Cliente";
            vm.isDisabled = false;
            vm.isAdd = true;
            break;
    }

    vm.ok = function () {
        $uibModalInstance.dismiss('ok');
    };

    vm.add = function (clientForm) {
        if (clientForm.$valid) {
            if (vm.selectedCalculations.length >= 1) {
                vm.client.available_calculations = vm.selectedCalculations;
                $uibModalInstance.close({mode: 'add', client: vm.client});
            } else {
                // TODO mostrar alerta de 1 calculo minimo requerido.
            }
        }
    };

    vm.update = function (clientForm) {
        if (clientForm.$valid) {
            if (vm.selectedCalculations.length >= 1) {
                vm.client.available_calculations = vm.selectedCalculations;
                $uibModalInstance.close({mode: 'update', client: vm.client});
            } else {
                // TODO mostrar alerta de 1 calculo minimo requerido.
            }
        }
    };

    vm.delete = function () {
        $uibModalInstance.close({mode: 'delete', client: vm.client});
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.back = function () {
        $uibModalInstance.dismiss('back');
    };
});