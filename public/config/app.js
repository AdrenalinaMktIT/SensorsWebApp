var app = angular.module('sensorsWebApp', [
    'alertController', 'calculationController', 'clientController', 'deviceController', 'groupController', 'historicalController', 'inputController', 'measuresController', 'modelController', 'profileController', 'sensorController', 'statusController', 'userController',
    'appAlertService', 'alertService', 'calculationService', 'carrierService', 'clientService', 'deviceService', 'groupService', 'inputService', 'modelService', 'profileService', 'reportService', 'sensorService', 'typeService', 'timezoneService', 'userService',
    'ui.router', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter', 'highcharts-ng', 'ngMessages', 'ui.select', 'ngAnimate', 'ngSanitize', 'angularSpinner']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/status');

    $stateProvider

    // STATES AND NESTED VIEWS ========================================
        .state('groups', {
            url: '/groups',
            templateUrl: '../views/partial-groups.html',
            controller: 'GroupCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        })
        .state('sensors', {
            url: '/sensors',
            templateUrl: '../views/partial-sensors.html',
            controller: 'SensorCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        })
        .state('models', {
            url: '/models',
            templateUrl: '../views/partial-models.html',
            controller: 'ModelCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        })
        .state('clients', {
            url: '/clients',
            templateUrl: '../views/partial-clients.html',
            controller: 'ClientCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        })
        .state('alerts', {
            url: '/alerts',
            templateUrl: '../views/partial-alerts.html',
            controller: 'AlertCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        })
        .state('devices', {
            url: '/devices',
            templateUrl: '../views/partial-devices.html',
            controller: 'DeviceCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        })
        .state('users', {
            url: '/users',
            templateUrl: '../views/partial-users.html',
            controller: 'UserCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        })
        .state('profiles', {
            url: '/profiles',
            templateUrl: '../views/partial-profiles.html',
            controller: 'ProfileCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        })
        .state('historical', {
            url: '/historical',
            templateUrl: '../views/partial-historical.html',
            controller: 'HistoricalCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin', 'Monitoreo']
            }
        })
        .state('status', {
            url: '/status',
            templateUrl: '../views/partial-status.html',
            controller: 'StatusCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin', 'Monitoreo']
            }
        })
        .state('measures', {
            url: '/measures',
            templateUrl: '../views/partial-measures.html',
            controller: 'MeasuresCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin', 'Monitoreo']
            }
        })
        .state('calculations', {
        url: '/calculations',
        templateUrl: '../views/partial-calculations.html',
        controller: 'CalculationCtrl',
        controllerAs: 'vm',
            data: {
                roles: ['Admin', 'Monitoreo']
            }
        })
        .state('inputs', {
            url: '/inputs',
            templateUrl: '../views/partial-inputs.html',
            controller: 'InputCtrl',
            controllerAs: 'vm',
            data: {
                roles: ['Admin']
            }
        });
    // TODO messages
    // TODO statuses
    // TODO settings
});

app.controller('MainCtrl', function($scope, $transitions, $state) {

    $scope.init = function(user) {
        $scope.user = JSON.parse(user);
    };

    $transitions.onStart({}, function($transition) {
        let requiredRoles = $transition.$to().data.roles;
        let userRole = $scope.user.user_type;
        if (!_.contains(requiredRoles, userRole)) {
            return $state.target("status");
        }
    });
});