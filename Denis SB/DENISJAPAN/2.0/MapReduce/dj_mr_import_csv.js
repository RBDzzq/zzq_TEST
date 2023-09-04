/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NAmdConfig ../Common/myconfig.json
 */
define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/config', 'me', 'lib', 'moment', 'underscore'],
    function(search, record, runtime, format, config, me, lib, moment, _) {

        function getInputData() {

            //get params
            var arrdata = runtime.getCurrentScript().getParameter("custscript_dj_import_csv_arrdata");
            var filename = runtime.getCurrentScript().getParameter("custscript_dj_import_csv_filename");

            arrdata = JSON.parse(arrdata);
            log.debug('arrdata', arrdata);
            log.debug('filename', filename);

            var objArray = [];
            if (arrdata && arrdata.length > 0 ){
                for (var i=0;i<arrdata.length;i++){
                    var obj = {};
                    obj.csvdata = arrdata[i];
                    obj.filename = filename;
                    objArray.push(obj);
                }
            }
            log.debug('filename', filename);
            return objArray;
            
        }
        /**
         * Call with time of number record return from search in getInputData, or array length
         * @param context
         */
        function map(context) {

            log.debug('map', 'start');
            context.write(context.key, context.value);
        }

        /**
         * in reduce, context.value is undefined, but context.values[i] or context.values.length is valid
         * @param context
         */
        function reduce(context) {
            log.debug('reduce', 'start');
            try {

                var dataObj = JSON.parse(context.values[0]);
                log.debug('dataObj', dataObj);
                var csvdata = dataObj['csvdata'];
                var filename = dataObj['filename'];
                log.debug('arrdata', csvdata);
                log.debug('filename', filename);

                var recCSVfile = record.create({
                    type: 'customrecord_dj_custpayment_csvfile'
                });

                recCSVfile.setValue({
                    fieldId: 'custrecord_dj_cust_csvfile_filename',
                    value: filename
                });

                if (csvdata) {
                    csvdata = JSON.stringify(csvdata);
                } else {
                    csvdata = '';
                }
                recCSVfile.setValue({
                    fieldId: 'custrecord_dj_cust_csvfile_data',
                    value: csvdata
                });
                recCSVfile.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
            } catch (e) {

                log.error({title: e.name, details: e.message});
            }

        }

        /**
         *[key value] get from reduce of context.key and context.value
         * @param summary
         */
        function summarize(summary) {
            log.debug('summary', summary);
            handleErrorIfAny(summary);
            var contents = '';
            // //[key value] get from reduce of context.key and context.value
            summary.output.iterator().each(function(key, value) {
                contents += (key + ': ' + value + '\n');
                return true;
            });
            log.debug('summarize', contents);

        }
        function handleErrorInStage(stage, summary) {
            var errorMsg = [];
            summary.errors.iterator().each(function(key, value){
                var msg = 'Failure to accept payment from customer id: ' + key + '. Error was: ' + JSON.parse(value).message + '\n';
                errorMsg.push(msg);
                return true;
            });
            if (errorMsg.length > 0) {
                var e = error.create({
                    name: 'RECORD_TRANSFORM_FAILED', message: JSON.stringify(errorMsg)
                });

                handleErrorAndSendNotification(e, stage);
            }
        }



        function handleErrorIfAny(summary) {
            var inputSummary = summary.inputSummary;
            var mapSummary = summary.mapSummary;
            var reduceSummary = summary.reduceSummary;
            // record.submitFields({
            //     type: 'customrecord_dj_custpayment_management',
            //     id: value,
            //     values: {
            //         custrecord_dj_custpayment_status: '4'
            //     }
            // });
            if (inputSummary && inputSummary.error) {
                var e = error.create({
                    name: 'INPUT_STAGE_FAILED', message: inputSummary.error
                });
                handleErrorAndSendNotification(e, 'getInputData');

            }
            handleErrorInStage('map', mapSummary);
            handleErrorInStage('reduce', reduceSummary);
        }

        function handleErrorAndSendNotification(e, stage) {
            log.error('Stage: ' + stage + ' failed', e);
            var author = -5;
            var recipients = 'hminhduc@gmail.com';
            var subject = 'Map/Reduce script ' + runtime.getCurrentScript().id + ' failed for stage: ' + stage;
            var body = 'An error occurred with the following information:\n' +
                'Error code: ' + e.name + '\n' + 'Error msg: ' + e.message;
            email.send({
                author: author,
                recipients: recipients,
                subject: subject,
                body: body
            });
        }




        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize,
            config:{
                exitOnError: true
            }
        };
    });