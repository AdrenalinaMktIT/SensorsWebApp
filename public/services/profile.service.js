/**
 * Created by Sebastian on 24/02/2017.
 */
angular.module('profileService', []).factory('Profiles', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/profiles/' + id);
            },
            getAll: function () {
                return $http.get('/api/profiles');
            },
            create: function (profileData) {
                return $http.post('/api/profiles', profileData);
            },
            delete: function (id) {
                return $http.delete('/api/profiles/' + id);
            },
            update: function (id, profileData) {
                return $http.put('/api/profiles/' + id, profileData);
            }
        }
    }
);