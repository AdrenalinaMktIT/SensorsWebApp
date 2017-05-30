// utils.js
// ========
module.exports = {

    createXlsBinary: function(jsonData, callback) {

        let moment = require('moment');
        let XLSX = require('xlsx');
        const path = require('path');

        //  (Fecha_Medicion, ID_Sensor,	Nombre_Sensor, Valor, Unidad, Estado)

        var bodyData = [];

        bodyData.push([{text: 'Fecha Medicion', style: 'tableHeader'}, {text: 'ID Sensor', style: 'tableHeader'}, {text: 'Nombre Sensor', style: 'tableHeader'}, {text: 'Valor', style: 'tableHeader'}, {text: 'Unidad', style: 'tableHeader'}, {text: 'Estado', style: 'tableHeader'}]);

        jsonData.forEach(function(sourceRow) {
            var dataRow = [];

            dataRow.push(moment(sourceRow.timestamp).format('LLL'));
            dataRow.push(sourceRow.sensor._id);
            dataRow.push(sourceRow.sensor.name);
            dataRow.push(sourceRow.data);
            dataRow.push(sourceRow.sensor.type.units);
            dataRow.push(sourceRow.sensor.type.units);


            bodyData.push(dataRow)
        });

        const ws_name = "Reporte_Mediciones";

        let ws = XLSX.utils.json_to_sheet(bodyData);

        ws.A1.v = "Fecha Medicion";
        ws.B1.v = "ID Sensor";
        ws.C1.v = "Nombre Sensor";
        ws.D1.v = "Valor";
        ws.E1.v = "Unidad";
        ws.F1.v = "Estado";

        const wb = { SheetNames: [ws_name], Sheets: {}, Props: {} };

        wb.Sheets[ws_name] = ws;

        /* write file */
        let wbbuf = XLSX.write(wb, {
            type: 'base64',
            bookType: 'xlsx'
        });

        callback(new Buffer(wbbuf, 'base64'));
    },

    createPdfBinary: function(jsonData, callback) {

        let moment = require('moment');
        let pdfMakePrinter = require('pdfmake/src/printer');
        var fonts = require('pdfmake/build/vfs_fonts');
        const path = require('path');

        //  (Fecha_Medicion, ID_Sensor,	Nombre_Sensor, Valor, Unidad, Estado)

        var bodyData = [];

        bodyData.push([{text: 'Fecha Medicion', style: 'tableHeader'}, {text: 'ID Sensor', style: 'tableHeader'}, {text: 'Nombre Sensor', style: 'tableHeader'}, {text: 'Valor', style: 'tableHeader'}, {text: 'Unidad', style: 'tableHeader'}, {text: 'Estado', style: 'tableHeader'}]);

        jsonData.forEach(function(sourceRow) {
            var dataRow = [];

            dataRow.push(moment(sourceRow.timestamp).format('LLL'));
            dataRow.push(sourceRow.sensor._id);
            dataRow.push(sourceRow.sensor.name);
            dataRow.push(sourceRow.data);
            dataRow.push(sourceRow.sensor.type.units);
            dataRow.push(sourceRow.sensor.type.units);


            bodyData.push(dataRow)
        });


        var fontDescriptors = {
            Roboto: {
                normal: path.join(__dirname, '../..', 'assets', '/fonts/Roboto-Regular.ttf'),
                bold: path.join(__dirname, '../..', 'assets', '/fonts/Roboto-Medium.ttf'),
                italics: path.join(__dirname, '../..', 'assets', '/fonts/Roboto-Italic.ttf'),
                bolditalics: path.join(__dirname, '../..', 'assets', '/fonts/Roboto-MediumItalic.ttf')
            }
        };

        var pdf = {
            header: {
                margin: 10,
                columns: [
                    {
                        image: 'public/assets/img/adrenalina_logo.png',
                        width: 40
                    },
                    {
                        margin: [10, 0, 0, 0],
                        text: 'Reporte de Mediciones'
                    }
                ]
            },
            content: [
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        body: bodyData
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black'
                }
            },
            defaultStyle: {
                alignment: 'justify'
            }
        };



        var printer = new pdfMakePrinter(fontDescriptors);
        var doc = printer.createPdfKitDocument(pdf);

        var chunks = [];
        var result;

        doc.on('data', function (chunk) {
            chunks.push(chunk);
        });

        doc.on('end', function () {
            result = Buffer.concat(chunks);
            callback(result);
        });

        doc.end();

    }
};