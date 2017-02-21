angular.module('userController', [])

// inject the User service factory into our controller
    .controller('UserCtrl', function ($http, $uibModal, $log, Clients, Timezones, Users) {

        var vm = this;

        vm.formData = {};

        vm.lang = 'es';

        vm.gridOptions = {
            enableSorting: true,
            /*paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,*/
            gridMenuShowHideColumns: false,
            /*enableRowHeaderSelection: true,*/
            showGridFooter: true,
            columnDefs: [
                { field: 'name', displayName: 'NOMBRE', enableHiding: false },
                { field: 'description', displayName: 'DESCRIPCION', enableHiding: false },
                { field: 'user_type', displayName: 'TIPO DE USUARIO', enableHiding: false },
                { field: 'crud', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, enableSorting: false,
                    cellTemplate: '<div class="pull-right">' +
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button> </div>' }
            ],
            enableGridMenu: true
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
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.users = response.data;
                    console.log(response.data);
                    vm.gridOptions.data = response.data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }

        function loadClients() {
            Clients.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.clients = response.data;
                    console.log(response.data);
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }

        function loadTimezones() {
            Timezones.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.timezones = response.data;
                    console.log(response.data);
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }

        // CREATE ==================================================================
        // when submitting the add form, send the text to the node API
        vm.createUser = function() {

            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject(vm.formData)) {

                // call the create function from our service (returns a promise object)
                Users.create(vm.formData)

                // if successful creation, call our get function to get all the new users
                    .then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        vm.formData = {}; // clear the form so our user is ready to enter another
                        vm.users = response.data;
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

                //vm.getUser(id);
                Users.get(id)
                // if successful creation, call our get function to get all the new users
                    .then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        //vm.user = response.data[0];

                        vm.id = response.data[0]._id;
                        vm.name = response.data[0].name;
                        vm.password = response.data[0].password;
                        vm.description = response.data[0].description;
                        vm.client = response.data[0].client_id;
                        vm.type = response.data[0].user_type;
                        vm.timezone = response.data[0].timezone_id;
                        vm.active = response.data[0].active;

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
                            controller: 'ModalInstanceCtrl',
                            controllerAs: 'vm',
                            size: 'lg',
                            //appendTo: parentElem,
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
                                    Users.update(data.user.userId, userData);
                                    break;
                                case 'delete':
                                    Users.delete(data.user.userId);
                                    break;
                                case 'add':
                                    var userData = {
                                        //userId: data.user.userId,
                                        name: data.user.name,
                                        password: data.user.password,
                                        description: data.user.description,
                                        client: data.user.client._id,
                                        type: data.user.type,
                                        timezone: data.user.timezone._id,
                                        active: data.user.active !== 'No'
                                    };
                                    Users.add(userData);
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
                        //userId: data.user.userId,
                        name: data.user.name,
                        password: data.user.password,
                        description: data.user.description,
                        client: data.user.client._id,
                        type: data.user.type,
                        timezone: data.user.timezone._id,
                        active: data.user.active !== 'No'
                    };
                    Users.create(userData);
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };

        // DELETE ==================================================================
        // delete a user after checking it
        vm.deleteUser = function(id) {
            Users.delete(id)
            // if successful creation, call our get function to get all the new users
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.users = response.data;
                    console.log(response.data);
                    vm.gridOptions.data = response.data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        };
    });

angular.module('userController').controller('ModalInstanceCtrl', function ($uibModalInstance, user, clients, timezones, mode) {
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

    console.log(mode);

    vm.ok = function () {
        $uibModalInstance.dismiss('ok');
    };

    vm.add = function () {
        $uibModalInstance.close({mode: 'add', user: vm.user});
    };

    vm.update = function () {
        $uibModalInstance.close({mode: 'update', user: vm.user});
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