angular.module('userService', []).factory('Users', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/users/' + id);
            },
            getAll: function () {
                return $http.get('/api/users');
            },
            create: function (userData) {
                return $http.post('/api/users', userData);
            },
            delete: function (id) {
                return $http.delete('/api/users/' + id);
            },
            update: function (id, userData) {
                return $http.put('/api/users/' + id, userData);
            }
        }
    }
);