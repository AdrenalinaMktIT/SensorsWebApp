angular.module('measuresController', [])
    .directive('compileTemplate', function($compile, $parse){
        return {
            link: function(scope, element, attr){
                let parsed = $parse(attr.ngBindHtml);
                function getStringValue() { return (parsed(scope) || '').toString(); }

                //Recompile if the template changes
                scope.$watch(getStringValue, function() {
                    $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
                });
            }
        }
    })
    .controller('MeasuresCtrl', function ($scope, $sce, Reports, Sensors, Types, AppAlert, usSpinnerService){
        let vm = this;

        vm.checkModel = {};

        vm.spinnerActive = false;

        vm.timeLapseSelections = [];
        vm.timeLapseSelections.push(
            {
                _id: 'all',
                name: 'Todas las mediciones'
            },
            {
                id: 'timeLapseSelect',
                name: 'Seleccionar Lapso'
            });

        Types.getAll()
            .then(function successCallback(response) {
                vm.types = [];
                vm.types.push({
                    _id: 'all',
                    name: 'Todos'
                });
                for (let i = 0; i < response.data.types.length; i++) {
                    vm.types.push(response.data.types[i]);
                }

            }, function errorCallback(response) {
                console.log('Error: ' + response);
            });

        vm.measuresReport = function (measuresReportForm, fileType) {
            // me quedo solo con los sensores que estan tildados ('true')
            let selectedSensors = _.pick(vm.checkModel, function(value, key, object) {
                return _.isBoolean(value) && value === true;
            });

            if (_.size(selectedSensors) === 0) {
                AppAlert.add('danger', 'Error ! Debe seleccionar al menos 1 sensor.');
            } else {

                if (measuresReportForm.$valid) {
                    let sensorKeys = _.map(_.keys(selectedSensors), function (elem) {
                        return parseInt(elem.substr(1));
                    });
                    let reportRequest = {
                        "dateFrom": moment($scope.dateFrom).format('YYYY-MM-DD'),
                        "dateTo": moment($scope.dateTo).format('YYYY-MM-DD'),
                        "sensors": sensorKeys,
                        "timeLapseInMinutes": vm.timeLapseInMinutes
                    };

                    usSpinnerService.spin('measuresReportSpinner');
                    vm.spinnerActive = true;

                    if (fileType === 'xls') {
                        Reports.xlsMeasureReport(reportRequest)
                            .then(function successCallback(response) {
                                usSpinnerService.stop('measuresReportSpinner');
                                vm.spinnerActive = false;
                                let blob = new Blob([response.data], { type: "application/vnd.ms-excel" });
                                /*let objectUrl = URL.createObjectURL(blob);
                                window.open(objectUrl);*/
                                saveAs(blob, 'Reporte_Mediciones_' + moment().format("YYYY-MM-DD_HH-mm-ss") + '.xlsx')


                            }, function errorCallback(response) {
                                usSpinnerService.stop('measuresReportSpinner');
                                vm.spinnerActive = false;
                                console.log('Error: ' + response);
                            });
                    } else if (fileType === 'pdf') {
                        Reports.pdfMeasureReport(reportRequest)
                            .then(function successCallback(response) {
                                usSpinnerService.stop('measuresReportSpinner');
                                vm.spinnerActive = false;
                                let blob = new Blob([response.data], { type:'application/pdf'});
                                /*let objectUrl = URL.createObjectURL(blob);
                                window.open(objectUrl);*/
                                saveAs(blob, 'Reporte_Mediciones_' + moment().format("YYYY-MM-DD_HH-mm-ss") + '.pdf')
                            }, function errorCallback(response) {
                                usSpinnerService.stop('measuresReportSpinner');
                                vm.spinnerActive = false;
                                console.log('Error: ' + response);
                            });
                    }
                }
            }
        };

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        function showCollapsibleSensors(sensors) {
            vm.checkModel = {};
            $scope.groups = [];
            // separo por los sensores que se encuentran agrupados y los que ya tienen grupo.
            let separatedSensors = _.groupBy(sensors, function (num) {
                return num.group === null;
            });
            let withoutGroupSensors = separatedSensors.true;
            let agrupatedSensors = separatedSensors.false;
            let separatedAgrupatedSensors = _.pairs(_.groupBy(agrupatedSensors, function (item) {
                return item.group.name;
            }));
            let sensor = '';
            for (let i = 0; i < separatedAgrupatedSensors.length; i++) {
                sensor = '';
                let groupName = separatedAgrupatedSensors[i][0];
                let groupSensorsArray = separatedAgrupatedSensors[i][1];
                for (let j = 0; j < groupSensorsArray.length; j++) {
                    sensor += '<div class="input-group"><span class="input-group-addon"><input type="checkbox" ng-model="vm.checkModel.s' + groupSensorsArray[j]._id + '" ></span><label class="form-control" >SENSOR ' + groupSensorsArray[j].name + '</div>';
                }
                $scope.groups.push({
                    title: $sce.trustAsHtml('GRUPO ' + groupName + ' <span class="badge">' + groupSensorsArray.length + '</span>'),
                    content: $sce.trustAsHtml(sensor)
                })
            }
            sensor = '<div class="btn-group">';
            for (let k = 0; k < withoutGroupSensors.length; k++) {
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

        vm.groupByType = function (item){

            let countPattern = /^count/g;
            let currentPattern = /^current.*/g;
            let cosPattern = /^cos.*/g;
            let statusPattern = /^status.*/g;
            let gasPattern = /^gas.*/g;
            let humidityPattern = /^h.*/g;
            let rainPattern = /^rain.*/g;
            let pressurePattern = /^pressure.*/g;
            let temperaturePattern = /^temp.*/g;
            let voltPattern = /^volt.*/g;
            let windPattern = /^wind.*/g;

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
    });