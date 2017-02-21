angular.module('timezoneService', []).factory('Timezones', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/timezones/' + id);
            },
            getAll: function () {
                return $http.get('/api/timezones');
            }
        }
    }
);