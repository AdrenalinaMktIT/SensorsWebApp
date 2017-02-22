angular.module('sensorService', []).factory('Sensors', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/sensors/' + id);
            },
            getAll: function () {
                return $http.get('/api/sensors');
            },
            create: function (sensorData) {
                return $http.post('/api/sensors', sensorData);
            },
            delete: function (id) {
                return $http.delete('/api/sensors/' + id);
            },
            update: function (id, sensorData) {
                return $http.put('/api/sensors/' + id, sensorData);
            }
        }
    }
);