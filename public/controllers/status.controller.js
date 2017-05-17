angular.module('statusController', [])
    .controller('StatusCtrl', function ($uibModal, $log, Groups, Reports) {
        var vm = this, imei, model, sensor, data, timestamp, status;

        vm.sensorList = [];
        vm.sensorListCopy = [];

        vm.animationsEnabled = true;

        // use the service to get all the groups and statuses.
        loadGroups();
        loadStatuses();

        function loadGroups() {
            Groups.getAll()
                .then(function successCallback(response) {
                    vm.groups = [];
                    vm.groups.push({
                        _id: 'all',
                        name: 'Todos'
                    });
                    for (var i = 0; i < response.data.groups.length; i++) {
                        vm.groups.push(response.data.groups[i]);
                    }
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }

        function loadStatuses() {
            vm.statuses  = [];
            vm.statuses .push(
                {
                    _id: 'all',
                    name: 'Todos'
                },
                {
                    _id: 'critical',
                    name: 'Critico'
                },
                {
                    _id: 'warning',
                    name: 'Advertencia'
                },
                {
                    _id: 'ok',
                    name: 'Normal'
                },
                {
                    _id: 'unknown',
                    name: 'Desconocido'
                });
        }

        vm.onOpenCloseSelectGroup = function (isOpen){
            if (!isOpen) {
                if (vm.group.selected._id === 'all') {
                    vm.sensorList = vm.sensorListCopy;
                } else {
                    vm.sensorList = _.filter(vm.sensorListCopy, function(item){ return item.sensor.group === vm.group.selected._id; });
                }
            }
        };

        vm.onOpenCloseSelectStatus = function (isOpen){
            if (!isOpen) {
                if (vm.status.selected._id === 'all') {
                    vm.sensorList = vm.sensorListCopy;
                } else {
                    vm.sensorList = _.filter(vm.sensorListCopy, function(item){ return item.status === vm.status.selected._id; });
                }
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

        Reports.status()
            .then(function successCallback(response) {
                _.each(response.data, function(value) {
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