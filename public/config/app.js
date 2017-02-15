var app = angular.module('sensorsWebApp', ['userController', 'userService', 'ui.router', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

    // STATES AND NESTED VIEWS ========================================
        // TODO grupos
        .state('groups', {
            url: '/groups',
            templateUrl: '../views/partial-groups.html',
            controller: 'GroupCtrl'
        })
        // TODO sensores
        .state('sensors', {
            url: '/sensors',
            templateUrl: '../views/partial-sensors.html',
            controller: 'SensorCtrl'
        })
        // TODO alertas
        .state('alerts', {
            url: '/alerts',
            templateUrl: '../views/partial-alerts.html',
            controller: 'AlertCtrl'
        })
        // TODO equipos
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