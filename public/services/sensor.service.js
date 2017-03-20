angular.module('sensorService', []).factory('Sensors', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/sensors/' + id);
            },
            getByType: function (typeId) {
                return $http.get('/api/v1/sensors/type/' + typeId);
            },
            getAll: function () {
                return $http.get('/api/v1/sensors');
            },
            create: function (sensorData) {
                return $http.post('/api/v1/sensors', sensorData);
            },
            delete: function (id) {
                return $http.delete('/api/v1/sensors/' + id);
            },
            update: function (id, sensorData) {
                return $http.put('/api/v1/sensors/' + id, sensorData);
            }
        }
    }
);