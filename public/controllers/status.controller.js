angular.module('statusController', [])
    .controller('StatusCtrl', function ($scope, $interval, $uibModal, allStatuses, allGroups, Reports, usSpinnerService) {
        var vm = this, imei, model, sensor, data, timestamp, status, checkingStatus;

        const intervalDelay = 30000;

        vm.sensorList = [];
        vm.sensorListCopy = [];
        vm.filteredByGroupSensorList = [];
        vm.filteredByStatusSensorList = [];

        vm.sensorChartConfig = [];

        vm.animationsEnabled = true;

        checkingStatus = $interval(function() {
            checkStatus()
        }, intervalDelay);

        vm.groups = allGroups.data.groups;
        vm.groups.unshift({
            _id: 'all',
            name: 'Todos'
        });

        vm.statuses = allStatuses;

        vm.group = { selected: vm.groups[0] };
        vm.status = { selected: vm.statuses[0] };

        vm.isOpen =  function (imei) {
            return _.some(vm.sensorList[imei], function (item) {
                return item.status === 'critical';
            });
        };

        vm.onOpenCloseSelectGroup = function (isOpen){
            if (!isOpen) {
                if (vm.group.selected._id === 'all') {
                    vm.filteredByGroupSensorList = vm.sensorListCopy;
                } else {
                    vm.filteredByGroupSensorList = _.filter(vm.sensorListCopy, function(item){ return item.sensor.group === vm.group.selected._id; });
                }
                vm.sensorList = _.intersection(vm.filteredByGroupSensorList, vm.filteredByStatusSensorList);
                vm.sensorList = _.groupBy(vm.sensorList, 'imei');
                drawSensors();
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
                vm.sensorList = _.groupBy(vm.sensorList, 'imei');
                drawSensors();
            }
        };

        vm.open = function (imei, idx) {
            var modalInstance = $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'statusModalContent.html',
                controller: 'StatusModalInstanceCtrl',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    sensorDetails: function () {
                        return vm.sensorList[imei][idx];
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

        let drawSensors = function () {
            _.each(vm.sensorList, function (sensors, imei, list) {

                _.each(sensors, function (value, key, list) {


                    let sensorNameClass;

                    switch (value.status) {
                        case 'critical':
                            sensorNameClass = 'bg-danger';
                            break;
                        case 'warning':
                            sensorNameClass = 'bg-warning';
                            break;
                        case 'ok':
                            sensorNameClass = 'bg-success';
                            break;
                        default:
                            sensorNameClass = 'bg-primary';
                    }

                    if (value.sensor.type._id === 'temp') {

                        vm.sensorChartConfig[value.imei + '_' + value.sensor._id] = {

                            chart: {
                                backgroundColor: '#c8c8c8',
                                type: 'solidgauge',
                                plotBackgroundColor: null,
                                plotBackgroundImage: null,
                                plotBorderWidth: 0,
                                plotShadow: false
                            },

                            title: {
                                text: "<h4 class='text-center " + sensorNameClass + "'>" + value.sensor.name + "</h4>",
                                margin: 0,
                                widthAdjust: 0,
                                useHTML: true
                            },

                            subtitle: {
                                text: "<div class='caption'>" + value.timestamp + "</div>",
                                useHTML: true
                            },

                            pane: {
                                center: ['50%', '85%'],
                                size: '100%',
                                startAngle: -90,
                                endAngle: 90,
                                background: {
                                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                                    innerRadius: '60%',
                                    outerRadius: '100%',
                                    shape: 'arc'
                                }
                            },

                            tooltip: {
                                enabled: false
                            },

                            // the value axis
                            yAxis: {
                                min: 0,
                                max: 200,
                                title: {
                                    text: value.sensor.type.name,
                                    y: -70
                                },
                                stops: [
                                    [0.1, '#55BF3B'], // green
                                    [0.5, '#DDDF0D'], // yellow
                                    [0.9, '#DF5353'] // red
                                ],
                                lineWidth: 0,
                                minorTickInterval: null,
                                tickAmount: 2,
                                labels: {
                                    y: 16
                                }
                            },

                            exporting: {
                                enabled: false
                            },

                            plotOptions: {
                                solidgauge: {
                                    dataLabels: {
                                        y: 5,
                                        borderWidth: 0,
                                        useHTML: true
                                    }
                                }
                            },

                            credits: {
                                enabled: false
                            },

                            series: [{
                                name: value.sensor.type.name,
                                data: [value.data],
                                dataLabels: {
                                    format: '<div style="text-align:center"><span style="font-size:20px;color:' +
                                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                                    '<span style="font-size:12px;">'+value.sensor.type.units+'</span></div>'
                                },
                                tooltip: {
                                    valueSuffix: ' ' + value.sensor.type.units
                                }
                            }]

                        };

                    } else {

                        vm.sensorChartConfig[value.imei + '_' + value.sensor._id] = {

                            credits: {
                                enabled: false
                            },

                            chart: {
                                backgroundColor: '#c8c8c8',
                                type: 'gauge',
                                plotBackgroundColor: null,
                                plotBackgroundImage: null,
                                plotBorderWidth: 0,
                                plotShadow: false
                            },

                            exporting: {
                                enabled: false
                            },

                            title: {
                                text: "<h4 class='text-center " + sensorNameClass + "'>" + value.sensor.name + "</h4>",
                                margin: 0,
                                widthAdjust: 0,
                                useHTML: true
                            },

                            subtitle: {
                                text: "<div class='caption'>" + value.timestamp + "</div>",
                                useHTML: true
                            },

                            pane: {
                                startAngle: -150,
                                endAngle: 150,
                                background: [{
                                    backgroundColor: {
                                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                                        stops: [
                                            [0, '#FFF'],
                                            [1, '#333']
                                        ]
                                    },
                                    borderWidth: 0,
                                    outerRadius: '109%'
                                }, {
                                    backgroundColor: {
                                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                                        stops: [
                                            [0, '#333'],
                                            [1, '#FFF']
                                        ]
                                    },
                                    borderWidth: 1,
                                    outerRadius: '107%'
                                }, {
                                    // default background
                                }, {
                                    backgroundColor: '#DDD',
                                    borderWidth: 0,
                                    outerRadius: '105%',
                                    innerRadius: '103%'
                                }]
                            },

                            // the value axis
                            yAxis: {
                                min: 0,
                                max: 200,

                                minorTickInterval: 'auto',
                                minorTickWidth: 1,
                                minorTickLength: 10,
                                minorTickPosition: 'inside',
                                minorTickColor: '#666',

                                tickPixelInterval: 30,
                                tickWidth: 2,
                                tickPosition: 'inside',
                                tickLength: 10,
                                tickColor: '#666',
                                labels: {
                                    step: 2,
                                    rotation: 'auto'
                                },
                                title: {
                                    text: value.sensor.type.units,
                                    verticalAlign: 'bottom',
                                },
                                plotBands: [{
                                    from: 0,
                                    to: 120,
                                    color: '#55BF3B' // green
                                }, {
                                    from: 120,
                                    to: 160,
                                    color: '#DDDF0D' // yellow
                                }, {
                                    from: 160,
                                    to: 200,
                                    color: '#DF5353' // red
                                }]
                            },

                            series: [{
                                name: value.sensor.type.name,
                                data: [value.data],
                                tooltip: {
                                    valueSuffix: ' ' + value.sensor.type.units
                                }
                            }]

                        };
                    }
                });
            });
        };

        function checkStatus() {
            usSpinnerService.spin('statusSpinner');
            Reports.status()
                .then(function successCallback(response) {
                    vm.sensorList = [];
                    _.each(response.data, (value, key, list) =>{
                        imei = value._id;
                        deviceName = value.device.name;
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
                            deviceName: deviceName,
                            model: model,
                            sensor: sensor,
                            data: data,
                            timestamp: timestamp,
                            status: status
                        });
                    });
                    vm.sensorListCopy = vm.sensorList;
                    vm.sensorList = _.groupBy(vm.sensorList, 'imei');
                    vm.onOpenCloseSelectGroup(false);
                    vm.onOpenCloseSelectStatus(false);

                    drawSensors();
                    usSpinnerService.stop('statusSpinner');
                }, function errorCallback(response) {
                    console.log('Error: ' + response);
                    usSpinnerService.stop('statusSpinner');
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

                        // busco el indice en el cual se encuentra el sensor en este imei.
                        var listOfSensorNames = _.pluck(measure.imei.sensors, '_id');
                        var sensorIdx = _.indexOf(listOfSensorNames, sensorDetails.sensor._id);
                        labels.push(moment(measure.timestamp).format('DD-MM-YYYY HH:mm:ss'));
                        labels = _.uniq(labels);
                        chartData.push(measure.data[sensorIdx]);
                    });

                    vm.sensorDetails.data = _.last(chartData);
                    vm.sensorDetails.timestamp = _.last(labels);

                    vm.chartConfig = {
                        credits: {
                            enabled: false
                        },
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