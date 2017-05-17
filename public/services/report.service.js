angular.module('reportService', []).factory('Reports', function ($http) {
        return {
            lastSensorMeasures: function (reportRequest) {
                return $http.post('/api/v1/lastSensorMeasures', reportRequest);
            },
            calculate: function (reportRequest) {
                return $http.post('/api/v1/reports', reportRequest);
            },
            status: function () {
                return $http.get('/api/v1/status');
            }
        }
    }
);