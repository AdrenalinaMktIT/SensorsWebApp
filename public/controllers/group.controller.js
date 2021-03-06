angular.module('groupController', [])

// inject the Group service factory into our controller
    .controller('GroupCtrl', function ($http, $uibModal, $log, Groups) {

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
                { field: 'image', displayName: 'IMAGEN', enableHiding: false },
                { field: 'crud', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, enableSorting: false, exporterSuppressExport: true,
                    cellTemplate:
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button>' }
            ],
            enableGridMenu: true
        };

        // GET =====================================================================
        // when landing on the page, get all groups and show them
        // use the service to get all the groups
        loadGroups();

        function loadGroups() {
            Groups.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.groups = response.data.groups;
                    vm.gridOptions.data = response.data.groups;
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

                //vm.getGroup(id);
                Groups.get(id)
                // if successful creation, call our get function to get all the new groups
                    .then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        //vm.group = response.data.group[0];

                        vm.id = response.data.group._id;
                        vm.name = response.data.group.name;
                        vm.password = response.data.group.password;
                        vm.description = response.data.group.description;
                        vm.client = response.data.group.client_id;
                        vm.type = response.data.group.group_type;
                        vm.timezone = response.data.group.timezone_id;
                        vm.active = response.data.group.active;

                        var group = {
                            groupId: vm.id,
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
                            controller: 'GroupModalInstanceCtrl',
                            controllerAs: 'vm',
                            size: 'lg',
                            //appendTo: parentElem,
                            resolve: {
                                group: function () {
                                    return group;
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
                                    var groupData = {
                                        groupId: data.group.groupId,
                                        name: data.group.name,
                                        password: data.group.password,
                                        description: data.group.description,
                                        client: data.group.client._id,
                                        type: data.group.type,
                                        timezone: data.group.timezone._id,
                                        active: data.group.active !== 'No'
                                    };
                                    Groups.update(data.group.groupId, groupData);
                                    break;
                                case 'delete':
                                    Groups.delete(data.group.groupId);
                                    break;
                                case 'add':
                                    var groupData = {
                                        //groupId: data.group.groupId,
                                        name: data.group.name,
                                        password: data.group.password,
                                        description: data.group.description,
                                        client: data.group.client._id,
                                        type: data.group.type,
                                        timezone: data.group.timezone._id,
                                        active: data.group.active !== 'No'
                                    };
                                    Groups.add(groupData);
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
                    controller: 'GroupModalInstanceCtrl',
                    controllerAs: 'vm',
                    size: 'lg',
                    //appendTo: parentElem,
                    resolve: {
                        group: function () {
                            return null;
                        },
                        mode: function () {
                            return mode;
                        }
                    }
                });

                modalInstance.result.then(function (data) {

                    var groupData = {
                        //groupId: data.group.groupId,
                        name: data.group.name,
                        password: data.group.password,
                        description: data.group.description,
                        client: data.group.client._id,
                        type: data.group.type,
                        timezone: data.group.timezone._id,
                        active: data.group.active !== 'No'
                    };
                    Groups.create(groupData);
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };
    });

angular.module('groupController').controller('GroupModalInstanceCtrl', function ($uibModalInstance, group, mode) {
    var vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    vm.group = group;

    vm.actives = ['Si', 'No'];

    vm.types = ['Admin', 'Monitoreo'];

    vm.isDisabled = true;

    if (mode != 'add') {
        vm.group.active = group.active ? 'Si' : 'No';
        vm.group.type = group.type;
    }

    switch (mode) {
        case 'read':
            vm.modalName = "Detalle Grupo";
            vm.isView = true;
            break;
        case 'update':
            vm.modalName = "Actualizar Grupo";
            vm.isDisabled = false;
            vm.isUpdate = true;
            break;
        case 'delete':
            vm.modalName = "Eliminar Grupo";
            vm.isDelete = true;
            break;
        case 'add':
            vm.modalName = "Nuevo Grupo";
            vm.isDisabled = false;
            vm.isAdd = true;
            break;
    }

    console.log(mode);

    vm.ok = function () {
        $uibModalInstance.dismiss('ok');
    };

    vm.add = function () {
        $uibModalInstance.close({mode: 'add', group: vm.group});
    };

    vm.update = function () {
        $uibModalInstance.close({mode: 'update', group: vm.group});
    };

    vm.delete = function () {
        $uibModalInstance.close({mode: 'delete', group: vm.group});
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.back = function () {
        $uibModalInstance.dismiss('back');
    };
});