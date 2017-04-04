var app = angular.module('sensorsWebApp', [
    'alertController', 'deviceController', 'groupController', 'historicalController', 'profileController', 'sensorController', 'statusController', 'userController',
    'appAlertService', 'alertService', 'carrierService', 'clientService', 'deviceService', 'groupService', 'profileService', 'reportService', 'sensorService', 'typeService', 'timezoneService', 'userService',
    'ui.router', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter', 'chart.js', 'ngMessages', 'ui.select', 'ngAnimate', 'ngSanitize', 'angularSpinner']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/status');

    $stateProvider

    // STATES AND NESTED VIEWS ========================================
        .state('groups', {
            url: '/groups',
            templateUrl: '../views/partial-groups.html',
            controller: 'GroupCtrl',
            controllerAs: 'vm'
        })
        .state('sensors', {
            url: '/sensors',
            templateUrl: '../views/partial-sensors.html',
            controller: 'SensorCtrl',
            controllerAs: 'vm'
        })
        .state('alerts', {
            url: '/alerts',
            templateUrl: '../views/partial-alerts.html',
            controller: 'AlertCtrl',
            controllerAs: 'vm'
        })
        .state('devices', {
            url: '/devices',
            templateUrl: '../views/partial-devices.html',
            controller: 'DeviceCtrl',
            controllerAs: 'vm'
        })
        .state('users', {
            url: '/users',
            templateUrl: '../views/partial-users.html',
            controller: 'UserCtrl',
            controllerAs: 'vm'
        })
        .state('profiles', {
            url: '/profiles',
            templateUrl: '../views/partial-profiles.html',
            controller: 'ProfileCtrl',
            controllerAs: 'vm'
        })
        // TODO inputs
        .state('inputs', {
            url: '/inputs',
            templateUrl: '../views/partial-inputs.html',
            controller: 'InputCtrl',
            controllerAs: 'vm'
        })
        .state('historical', {
            url: '/historical',
            templateUrl: '../views/partial-historical.html',
            controller: 'HistoricalCtrl',
            controllerAs: 'vm'
        })
        .state('status', {
            url: '/status',
            templateUrl: '../views/partial-status.html',
            controller: 'StatusCtrl',
            controllerAs: 'vm'
        });
    // TODO listing
    // TODO calculations
    // TODO messages
    // TODO statuses
    // TODO settings
});