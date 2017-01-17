/**
 * Load modules for application
 */

/*angular.module('sensorsWebApp', ['todoController', 'todoService']);*/

angular.module('sensorsWebApp', [
    'ui.router',
    'sensorsWebApp.homeService'
])

.constant('CONFIG',
    {
        DebugMode: true,
        StepCounter: 0,
        APIHost: 'http://localhost:8080'
    });