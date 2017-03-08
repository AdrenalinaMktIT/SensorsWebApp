angular.module('userService', []).factory('Users', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/users/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/users');
            },
            create: function (userData) {
                return $http.post('/api/v1/users', userData);
            },
            delete: function (id) {
                return $http.delete('/api/v1/users/' + id);
            },
            update: function (id, userData) {
                return $http.put('/api/v1/users/' + id, userData);
            }
        };
    }
);