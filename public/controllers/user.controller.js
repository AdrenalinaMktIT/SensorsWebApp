angular.module('userController', [])

// inject the User service factory into our controller
    .controller('UserCtrl', function ($scope, $http, Users) {

        $scope.formData = {};

        $scope.lang = 'es';

        $scope.gridOptions = {
            enableSorting: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,

            showGridFooter: true,
            columnDefs: [
                { field: 'name', displayName: 'Nombre' },
                { field: 'description', displayName: 'Descripcion' },
                { field: 'user_type', displayName: 'Tipo de Usuario' },
                { name: 'edit', displayName: 'Op.',
                    cellTemplate: '<div class="btn-group btn-group-sm" role="group">' +
                    '<button id="readBtn" ng-click="grid.appScope.getUser(row.entity._id)" type="button" class="btn btn-default"><i class="fa fa-eye" aria-hidden="true"></i></button> ' +
                    '<button id="updateBtn" ng-click="grid.appScope.updateUser(row.entity._id)" type="button" class="btn btn-default"><i class="fa fa-pencil" aria-hidden="true"></i></button> ' +
                    '<button id="deleteBtn" ng-click="grid.appScope.deleteUser(row.entity._id)" type="button" class="btn btn-default"><i class="fa fa-trash" aria-hidden="true"></i></button> </div>' }
            ],
            enableGridMenu: true
        };

        // GET =====================================================================
        // when landing on the page, get all users and show them
        // use the service to get all the users
        Users.getAll()
            .then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.users = response.data;
                console.log(response.data);
                $scope.gridOptions.data = response.data;
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log('Error: ' + response);
            });

        // CREATE ==================================================================
        // when submitting the add form, send the text to the node API
        $scope.createUser = function() {

            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject($scope.formData)) {

                // call the create function from our service (returns a promise object)
                Users.create($scope.formData)

                // if successful creation, call our get function to get all the new users
                    .then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.formData = {}; // clear the form so our user is ready to enter another
                        $scope.users = response.data;
                        console.log(response.data);
                        $scope.gridOptions.data = response.data;
                    }, function errorCallback(response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        console.log('Error: ' + response);
                    });
            }
        };

        // DELETE ==================================================================
        // delete a user after checking it
        $scope.deleteUser = function(id) {
            Users.delete(id)
            // if successful creation, call our get function to get all the new users
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.users = response.data;
                    console.log(response.data);
                    $scope.gridOptions.data = response.data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        };

        // DELETE ==================================================================
        // delete a user after checking it
        $scope.getUser = function(id) {
            Users.get(id)
            // if successful creation, call our get function to get all the new users
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    //$scope.users = response.data;
                    console.log(response.data);
                    //$scope.gridOptions.data = response.data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        };
    });