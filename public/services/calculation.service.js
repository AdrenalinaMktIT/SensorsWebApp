angular.module('calculationService', []).factory('Calculations', function ($http) {
        return {
            getAll: function () {
                return $http.get('/api/v1/calculations');
            },
            getAvailableDevices: function(calcId) {
                return $http.get('/api/v1/calculations/' + calcId);
            },
            thi: function (thiData) {
                 return $http.post('/api/v1/calculations/thi', thiData);
            },
            para: function (paraData) {
                return $http.post('/api/v1/calculations/para', paraData);
            }
        }
    }
);