angular.module('deviceService', []).factory('Devices', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/devices/' + id);
            },
            getAll: function () {
                return $http.get('/api/devices');
            },
            create: function (deviceData) {
                return $http.post('/api/devices', deviceData);
            },
            delete: function (id) {
                return $http.delete('/api/devices/' + id);
            },
            update: function (id, deviceData) {
                return $http.put('/api/devices/' + id, deviceData);
            }
        }
    }
);