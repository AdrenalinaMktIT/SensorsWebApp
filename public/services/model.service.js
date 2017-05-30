angular.module('modelService', []).factory('Models', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/models/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/models');
            },
            create: function (modelData) {
                return $http.post('/api/v1/models', modelData);
            },
            delete: function (id) {
                return $http.delete('/api/v1/models/' + id);
            },
            update: function (id, modelData) {
                return $http.put('/api/v1/models/' + id, modelData);
            }
        }
    }
);