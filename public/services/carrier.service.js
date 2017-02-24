angular.module('carrierService', []).factory('Carriers', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/carriers/' + id);
            },
            getAll: function () {
                return $http.get('/api/carriers');
            }
        }
    }
);