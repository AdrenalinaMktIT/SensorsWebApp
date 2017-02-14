var app = angular.module('sensorsWebApp', ['ui.router', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        /*.state('home', {
            url: '/home',
            templateUrl: 'partial-home.html'
        })

        // nested list with custom controller
        .state('home.list', {
            url: '/list',
            templateUrl: 'partial-home-list.html',
            controller: function($scope) {
                $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
            }
        })

        // nested list with just some random string data
        .state('home.paragraph', {
            url: '/paragraph',
            template: 'I could sure use a drink right now.'
        })*/

        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('groups', {
            url: '/groups',
            views: {
                '': { templateUrl: '../views/partial-groups.html' },
                'columnOne@about': { template: 'Look I am a column!' },
                'columnTwo@about': {
                    templateUrl: '../views/table-data.html',
                    controller: 'scotchController'
                }
            }

        })
            .state('users', {
                url: '/users',
                templateUrl: '../views/partial-users.html',
                controller: 'UserCtrl'
            }
        );

});

app.controller('scotchController', function($scope) {

    $scope.message = 'test';

    $scope.scotches = [
        {
            name: 'Macallan 12',
            price: 50
        },
        {
            name: 'Chivas Regal Royal Salute',
            price: 10000
        },
        {
            name: 'Glenfiddich 1937',
            price: 20000
        }
    ];

});
app.controller('UserCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.formData = {};

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
                '<button id="readBtn" ng-click="grid.appScope.read(row.entity)" type="button" class="btn btn-default"><i class="fa fa-eye" aria-hidden="true"></i></button> ' +
                '<button id="updateBtn" ng-click="grid.appScope.update(row.entity)" type="button" class="btn btn-default"><i class="fa fa-pencil" aria-hidden="true"></i></button> ' +
                '<button id="deleteBtn" ng-click="grid.appScope.delete(row.entity)" type="button" class="btn btn-default"><i class="fa fa-trash" aria-hidden="true"></i></button> </div>' }
        ],
        enableGridMenu: true
    };
    
    // when landing on the page, get all users and show them
    $http.get('/api/users').then(function successCallback(response) {
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

    // when submitting the add form, send the text to the node API
    $scope.createUser = function() {
        $http.post('/api/users', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.users = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a user after checking it
    $scope.deleteUser = function(id) {
        $http.delete('/api/users/' + id)
            .success(function(data) {
                $scope.users = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };


    /*$scope.myData = [
        {
            "firstName": "Cox",
            "lastName": "Carney",
            "company": "Enormo",
            "employed": true
        },
        {
            "firstName": "Lorraine",
            "lastName": "Wise",
            "company": "Comveyer",
            "employed": false
        },
        {
            "firstName": "Nancy",
            "lastName": "Waters",
            "company": "Fuelton",
            "employed": false
        }
    ];*/
}]);
