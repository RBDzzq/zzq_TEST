/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/task', 'N/file', 'N/search', 'SuiteScripts/DENISJAPAN/2.0/Common/utils'],

    (record, task, file, search, utils) => {

        /**
         * 親フォルダ名
         * @type {String}
         */
        const strParentFolderName = 'DJ_外部システム/注文・移動伝票取込データ';

        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {

        }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {
			log.audit({
				title: 'post - start',
				details: JSON.stringify(new Date())
			});
            /**
             * 処理結果
             * @type {object}
             */
            let objResult = {
                status: 0,
                message: ''
            };

            if (!requestBody.hasOwnProperty('caseNo') || !requestBody['caseNo']) {
                /** 属性caseNoが定義されていない場合 */
                objResult.status = 1;
                objResult.message = '[caseNo]を定義してください。'
                return objResult;
            }

            /**
             * システム日付
             * @type {Date}
             */
            const dateSystemDate = utils.getJapanDateTime();

            /**
             * システム日付文字列（YYYYMMDD）
             * @type {String}
             */
            const strSystemDate = utils.dateToString(dateSystemDate, 'YYYYMMDD');

            /**
             * 作業用フォルダ内部ID
             * @type {String | Number}
             */
            const targetFolderId = utils.getFolderIdByPath(strParentFolderName + '/' + strSystemDate, true);

            log.debug({
                title: 'POST - 作業フォルダ',
                details: '内部ID: ' + targetFolderId
            });

            /**
             * データファイル作成
             * @type {file}
             */
            let fileData = null;
            /**
             * データファイル内部ID
             * @type {number}
             */
            let numFileId = 0;

            try {
                fileData = file.create({
                    name: requestBody['caseNo'] + '_' + utils.dateToString(dateSystemDate, 'YYYYMMDDHHmmssSSS') + '.json',
                    fileType: file.Type.JSON,
                    contents: JSON.stringify(requestBody),
                    folder: targetFolderId
                });

                numFileId = fileData.save();
            } catch (error) {
                log.error({
                    title: 'post - データファイル作成失敗',
                    details: error
                });
                objResult.status = 1;
                objResult.message = 'データファイル作成失敗 : ' + error;
                return objResult;
            }

            let numDataRecordId = '';

            try {
                /**
                 * カスタムレコード「DJ_外部システム_注文移動伝票連携データ」を作成
                 * @type {record}
                 */
                const objDataRecord = record.create({ type: 'customrecord_djkk_exsystem_so_to_import' });

                /** DJ_連携種類 */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_process_type',
                    value: requestBody['caseNo']
                });

                /** DJ_連携データ */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_data_file',
                    value: numFileId
                });
				if (!requestBody.hasOwnProperty('record_data') || (requestBody['record_data'].length <= 0)) {
                    /** 有効なデータが0件である場合 */
                    objDataRecord.setValue({
                        fieldId: 'custrecord_djkk_exsystem_process_status',
                        value: 2
                    });
                }
                /**
                 * カスタムレコード「DJ_外部システム_注文移動伝票連携データ」内部ID
                 * @type {number}
                 */
                numDataRecordId = objDataRecord.save();

                log.audit({
                    title: 'post - レコード「DJ_外部システム_注文移動伝票連携データ」作成',
                    details: '内部ID: ' + numDataRecordId
                });

            } catch (error) {
                log.error({
                    title: 'post - 中間レコード作成失敗',
                    details: error
                });

                objResult.status = 1;
                objResult.message = '中間レコード作成失敗 : ' + error;
                return objResult;
            }

            /**
             * 処理用MAPREDUCEは実行できるか
             * @type {boolean}
             */
            const flgMapReduceRunnable = checkMapReduceStatus();

            if (flgMapReduceRunnable) {
                try {
                    var strDeployId = 'customdeploy_djkk_mr_so_to_import_so';

                    if (requestBody['caseNo'] == 'INSERT_SALESORDER') {
                        strDeployId = 'customdeploy_djkk_mr_so_to_import_so'
                    } else if (requestBody['caseNo'] == 'INSERT_TRANSFERORDER') {
                        strDeployId = 'customdeploy_djkk_mr_so_to_import_to'
                    }
                    /**
                     * MAPREDUCEタスク作成
                     * @type {task}
                     */
                    var taskMapReduce = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_djkk_mr_so_to_import',
                        deploymentId: strDeployId,
                        params: {
                            custscript_djkk_mr_so_to_import_recordid: numDataRecordId
                        }
                    });
                    /**
                     * タスクを実行し、タスクIDを取得
                     * @type {string}
                     */
                    var taskId = taskMapReduce.submit()
                    log.debug({
                        title: 'post - taskId',
                        details: taskId
                    });
                    /** MAPREDUCE実行管理レコードにタスクIDを記録 */
                    record.submitFields({
                        type: 'customlist_djkk_exsystem_mr_manage',
                        id: 1,
                        values: {
                            name: taskId
                        }
                    });
                } catch (error) {
                    log.error({
                        title: 'MapReduceタスク作成失敗',
                        details: error
                    });
                }
            }
			log.audit({
				title: 'post - end',
				details: JSON.stringify(new Date())
			});
            return objResult;
        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {

        }

        /**
         * 取込処理用MAP/REDUCE実行状態確認
         * @returns {boolean} 実行中であるかどうか
         */
        function checkMapReduceStatus() {
            let flgProcess = true;

            let columns = [];
            columns.push(search.createColumn({name: 'name'}));
            const results = utils.searchResult('customlist_djkk_exsystem_mr_manage', [], columns);
            if (results != null && results != '' && results.length > 0) {
                /**
                 * MAPREDUCEの前回実行TASK ID
                 * @type {string}
                 */
                const strTaskId = results[0].getValue({name: 'name'});

                const strTaskStatus = task.checkStatus({taskId: strTaskId});
                if ([task.TaskStatus.PENDING, task.TaskStatus.PROCESSING].indexOf(strTaskStatus) >= 0) {
                    /** 同一MAPREDUCEは実行中やペンディングである場合 */
                    log.audit({
                      title: 'checkMapReduceStatus',
                      details: 'MAP/REDUCE実行中'
                    });
                    flgProcess = false;
                }
            } else {
                /** MAP/REDUCE実行されていない場合 */
                let recordMrManage = record.create({type: 'customlist_djkk_exsystem_mr_manage'});
                recordMrManage.setValue({
                    fieldId: 'name',
                    value: 'null'
                })
                recordMrManage.save();
            }

            return flgProcess;
        }

        return { get, put, post, delete: doDelete }

    });
