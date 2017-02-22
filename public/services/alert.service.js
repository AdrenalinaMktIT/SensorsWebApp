angular.module('alertService', []).factory('Alerts', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/alerts/' + id);
            },
            getAll: function () {
                return $http.get('/api/alerts');
            },
            create: function (alertData) {
                return $http.post('/api/alerts', alertData);
            },
            delete: function (id) {
                return $http.delete('/api/alerts/' + id);
            },
            update: function (id, alertData) {
                return $http.put('/api/alerts/' + id, alertData);
            }
        }
    }
);