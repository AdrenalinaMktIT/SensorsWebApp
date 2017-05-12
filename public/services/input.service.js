angular.module('inputService', []).factory('Inputs', function ($http) {
        return {
            getAll: function () {
                return $http.get('/api/v1/inputs');
            }
        }
    }
);