angular.module('inputController', [])

    // inject the Input service factory into our controller
    .controller('InputCtrl', function (uiGridConstants, Inputs) {

        var vm = this;

        vm.formData = {};

        vm.lang = 'es';

        vm.gridOptions = {
            enableSorting: true,
            /*paginationPageSizes: [25, 50, 75],
             paginationPageSize: 25,*/
            gridMenuShowHideColumns: false,
            enableFiltering: true,
            /*enableRowHeaderSelection: true,*/
            showGridFooter: true,
            columnDefs: [
                { field: 'date', displayName: 'FECHA', enableHiding: false, cellFilter: 'date:"dd-MM-yyyy HH:mm:ss\"',
                    sort: {
                        direction: uiGridConstants.DESC,
                        priority: 0
                    },
                width: '20%'
                },
                { field: 'host', displayName: 'HOST', enableHiding: false, width: '15%' },
                { field: 'ip', displayName: 'IP', enableHiding: false, width: '15%' },
                { field: 'port', displayName: 'PUERTO', enableHiding: false, width: '10%' },
                { field: 'userAgent', displayName: 'ACCESO', enableHiding: false, width: '20%' },
                { field: 'action', displayName: 'ACCION', enableHiding: false, width: '10%' },
                /*{ field: 'label', displayName: 'ETIQUETA', enableHiding: false },
                { field: 'object', displayName: 'OBJ', visible: false },*/
                { field: 'description', displayName: 'DESCRIPCION', enableHiding: false, width: '10%' }
            ],
            enableGridMenu: true,
            exporterCsvFilename: 'Reporte_Ingresos_' + moment().format("YYYY-MM-DD_HH-mm-ss") + '.csv',
            exporterPdfFilename: 'Reporte_Ingresos_' + moment().format("YYYY-MM-DD_HH-mm-ss") + '.pdf'
        };

        loadInputs();

        function loadInputs() {
            Inputs.getAll()
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    vm.gridOptions.data = response.data.inputs;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error: ' + response);
                });
        }
    });