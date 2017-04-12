angular.module('calculationController', [])
    .controller('CalculationCtrl', function ($scope, $sce, $uibModal, Calculations, Sensors, AppAlert, usSpinnerService){
        var vm = this;

        vm.checkModel = {};

        Calculations.getAll()
            .then(function successCallback(response) {
                vm.calculations = [];
                for (var i = 0; i < response.data.calculations.length; i++) {
                    vm.calculations.push(response.data.calculations[i]);
                }

            }, function errorCallback(response) {
                console.log('Error: ' + response);
            });

        vm.calculate = function (historicalForm) {
                // 1 => Indice Termo Higrometrico.
            if (vm.calculation.selected._id === 'ith') {
                if (vm.devices.selected && vm.ithTempSensors.selected && vm.ithHumSensors.selected) {
                    var thiData = {};
                    thiData.dateFrom = moment(vm.dateFrom).format('YYYY-MM-DD');
                    thiData.dateTo = moment(vm.dateTo).format('YYYY-MM-DD');
                    thiData.deviceImei = vm.devices.selected._id;
                    thiData.temperatureSensorIdx = vm.ithTempSensors.selected.idx;
                    thiData.humiditySensorIdx = vm.ithHumSensors.selected.idx;

                    usSpinnerService.spin('calculationGraphSpinner');

                    Calculations.thi(thiData)
                        .then(function successCallback(response) {
                        console.log(response.data.thiCalcs);
                            vm.responseData = response.data;

                            var labels = [], chartData = [];

                            usSpinnerService.stop('calculationGraphSpinner');

                            response.data.thiCalcs.forEach(function(thiCalc, idx, arr) {

                                labels.push(moment(thiCalc.timestamp).format('DD-MM-YYYY HH:mm:ss'));
                                labels = _.uniq(labels);
                                chartData.push(thiCalc.thiCalc);
                            });

                            vm.chartConfig = {
                                chart: {
                                    zoomType: ' x'
                                },
                                title: {
                                    text: vm.calculation.selected.name
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
                                        text: 'ITH'
                                    }
                                },
                                series: [{
                                    type: 'area',
                                    name: 'Medidas',
                                    data: chartData
                                }]
                            };

                            if (response.data.thiCalcs.length > 0) {
                                vm.openCalculationModal();
                            } else {
                                AppAlert.add('warning', 'No hay calculos disponibles.');
                            }

                    }, function errorCallback(response) {
                            usSpinnerService.stop('calculationGraphSpinner');
                        console.log('Error: ' + response);
                    });
                } else {
                    AppAlert.add('warning', 'Debe seleccionar 1 equipo, 1 sensor de tipo temperatura y 1 sensor de tipo humedad.');
                }

                // 2 => Potencia Activa, Reactiva y Aparente.
            } else if (vm.calculation.selected._id === 'para') {

                if (vm.devices.selected && vm.paraLapsus.selected && vm.paraVoltSensors.selected && vm.paraCurrSensors.selected && vm.paraPhaseSensors.selected) {
                    var paraData = {};

                    // TODO setear en produccion la ult. hora. (en vez de 1 anio atras a modo de prueba)
                    if (vm.paraLapsus.selected === 'Ultima Hora') {
                        paraData.dateFrom = vm.dateFrom = moment().subtract(1, 'years').format('YYYY-MM-DD HH:mm:ss');
                    } else if (vm.paraLapsus.selected === 'Ultimos 7 Dias') {
                        paraData.dateFrom = vm.dateFrom = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
                    }

                    paraData.dateTo = vm.dateTo = moment().format('YYYY-MM-DD HH:mm:ss');

                    paraData.deviceImei = vm.devices.selected._id;
                    paraData.voltageSensorIdx = vm.paraVoltSensors.selected.idx;
                    paraData.currentSensorIdx = vm.paraCurrSensors.selected.idx;
                    paraData.phaseAngleSensorIdx = vm.paraPhaseSensors.selected.idx;

                    usSpinnerService.spin('calculationGraphSpinner');

                    Calculations.para(paraData)
                        .then(function successCallback(response) {
                            console.log(response.data.paraCalcs);
                            vm.responseData = response.data;
                            usSpinnerService.stop('calculationGraphSpinner');

                            if (response.data.paraCalcs) {
                                vm.openCalculationModal();
                            } else {
                                AppAlert.add('warning', 'No hay calculos disponibles.');
                            }

                        }, function errorCallback(response) {
                            usSpinnerService.stop('calculationGraphSpinner');
                            console.log('Error: ' + response);
                        });
                } else {
                    AppAlert.add('warning', 'Debe seleccionar 1 equipo, 1 sensor de tipo voltaje, 1 sensor de tipo corriente y 1 sensor de tipo angulo.');
                }

                // 3 => Temperatura Cinetica Media x dias.
            } else if (vm.calculation.selected._id === 'tcmd') {
                // TODO tcmd
                // 4 => Temperatura Cinetica Media x mediciones.
            } else {
                // TODO tcmm
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

                // 1 => Indice Termo Higrometrico.
                if (vm.calculation.selected._id === 'ith') {
                    Calculations.getAvailableDevices('ith')
                        .then(function successCallback(response) {
                            vm.devices = response.data.devices;
                        }, function errorCallback(response) {
                            console.log('Error: ' + response);
                        });

                // 2 => Potencia Activa, Reactiva y Aparente.
                } else if (vm.calculation.selected._id === 'para') {

                    vm.paraLapsus = ['Ultima Hora', 'Ultimos 7 Dias'];

                    Calculations.getAvailableDevices('para')
                        .then(function successCallback(response) {
                            vm.devices = response.data.devices;
                        }, function errorCallback(response) {
                            console.log('Error: ' + response);
                        });

                // 3 => Temperatura Cinetica Media x dias.
                } else if (vm.calculation.selected._id === 'tcmd') {
                    Sensors.getByType('temp')
                        .then(function successCallback(response) {
                            usSpinnerService.stop('sensorTypeSpinner');
                            vm.sensors = response.data.sensors;
                            showCollapsibleSensors(vm.sensors);
                        }, function errorCallback(response) {
                            usSpinnerService.stop('sensorTypeSpinner');
                            console.log('Error: ' + response);
                        });
                // 4 => Temperatura Cinetica Media x mediciones.
                } else {
                    Sensors.getByType('temp')
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

        vm.onOpenCloseDevice = function (isOpen, calcType) {
            if (!isOpen) {
                if (calcType === 'ith') {
                    vm.ithTempSensors = _.filter(vm.devices.selected.model.sensors, function (sensor, index) {
                        _.extend(sensor, {idx: index});
                        return sensor.type === "temp";
                    });
                    vm.ithHumSensors = _.filter(vm.devices.selected.model.sensors, function (sensor, index) {
                        _.extend(sensor, {idx: index});
                        return sensor.type === "h";
                    });
                } else if (calcType === 'para') {
                    vm.paraVoltSensors = _.filter(vm.devices.selected.model.sensors, function (sensor, index) {
                        _.extend(sensor, {idx: index});
                        return sensor.type === "volt";
                    });
                    vm.paraCurrSensors = _.filter(vm.devices.selected.model.sensors, function (sensor, index) {
                        _.extend(sensor, {idx: index});
                        return sensor.type === "current";
                    });
                    vm.paraPhaseSensors = _.filter(vm.devices.selected.model.sensors, function (sensor, index) {
                        _.extend(sensor, {idx: index});
                        return sensor.type === "angle";
                    });
                }
            }
        };

        vm.openCalculationModal = function () {
            var modalInstance = $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'myModalContent.html',
                controller: 'CalculationModalInstanceCtrl',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    calculation: function () {
                        return vm.calculation;
                    },
                    chartConfig: function () {
                        return vm.chartConfig;
                    },
                    responseData: function () {
                        return vm.responseData;
                    },
                    dateFrom: function () {
                        return vm.dateFrom;
                    },
                    dateTo: function () {
                        return vm.dateTo;
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
    .controller('CalculationModalInstanceCtrl', function ($uibModalInstance, calculation, chartConfig, responseData, dateFrom, dateTo) {
        var vm = this;
        vm.calculation = calculation;
        vm.chartConfig = chartConfig;
        vm.responseData = responseData;
        vm.dateFrom = dateFrom;
        vm.dateTo = dateTo;

        vm.ok = function () {
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });