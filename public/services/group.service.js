angular.module('groupService', []).factory('Groups', function ($http) {
        return {
            get: function (id) {
                return $http.get('/api/groups/' + id);
            },
            getAll: function () {
                return $http.get('/api/groups');
            },
            create: function (groupData) {
                return $http.post('/api/groups', groupData);
            },
            delete: function (id) {
                return $http.delete('/api/groups/' + id);
            },
            update: function (id, groupData) {
                return $http.put('/api/groups/' + id, groupData);
            }
        }
    }
);