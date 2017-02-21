angular.module('clientService', []).factory('Clients', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/clients/' + id);
            },
            getAll: function () {
                return $http.get('/api/clients');
            },
            create: function (clientData) {
                return $http.post('/api/clients', clientData);
            },
            delete: function (id) {
                return $http.delete('/api/clients/' + id);
            },
            update: function (id, clientData) {
                return $http.put('/api/clients/' + id, clientData);
            }
        }
    }
);