var app = angular.module('sensorsWebApp', [
    'alertController', 'deviceController', 'groupController', 'historicalController', 'profileController', 'sensorController', 'statusController', 'userController',
    'appAlertService', 'alertService', 'carrierService', 'clientService', 'deviceService', 'groupService', 'profileService', 'reportService', 'sensorService', 'typeService', 'timezoneService', 'userService',
    'ui.router', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter', 'chart.js', 'ngMessages', 'ui.select', 'ngAnimate', 'ngSanitize']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/status');

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
        })
        .state('historical', {
        url: '/historical',
        templateUrl: '../views/partial-historical.html',
        controller: 'HistoricalCtrl'
        })
        .state('status', {
            url: '/status',
            templateUrl: '../views/partial-status.html',
            controller: 'StatusCtrl'
        });
});