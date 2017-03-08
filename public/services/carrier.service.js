angular.module('carrierService', []).factory('Carriers', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/carriers/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/carriers');
            }
        }
    }
);