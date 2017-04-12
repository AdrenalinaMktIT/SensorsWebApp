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
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    sensorDetails: function () {
                        return vm.list[idx];
                    }
                }
            });

            modalInstance.result.then(function (data) {
            }, function () {
                //vm.chartConfig.getChartObj().reflow();
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
        var vm = this;

        vm.selectedGraphTab = false;

        vm.sensorDetails = sensorDetails;

        vm.ok = function () {
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        vm.startSpin = function() {
            usSpinnerService.spin('sensorReportSpinner');
        };

        vm.stopSpin = function() {
            usSpinnerService.stop('sensorReportSpinner');
        };

        vm.getSensorReport = function () {

            vm.startSpin();
            // TODO dateFrom hay que poner 7 dias (1 sem) para atras por ejemplo. '77' es para probar y que haya mas data.
            var reportRequest = {
                "dateFrom": moment().subtract(77, 'days').format('YYYY-MM-DD'),
                "dateTo": moment().format('YYYY-MM-DD'),
                "sensors": sensorDetails.sensor._id
            };

            var labels = [], chartData = [];

            var sensorName = sensorDetails.sensor.name + ' (' + sensorDetails.sensor.type + ')';
            Reports.calculate(reportRequest)
                .then(function successCallback(response) {
                    vm.stopSpin();

                    response.data.forEach(function(measure, idx, arr) {

                        // busco el indice en el cual se encuentra el sensor en el modelo configurado para este imei.
                        var listOfSensorNames = _.pluck(measure.imei.model.sensors, '_id');
                        var sensorIdx = _.indexOf(listOfSensorNames, sensorDetails.sensor._id);
                        labels.push(moment(measure.timestamp).format('DD-MM-YYYY HH:mm:ss'));
                        labels = _.uniq(labels);
                        chartData.push(measure.data[sensorIdx]);
                    });

                    vm.chartConfig = {
                        chart: {
                            zoomType: ' x'
                        },
                        title: {
                            text: 'Ultimas Lecturas ' + sensorName
                        },
                        subtitle: {
                            text: 'Hacer clic y arrastrar en el area para hacer zoom.'
                        },
                        xAxis: {
                            type: 'datetime',
                            categories: labels
                        },
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            area: {
                                fillColor: {
                                    linearGradient: {
                                        x1: 0,
                                        y1: 0,
                                        x2: 0,
                                        y2: 1
                                    },
                                    stops: [
                                        [0, Highcharts.getOptions().colors[0]],
                                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                    ]
                                },
                                marker: {
                                    radius: 2
                                },
                                lineWidth: 1,
                                states: {
                                    hover: {
                                        lineWidth: 1
                                    }
                                },
                                threshold: null
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Ult. Lecturas'
                            }
                        },
                        series: [{
                            type: 'area',
                            name: sensorName,
                            data: chartData
                        }]
                    };

                    vm.selectedGraphTab = true;

                }, function errorCallback(response) {
                    vm.stopSpin();
                    console.log('Error: ' + response);
                });
        }
    });