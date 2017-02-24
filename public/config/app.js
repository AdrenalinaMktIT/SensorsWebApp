var app = angular.module('sensorsWebApp', [
    'alertController', 'deviceController', 'groupController', 'profileController', 'sensorController', 'userController',
    'alertService', 'carrierService', 'clientService', 'deviceService', 'groupService', 'profileService', 'sensorService', 'timezoneService', 'userService',
    'ui.router', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/devices');

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
        .state('profiles', {
            url: '/profiles',
            templateUrl: '../views/partial-profiles.html',
            controller: 'ProfileCtrl'
        })
        // TODO ingresos a sistema
        .state('inputs', {
            url: '/inputs',
            templateUrl: '../views/partial-inputs.html',
            controller: 'InputCtrl'
        });
});