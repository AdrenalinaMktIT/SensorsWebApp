angular.module('statusController', [])
    .controller('StatusCtrl', function ($uibModal, $log, Reports) {
        var vm = this, imei, model, sensor, data, timestamp, status;

        vm.list = [];

        vm.animationsEnabled = true;

        vm.open = function (idx) {
            var modalInstance = $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'statusModalContent.html',
                controller: 'StatusModalInstanceCtrl',
                controllerAs: '$statusModalCtrl',
                size: 'lg',
                resolve: {
                    sensorDetails: function () {
                        return vm.list[idx];
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

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
                    sensor = value.sensor;
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
    })
    .controller('StatusModalInstanceCtrl', function ($uibModalInstance, Reports, sensorDetails, usSpinnerService) {
        var statusModalCtrl = this;

        statusModalCtrl.sensorDetails = sensorDetails;

        statusModalCtrl.ok = function () {
            $uibModalInstance.close();
        };

        statusModalCtrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        statusModalCtrl.startSpin = function() {
            usSpinnerService.spin('sensorReportSpinner');
        };

        statusModalCtrl.stopSpin = function() {
            usSpinnerService.stop('sensorReportSpinner');
        };

        statusModalCtrl.getSensorReport = function () {

            statusModalCtrl.startSpin();
            // TODO dateFrom hay q poner 1 semana para atras por ejemplo.
            var reportRequest = {
                "dateFrom": moment().subtract(77, 'days').format('YYYY-MM-DD'),
                "dateTo": moment().format('YYYY-MM-DD'),
                "sensors": sensorDetails.sensor._id
            };

            statusModalCtrl.labels = [];
            statusModalCtrl.data = [];
            statusModalCtrl.series = [];
            /*$scope.options = {
             scales: {
             yAxes: [{
             ticks: {
             beginAtZero:true
             }
             }]
             }
             };*/
            var sensorName = sensorDetails.sensor.name + ' (' + sensorDetails.sensor.type + ')';
            Reports.calculate(reportRequest)
                .then(function successCallback(response) {
                    statusModalCtrl.stopSpin();
                    var seriesData = [];

                    response.data.forEach(function(measure, idx, arr) {

                        // busco el indice en el cual se encuentra el sensor en el modelo configurado para este imei.
                        var listOfSensorNames = _.pluck(measure.imei.model.sensors, '_id');
                        var sensorIdx = _.indexOf(listOfSensorNames, sensorDetails.sensor._id);
                        statusModalCtrl.labels.push(moment(measure.timestamp).format('DD-MM-YYYY HH:mm:ss'));
                        statusModalCtrl.labels = _.uniq(statusModalCtrl.labels);
                        seriesData.push(measure.data[sensorIdx]);

                    });
                    statusModalCtrl.series.push(sensorName);
                    statusModalCtrl.data.push(seriesData);

                }, function errorCallback(response) {
                    statusModalCtrl.stopSpin();
                    console.log('Error: ' + response);
                });
        }
    });