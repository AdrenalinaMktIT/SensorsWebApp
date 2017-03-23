angular.module('profileService', []).factory('Profiles', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/profiles/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/profiles');
            },
            create: function (profileData) {
                return $http.post('/api/v1/profiles', profileData);
            },
            delete: function (id) {
                return $http.delete('/api/v1/profiles/' + id);
            },
            update: function (id, profileData) {
                return $http.put('/api/v1/profiles/' + id, profileData);
            }
        }
    }
);