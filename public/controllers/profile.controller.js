angular.module('profileController', [])

// inject the Profile service factory into our controller
    .controller('ProfileCtrl', function ($http, $uibModal, $log, Carriers, Timezones, Profiles) {

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
                { field: 'email', displayName: 'CORREO ELECTRONICO', enableHiding: false },
                { field: 'timezone_id.name', displayName: 'ZONA HORARIA', enableHiding: false },
                { field: 'crud', displayName: 'VER / EDITAR / BORRAR', enableHiding: false, enableSorting: false,
                    cellTemplate: '<div class="ui-grid-cell-contents">'+
                    '<button id="readBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'read\')" type="button" class="btn btn-xs btn-info"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'update\')" type="button" class="btn btn-xs btn-success"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.vm.openModal(row.entity._id, \'delete\')" type="button" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Borrar</button></div>' }
            ],
            enableGridMenu: true
        };

        // GET =====================================================================
        // when landing on the page, get all profiles and show them
        // use the service to get all the profiles
        loadProfiles();
        loadCarriers();
        loadTimezones();

        function loadProfiles() {
            Profiles.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.profiles = response.data;
                    console.log(response.data);
                    vm.gridOptions.data = response.data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }

        function loadCarriers() {
            Carriers.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.carriers = response.data;
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
        vm.createProfile = function() {

            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject(vm.formData)) {

                // call the create function from our service (returns a promise object)
                Profiles.create(vm.formData)

                // if successful creation, call our get function to get all the new profiles
                    .then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        vm.formData = {}; // clear the form so our profile is ready to enter another
                        vm.profiles = response.data;
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

                //vm.getProfile(id);
                Profiles.get(id)
                // if successful creation, call our get function to get all the new profiles
                    .then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        //vm.profile = response.data[0];

                        vm.id = response.data[0]._id;
                        vm.name = response.data[0].name;
                        vm.password = response.data[0].password;
                        vm.description = response.data[0].description;
                        vm.client = response.data[0].client_id;
                        vm.type = response.data[0].profile_type;
                        vm.timezone = response.data[0].timezone_id;
                        vm.active = response.data[0].active;

                        var profile = {
                            profileId: vm.id,
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
                                profile: function () {
                                    return profile;
                                },
                                carriers: function () {
                                    return vm.carriers;
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
                                    var profileData = {
                                        profileId: data.profile.profileId,
                                        name: data.profile.name,
                                        password: data.profile.password,
                                        description: data.profile.description,
                                        client: data.profile.client._id,
                                        type: data.profile.type,
                                        timezone: data.profile.timezone._id,
                                        active: data.profile.active !== 'No'
                                    };
                                    Profiles.update(data.profile.profileId, profileData);
                                    break;
                                case 'delete':
                                    Profiles.delete(data.profile.profileId);
                                    break;
                                case 'add':
                                    var profileData = {
                                        //profileId: data.profile.profileId,
                                        name: data.profile.name,
                                        password: data.profile.password,
                                        description: data.profile.description,
                                        client: data.profile.client._id,
                                        type: data.profile.type,
                                        timezone: data.profile.timezone._id,
                                        active: data.profile.active !== 'No'
                                    };
                                    Profiles.add(profileData);
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
                        profile: function () {
                            return null;
                        },
                        carriers: function () {
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

                    var profileData = {
                        //profileId: data.profile.profileId,
                        name: data.profile.name,
                        password: data.profile.password,
                        description: data.profile.description,
                        client: data.profile.client._id,
                        type: data.profile.type,
                        timezone: data.profile.timezone._id,
                        active: data.profile.active !== 'No'
                    };
                    Profiles.create(profileData);
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            }
        };

        // DELETE ==================================================================
        // delete a profile after checking it
        vm.deleteProfile = function(id) {
            Profiles.delete(id)
            // if successful creation, call our get function to get all the new profiles
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.profiles = response.data;
                    console.log(response.data);
                    vm.gridOptions.data = response.data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        };
    });

angular.module('profileController').controller('ModalInstanceCtrl', function ($uibModalInstance, profile, carriers, timezones, mode) {
    var vm = this;

    vm.isView = vm.isUpdate = vm.isDelete = vm.isAdd = false;

    vm.profile = profile;

    vm.carriers = carriers;

    vm.timezones = timezones;

    vm.actives = ['Si', 'No'];

    vm.isDisabled = true;

    if (mode != 'add') {
        vm.profile.carrier = carriers[profile.carrier];
        vm.profile.timezone = _.find(timezones, function(val){ return val._id == profile.timezone; });
        vm.profile.active = profile.active ? 'Si' : 'No';
    }

    switch (mode) {
        case 'read':
            vm.modalName = "Detalle Perfil de Notificacion";
            vm.isView = true;
            break;
        case 'update':
            vm.modalName = "Actualizar Perfil de Notificacion";
            vm.isDisabled = false;
            vm.isUpdate = true;
            break;
        case 'delete':
            vm.modalName = "Eliminar Perfil de Notificacion";
            vm.isDelete = true;
            break;
        case 'add':
            vm.modalName = "Nuevo Perfil de Notificacion";
            vm.isDisabled = false;
            vm.isAdd = true;
            break;
    }

    vm.ok = function () {
        $uibModalInstance.dismiss('ok');
    };

    vm.add = function () {
        $uibModalInstance.close({mode: 'add', profile: vm.profile});
    };

    vm.update = function () {
        $uibModalInstance.close({mode: 'update', profile: vm.profile});
    };

    vm.delete = function () {
        $uibModalInstance.close({mode: 'delete', profile: vm.profile});
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.back = function () {
        $uibModalInstance.dismiss('back');
    };
});