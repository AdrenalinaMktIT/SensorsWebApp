angular.module('groupService', []).factory('Groups', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/v1/groups/' + id);
            },
            getAll: function () {
                return $http.get('/api/v1/groups');
            },
            create: function (groupData) {
                return $http.post('/api/v1/groups', groupData);
            },
            delete: function (id) {
                return $http.delete('/api/v1/groups/' + id);
            },
            update: function (id, groupData) {
                return $http.put('/api/v1/groups/' + id, groupData);
            }
        }
    }
);