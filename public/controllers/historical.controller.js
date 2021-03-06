angular.module('historicalController', [])
    .directive('compileTemplate', function($compile, $parse){
        return {
            link: function(scope, element, attr){
                var parsed = $parse(attr.ngBindHtml);
                function getStringValue() { return (parsed(scope) || '').toString(); }

                //Recompile if the template changes
                scope.$watch(getStringValue, function() {
                    $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
                });
            }
        }
    })
    .controller('HistoricalCtrl', function ($scope, $sce, $uibModal, $log, Reports, Sensors, Types, AppAlert, usSpinnerService){
        var vm = this;

        vm.checkModel = {};

        Types.getAll()
            .then(function successCallback(response) {
                vm.types = [];
                vm.types.push({
                    _id: 'all',
                    name: 'Todos'
                });
                for (var i = 0; i < response.data.types.length; i++) {
                    vm.types.push(response.data.types[i]);
                }

            }, function errorCallback(response) {
                console.log('Error: ' + response);
            });

        vm.report = function (historicalForm) {
            // me quedo solo con los sensores que estan tildados ('true')
            var selectedSensors = _.pick(vm.checkModel, function(value, key, object) {
                return _.isBoolean(value) && value === true;
            });

            if (_.size(selectedSensors) == 0) {
                AppAlert.add('danger', 'Error ! Debe seleccionar al menos 1 sensor.');
            } else {

                if (historicalForm.$valid) {
                    var sensorKeys = _.map(_.keys(selectedSensors), function (elem) {
                        return parseInt(elem.substr(1));
                    });
                    var reportRequest = {
                        "dateFrom": moment($scope.dateFrom).format('YYYY-MM-DD'),
                        "dateTo": moment($scope.dateTo).format('YYYY-MM-DD'),
                        "sensors": sensorKeys
                    };

                    usSpinnerService.spin('historicalGraphSpinner');
                    Reports.calculate(reportRequest)
                        .then(function successCallback(response) {
                            usSpinnerService.stop('historicalGraphSpinner');

                            let measures = response.data;

                            var seriesData = [];
                            var labels = [], series = [], chartData = [];

                            for (let i =0; i < sensorKeys.length; i++) {

                                let sensorName = '';
                                let sensorType = {};

                                seriesData = [];

                                measures.forEach(function(measure, idx, arr) {

                                    if (measure.sensorId === sensorKeys[i]) {
                                        sensorName = measure.sensorName;
                                        sensorType = measure.sensorType;
                                        labels.push(moment(measure.timestamp).format('DD-MM-YYYY HH:mm:ss'));
                                        seriesData.push(measure.data !== -99 ? measure.data : null);
                                    }

                                });



                                chartData.push({
                                    type: 'area',
                                    name: sensorName + ' (' + sensorType.units + ')',
                                    data: seriesData
                                });
                            }

                            vm.chartConfig = {
                                chart: {
                                    zoomType: ' x'
                                },
                                title: {
                                    text: 'Rango de fechas entre ' + moment($scope.dateFrom).format('DD-MM-YYYY') + ' hasta ' + moment($scope.dateTo).format('DD-MM-YYYY')
                                },
                                subtitle: {
                                    text: 'Hacer clic y arrastrar en el area para hacer zoom.'
                                },
                                xAxis: {
                                    type: 'datetime',
                                    categories: labels
                                },
                                legend: {
                                    layout: 'vertical',
                                    borderWidth: 1,
                                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
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
                                        text: 'Lecturas'
                                    }
                                },
                                series: chartData
                            };

                            if (response.data.length > 0) {
                                vm.openReportModal();
                            } else {
                                AppAlert.add('warning', 'No hay datos para ese sensor.');
                            }

                        }, function errorCallback(response) {
                            usSpinnerService.stop('historicalGraphSpinner');
                            console.log('Error: ' + response);
                        });
                }
            }
        };

        function showCollapsibleSensors(sensors) {
            vm.checkModel = {};
            $scope.groups = [];
            // separo por los sensores que se encuentran agrupados y los que ya tienen grupo.
            var separatedSensors = _.groupBy(sensors, function (num) {
                return num.group == null;
            });
            var withoutGroupSensors = separatedSensors.true;
            var agrupatedSensors = separatedSensors.false;
            var separatedAgrupatedSensors = _.pairs(_.groupBy(agrupatedSensors, function (item) {
                return item.group.name;
            }));
            var sensor = '';
            for (var i = 0; i < separatedAgrupatedSensors.length; i++) {
                sensor = '';
                var groupName = separatedAgrupatedSensors[i][0];
                var groupSensorsArray = separatedAgrupatedSensors[i][1];
                for (var j = 0; j < groupSensorsArray.length; j++) {
                    sensor += '<div class="input-group"><span class="input-group-addon"><input type="checkbox" ng-model="vm.checkModel.s' + groupSensorsArray[j]._id + '" ></span><label class="form-control" >SENSOR ' + groupSensorsArray[j].name + '</div>';
                }
                $scope.groups.push({
                    title: $sce.trustAsHtml('GRUPO ' + groupName + ' <span class="badge">' + groupSensorsArray.length + '</span>'),
                    content: $sce.trustAsHtml(sensor)
                })
            }
            sensor = '<div class="btn-group">';
            for (var k = 0; k < withoutGroupSensors.length; k++) {
                sensor += '<div class="input-group"><span class="input-group-addon"><input type="checkbox" ng-model="vm.checkModel.s' + withoutGroupSensors[k]._id + '" ></span><label class="form-control" >SENSOR ' + withoutGroupSensors[k].name + '</div>';
            }
            $scope.groups.push({
                title: $sce.trustAsHtml('SENSORES SIN GRUPO <span class="badge">' + withoutGroupSensors.length + '</span>'),
                content: $sce.trustAsHtml(sensor)
            })
        }

        vm.onOpenClose = function (isOpen){
            if (!isOpen) {
                usSpinnerService.spin('sensorTypeSpinner');
                if (vm.type.selected._id === 'all') {
                    Sensors.getAll()
                        .then(function successCallback(response) {
                            usSpinnerService.stop('sensorTypeSpinner');
                            vm.sensors = response.data.sensors;
                            showCollapsibleSensors(vm.sensors);
                        }, function errorCallback(response) {
                            usSpinnerService.stop('sensorTypeSpinner');
                            console.log('Error: ' + response);
                        });
                } else {
                    Sensors.getByType(vm.type.selected._id)
                        .then(function successCallback(response) {
                            usSpinnerService.stop('sensorTypeSpinner');
                            vm.sensors = response.data.sensors;
                            showCollapsibleSensors(vm.sensors);
                        }, function errorCallback(response) {
                            usSpinnerService.stop('sensorTypeSpinner');
                            console.log('Error: ' + response);
                        });
                }
            }
        };

        vm.openReportModal = function () {
            var modalInstance = $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'myModalContent.html',
                controller: 'ReportModalInstanceCtrl',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    chartConfig: function () {
                        return vm.chartConfig;
                    }
                }
            });

            modalInstance.result.then(function (data) {
            }, function () {
                vm.chartConfig.getChartObj().reflow();
            });
        };

        vm.groupByType = function (item){

            var countPattern = /^count/g;
            var currentPattern = /^current.*/g;
            var cosPattern = /^cos.*/g;
            var statusPattern = /^status.*/g;
            var gasPattern = /^gas.*/g;
            var humidityPattern = /^h.*/g;
            var rainPattern = /^rain.*/g;
            var pressurePattern = /^pressure.*/g;
            var temperaturePattern = /^temp.*/g;
            var voltPattern = /^volt.*/g;
            var windPattern = /^wind.*/g;

            if (countPattern.test(item._id))
                return 'TIPO CONTEO';

            if (currentPattern.test(item._id))
                return 'TIPO CORRIENTE';

            if (cosPattern.test(item._id))
                return 'TIPO COSENO';

            if (statusPattern.test(item._id))
                return 'TIPO ESTADO';

            if (gasPattern.test(item._id))
                return 'TIPO GAS';

            if (humidityPattern.test(item._id))
                return 'TIPO HUMEDAD';

            if (rainPattern.test(item._id))
                return 'TIPO LLUVIA';

            if (pressurePattern.test(item._id))
                return 'TIPO PRESION';

            if (temperaturePattern.test(item._id))
                return 'TIPO TEMPERATURA';

            if (voltPattern.test(item._id))
                return 'TIPO VOLTAJE';

            if (windPattern.test(item._id))
                return 'TIPO VIENTO';

        };

        vm.groupByGroup = function (item){
            var withoutGroupPattern = /^null/g;

            if (withoutGroupPattern.test(item.group))
                return 'SIN AGRUPAR';
            else
                return item.group.name;
        };

        $scope.today = function() {
            $scope.dateFrom = new Date();
            $scope.dateTo = new Date();
        };
        $scope.today();

        $scope.clear = function() {
            $scope.dateFrom = null;
            $scope.dateTo = null;
        };

        /*vm.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };
*/
        $scope.dateOptionsFrom = {
            formatYear: 'yy',
            maxDate: $scope.dateTo,
            startingDay: 1
        };

        $scope.dateOptionsTo = {
            formatYear: 'yy',
            minDate: $scope.dateFrom,
            startingDay: 1
        };

        /*vm.toggleMin = function() {
            vm.inlineOptions.minDate = vm.inlineOptions.minDate ? null : new Date();
            vm.dateOptions.minDate = vm.inlineOptions.minDate;
        };

        vm.toggleMin();*/

        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };

        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };

        $scope.popup1 = {
            opened: false
        };

        $scope.popup2 = {
            opened: false
        };
    })
    .controller('ReportModalInstanceCtrl', function ($uibModalInstance, chartConfig) {
        var vm = this;
        vm.chartConfig = chartConfig;

        vm.ok = function () {
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });