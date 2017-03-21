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
    .controller('HistoricalCtrl', function ($scope, $sce, Reports, Sensors, Types, AppAlert){
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

                    $scope.labels = [];
                    $scope.data = [];
                    $scope.series = [];
                    /*$scope.options = {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero:true
                                }
                            }]
                        }
                    };*/
                    Reports.calculate(reportRequest)
                        .then(function successCallback(response) {
                            // this callback will be called asynchronously
                            // when the response is available
                            // TODO DIBUJAR
                            var seriesData = [];

                            for (var i =0; i < sensorKeys.length; i++) {

                                var sensorName = '';

                                seriesData = [];

                                response.data.forEach(function(measure, idx, arr) {

                                    // busco el indice en el cual se encuentra el sensor en el modelo configurado para este imei.
                                    var listOfSensorNames = _.pluck(measure.imei.model.sensors, '_id');
                                    var sensorIdx = _.indexOf(listOfSensorNames, sensorKeys[i]);
                                    sensorName = measure.imei.model.sensors[sensorIdx].name + ' (' + measure.imei.model.sensors[sensorIdx].type + ')';
                                    $scope.labels.push(measure.timestamp);
                                    $scope.labels = _.uniq($scope.labels);
                                    seriesData.push(measure.data[sensorIdx]);

                                });
                                $scope.series.push(sensorName);
                                $scope.data.push(seriesData);

                            }
                        }, function errorCallback(response) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
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
                    title: $sce.trustAsHtml('GRUPO ' + groupName),
                    content: $sce.trustAsHtml(sensor)
                })
            }
            sensor = '<div class="btn-group">';
            for (var k = 0; k < withoutGroupSensors.length; k++) {
                sensor += '<div class="input-group"><span class="input-group-addon"><input type="checkbox" ng-model="vm.checkModel.s' + withoutGroupSensors[k]._id + '" ></span><label class="form-control" >SENSOR ' + withoutGroupSensors[k].name + '</div>';
            }
            $scope.groups.push({
                title: 'SENSORES SIN GRUPO',
                content: $sce.trustAsHtml(sensor)
            })
        }

        vm.onOpenClose = function (isOpen){
            if (!isOpen) {
                if (vm.type.selected._id === 'all') {
                    Sensors.getAll()
                        .then(function successCallback(response) {
                            vm.sensors = response.data.sensors;
                            showCollapsibleSensors(vm.sensors);


                        }, function errorCallback(response) {
                            console.log('Error: ' + response);
                        });
                } else {
                    Sensors.getByType(vm.type.selected._id)
                        .then(function successCallback(response) {
                            vm.sensors = response.data.sensors;
                            showCollapsibleSensors(vm.sensors);
                        }, function errorCallback(response) {
                            console.log('Error: ' + response);
                        });
                }
            }
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
    });