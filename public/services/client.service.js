angular.module('clientService', []).factory('Clients', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/clients/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/clients');
            },
            create: function (clientData) {
                return $http.post('/api/v1/clients', clientData);
            },
            delete: function (id) {
                return $http.delete('/api/v1/clients/' + id);
            },
            update: function (id, clientData) {
                return $http.put('/api/v1/clients/' + id, clientData);
            }
        }
    }
);