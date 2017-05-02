angular.module('userController', [])

// inject the User service factory into our controller
    .controller('UserCtrl', function ($http, $uibModal, $log, Clients, Timezones, Users, AppAlert) {

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
                { field: 'user_type', displayName: 'TIPO DE USUARIO', enableHiding: false },
                { field: 'crud', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, enableSorting: false,
                    cellTemplate:
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button>' }
            ],
            enableGridMenu: true,
            onRegisterApi: function(gridApi) {
                vm.gridApi = gridApi;
            }
        };

        // GET =====================================================================
        // when landing on the page, get all users and show them
        // use the service to get all the users
        loadUsers();
        loadClients();
        loadTimezones();

        function loadUsers() {
            Users.getAll()
                .then(function successCallback(response) {
                    vm.users = response.data.users;
                    vm.gridOptions.data = response.data.users;
                }, function errorCallback(response) {
                    console.log('Error: ' + response);
                });
        }

        function loadClients() {
            vm.clients = [];
            vm.clients.push({
                _id: 'all',
                name: 'Todos'
            });
            Clients.getAll()
                .then(function successCallback(response) {
                    //vm.clients = response.data.clients;
                    for (var i = 0; i < response.data.clients.length; i++) {
                        vm.clients.push(response.data.clients[i]);
                    }
                }, function errorCallback(response) {
                    console.log('Error: ' + response);
                });
        }

        function loadTimezones() {
            Timezones.getAll()
                .then(function successCallback(response) {
                    vm.timezones = response.data.timezones;
                }, function errorCallback(response) {
                    console.log('Error: ' + response);
                });
        }

        vm.openModal = function (id, mode) {

            var vm = this;

            vm.mode = mode;

            if (mode != 'add') {

                Users.get(id)
                    .then(function successCallback(response) {

                        vm.id = response.data.user._id;
                        vm.name = response.data.user.name;
                        vm.password = response.data.user.password;
                        vm.description = response.data.user.description;
                        vm.client = response.data.user.client_id;
                        vm.type = response.data.user.user_type;
                        vm.timezone = response.data.user.timezone_id;
                        vm.active = response.data.user.active;

                        var user = {
                            userId: vm.id,
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
                            controller: 'UserModalInstanceCtrl',
                            controllerAs: 'vm',
                            size: 'lg',
                            resolve: {
                                user: function () {
                                    return user;
                                },
                                clients: function () {
                                    return vm.clients;
                                },
                                timezones: function () {
                                    return vm.timezones;
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
                                    var userData = {
                                        userId: data.user.userId,
                                        name: data.user.name,
                                        password: data.user.password,
                                        description: data.user.description,
                                        client: data.user.client._id,
                                        type: data.user.type,
                                        timezone: data.user.timezone._id,
                                        active: data.user.active !== 'No'
                                    };
                                    Users.update(data.user.userId, userData)
                                        .then(function(response) {
                                            if (response.status == 200) {
                                                loadUsers();
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
                                    Users.delete(data.user.userId)
                                        .then(function(response) {
                                            if (response.status == 200) {
                                                loadUsers();
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

                var modalInstance = $uibModal.open({
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'myModalContent.html',
                    controller: 'UserModalInstanceCtrl',
                    controllerAs: 'vm',
                    size: 'lg',
                    resolve: {
                        user: function () {
                            return null;
                        },
                        clients: function () {
                            return vm.clients;
                        },
                        timezones: function () {
                            return vm.timezones;
                        },
                        mode: function () {
                            return mode;
                        }
                    }
                });

                modalInstance.result.then(function (data) {

                    var userData = {
                        name: data.user.name,
                        password: data.user.password,
                        description: data.user.description,
                        client: data.user.client._id,
                        type: data.user.type,
                        timezone: data.user.timezone._id,
                        active: data.user.active !== 'No'
                    };

                    Users.create(userData)
                        .then(function(response) {
                            if (response.status == 201) {
                                loadUsers();
                                AppAlert.add('success', response.data.message);
                            } else {
                                AppAlert.add('danger', response.data.message);
                            }
                        })
                        .catch(function(error) {
                            AppAlert.add('danger', error.message);
                        });
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };

        vm.onOpenClose = function (isOpen){
            if (!isOpen) {
                if (vm.client.selected._id === 'all') {
                    Users.getAll()
                        .then(function successCallback(response) {
                            vm.users = response.data.users;
                            vm.gridOptions.data = response.data.users;
                        }, function errorCallback(response) {
                            console.log('Error: ' + response);
                        });
                } else {
                    Users.getByClient(vm.client.selected._id)
                        .then(function successCallback(response) {
                            vm.users = response.data.users;
                            vm.gridOptions.data = response.data.users;
                        }, function errorCallback(response) {
                            console.log('Error: ' + response);
                        });
                }
            }
        };
    });

angular.module('userController').controller('UserModalInstanceCtrl', function ($uibModalInstance, user, clients, timezones, mode) {
    var vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    vm.user = user;

    vm.clients = clients;

    vm.timezones = timezones;

    vm.actives = ['Si', 'No'];

    vm.types = ['Admin', 'Monitoreo'];

    vm.isDisabled = true;

    if (mode != 'add') {
        vm.user.client = clients[user.client-1];
        vm.user.timezone = _.find(timezones, function(val){ return val._id == user.timezone; });
        vm.user.active = user.active ? 'Si' : 'No';
        vm.user.type = user.type;
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

    vm.ok = function () {
        $uibModalInstance.dismiss('ok');
    };

    vm.add = function(userForm) {
        if (userForm.$valid) {
            $uibModalInstance.close({mode: 'add', user: vm.user});
        }
    };

    vm.update = function (userForm) {
        if (userForm.$valid) {
            $uibModalInstance.close({mode: 'update', user: vm.user});
        }
    };

    vm.delete = function () {
        $uibModalInstance.close({mode: 'delete', user: vm.user});
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.back = function () {
        $uibModalInstance.dismiss('back');
    };
});