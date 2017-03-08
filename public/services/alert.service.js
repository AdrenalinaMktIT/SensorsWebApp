angular.module('alertService', []).factory('Alerts', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/alerts/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/alerts');
            },
            create: function (alertData) {
                return $http.post('/api/v1/alerts', alertData);
            },
            delete: function (id) {
                return $http.delete('/api/v1/alerts/' + id);
            },
            update: function (id, alertData) {
                return $http.put('/api/v1/alerts/' + id, alertData);
            }
        }
    }
);