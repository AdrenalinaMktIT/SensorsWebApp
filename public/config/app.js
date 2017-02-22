var app = angular.module('sensorsWebApp', [
    'deviceController', 'alertController', 'groupController', 'sensorController', 'userController',
    'deviceService', 'alertService', 'clientService', 'groupService', 'sensorService', 'timezoneService', 'userService',
    'ui.router', 'ui.bootstrap', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

    // STATES AND NESTED VIEWS ========================================
        .state('groups', {
            url: '/groups',
            templateUrl: '../views/partial-groups.html',
            controller: 'GroupCtrl'
        })
        .state('sensors', {
            url: '/sensors',
            templateUrl: '../views/partial-sensors.html',
            controller: 'SensorCtrl'
        })
        .state('alerts', {
            url: '/alerts',
            templateUrl: '../views/partial-alerts.html',
            controller: 'AlertCtrl'
        })
        .state('devices', {
            url: '/devices',
            templateUrl: '../views/partial-devices.html',
            controller: 'DeviceCtrl'
        })
        .state('users', {
                url: '/users',
                templateUrl: '../views/partial-users.html',
                controller: 'UserCtrl'
        })
        // TODO ingresos a sistema
        .state('inputs', {
            url: '/inputs',
            templateUrl: '../views/partial-inputs.html',
            controller: 'InputCtrl'
        });
});