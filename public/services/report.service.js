angular.module('reportService', []).factory('Reports', function ($http) {
        return {
            calculate: function (reportRequest) {
                return $http.post('/api/v1/reports', reportRequest);
            }
        }
    }
);