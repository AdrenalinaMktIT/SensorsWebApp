angular.module('statusController', [])
    .controller('StatusCtrl', function ($scope, $interval, $uibModal, allStatuses, allGroups, Reports) {
        var vm = this, imei, model, sensor, data, timestamp, status, checkingStatus;

        vm.sensorList = [];
        vm.sensorListCopy = [];
        vm.filteredByGroupSensorList = [];
        vm.filteredByStatusSensorList = [];

        vm.animationsEnabled = true;

        checkingStatus = $interval(function() {
            checkStatus()
        }, 10000);

        vm.groups = allGroups.data.groups;
        vm.groups.unshift({
            _id: 'all',
            name: 'Todos'
        });

        vm.statuses = allStatuses;

        vm.group = { selected: vm.groups[0] };
        vm.status = { selected: vm.statuses[0] };

        vm.onOpenCloseSelectGroup = function (isOpen){
            if (!isOpen) {
                if (vm.group.selected._id === 'all') {
                    vm.filteredByGroupSensorList = vm.sensorListCopy;
                } else {
                    vm.filteredByGroupSensorList = _.filter(vm.sensorListCopy, function(item){ return item.sensor.group === vm.group.selected._id; });
                }
                vm.sensorList = _.intersection(vm.filteredByGroupSensorList, vm.filteredByStatusSensorList);
            }
        };

        vm.onOpenCloseSelectStatus = function (isOpen){
            if (!isOpen) {
                if (vm.status.selected._id === 'all') {
                    vm.filteredByStatusSensorList = vm.sensorListCopy;
                } else {
                    vm.filteredByStatusSensorList = _.filter(vm.sensorListCopy, function(item){ return item.status === vm.status.selected._id; });
                }
                vm.sensorList = _.intersection(vm.filteredByGroupSensorList, vm.filteredByStatusSensorList);
            }
        };

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
                        return vm.sensorList[idx];
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

        function checkStatus() {
            Reports.status()
                .then(function successCallback(response) {
                    vm.sensorList = [];
                    _.each(response.data, function (value) {
                        imei = value._id;
                        model = value.model.name;
                        sensor = value.sensor;
                        data = value.data;
                        timestamp = moment(value.timestamp).format("DD/MM/YYYY HH:mm:ss");
                        if (checkCritical(data, value.sensor.params.critical)) {
                            status = "critical";
                        } else if (checkWarning(data, value.sensor.params.warning)) {
                            status = "warning";
                        } else if (checkOk(data, value.sensor.params.ok)) {
                            status = "ok";
                        } else {
                            status = "unknown";
                        }
                        vm.sensorList.push({
                            imei: imei,
                            model: model,
                            sensor: sensor,
                            data: data,
                            timestamp: timestamp,
                            status: status
                        });
                    });
                    vm.sensorListCopy = vm.sensorList;
                    vm.onOpenCloseSelectGroup(false);
                    vm.onOpenCloseSelectStatus(false);
                }, function errorCallback(response) {
                    console.log('Error: ' + response);
                });
        }

        checkStatus();

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $interval.cancel(checkingStatus);
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
            var reportRequest = {
                "dateFrom": moment().format('YYYY-MM-DD'),
                "dateTo": moment().add(1, 'days').format('YYYY-MM-DD'),
                "sensorId": sensorDetails.sensor._id
            };

            var labels = [], chartData = [];

            var sensorName = sensorDetails.sensor.name + ' (' + sensorDetails.sensor.type.name + ' [' + sensorDetails.sensor.type.units + '])';
            Reports.lastSensorMeasures(reportRequest)
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

                    vm.sensorDetails.data = _.last(chartData);
                    vm.sensorDetails.timestamp = _.last(labels);

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