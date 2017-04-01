angular.module('statusController', [])
    .controller('StatusCtrl', function (Reports) {
        var vm = this, imei, model, sensor, data, timestamp, status;

        vm.list = [];

        var checkCritical = function (data, criticalRanges) {

            var isCritical = false;

            _.some(criticalRanges, function(value) {
                if ((data >= value.greather_than) && (data <= value.less_than)) {
                    isCritical = true;
                }
            });

            return isCritical;
        };

        var checkWarning = function (data, warningRanges) {

            var isWarning = false;

            _.some(warningRanges, function(value) {
                if ((data >= value.greather_than) && (data <= value.less_than)) {
                    isWarning = true;
                }
            });

            return isWarning;
        };

        var checkOk = function (data, okRanges) {

            var isOk = false;

            _.some(okRanges, function(value) {
                if ((data >= value.greather_than) && (data <= value.less_than)) {
                    isOk = true;
                }
            });

            return isOk;
        };

        Reports.status()
            .then(function successCallback(response) {
                console.log('Success: ' + response);

                _.each(response.data, function(value) {
                    imei = value._id;
                    model = value.model.name;
                    sensor = value.sensor.name;
                    data = value.data;
                    timestamp = moment(value.timestamp).format("DD/MM/YYYY hh:mm:ss");
                    if (checkCritical(data, value.sensor.params.critical)) {
                        status = "critical";
                    } else if (checkWarning(data, value.sensor.params.warning)) {
                        status = "warning";
                    } else if (checkOk(data, value.sensor.params.ok)) {
                        status = "ok";
                    } else {
                        status = "unknown";
                    }
                    vm.list.push({
                        imei: imei,
                        model: model,
                        sensor: sensor,
                        data: data,
                        timestamp: timestamp,
                        status: status
                    });
                });


            }, function errorCallback(response) {
                console.log('Error: ' + response);
            });
    });
