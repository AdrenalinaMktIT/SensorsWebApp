var appServices = angular.module('appAlertService', []);
appServices.factory('AppAlert', [
    '$rootScope', function($rootScope) {
        var alertService;
        $rootScope.alerts = [];
        return alertService = {
            add: function(type, msg) {
                return $rootScope.alerts.push({
                    type: 'alert-' + type,
                    msg: msg,
                    close: function() {
                        return alertService.closeAlert(this);
                    }
                });
            },
            closeAlert: function(alert) {
                return this.closeAlertIdx($rootScope.alerts.indexOf(alert));
            },
            closeAlertIdx: function(index) {
                return $rootScope.alerts.splice(index, 1);
            }
        };
    }
]);