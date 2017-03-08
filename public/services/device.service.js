angular.module('deviceService', []).factory('Devices', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/devices/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/devices');
            },
            create: function (deviceData) {
                return $http.post('/api/v1/devices', deviceData);
            },
            delete: function (id) {
                return $http.delete('/api/v1/devices/' + id);
            },
            update: function (id, deviceData) {
                return $http.put('/api/v1/devices/' + id, deviceData);
            }
        }
    }
);