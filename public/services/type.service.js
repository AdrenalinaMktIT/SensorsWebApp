angular.module('typeService', []).factory('Types', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/types/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/types');
            }
        }
    }
);