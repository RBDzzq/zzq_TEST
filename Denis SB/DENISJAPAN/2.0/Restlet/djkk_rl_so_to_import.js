/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/task', 'N/file', 'N/search', 'SuiteScripts/DENISJAPAN/2.0/Common/utils'],

    (record, task, file, search, utils) => {

        /**
         * �e�t�H���_��
         * @type {String}
         */
        const strParentFolderName = 'DJ_�O���V�X�e��/�����E�ړ��`�[�捞�f�[�^';

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
             * ��������
             * @type {object}
             */
            let objResult = {
                status: 0,
                message: ''
            };

            if (!requestBody.hasOwnProperty('caseNo') || !requestBody['caseNo']) {
                /** ����caseNo����`����Ă��Ȃ��ꍇ */
                objResult.status = 1;
                objResult.message = '[caseNo]���`���Ă��������B'
                return objResult;
            }

            /**
             * �V�X�e�����t
             * @type {Date}
             */
            const dateSystemDate = utils.getJapanDateTime();

            /**
             * �V�X�e�����t������iYYYYMMDD�j
             * @type {String}
             */
            const strSystemDate = utils.dateToString(dateSystemDate, 'YYYYMMDD');

            /**
             * ��Ɨp�t�H���_����ID
             * @type {String | Number}
             */
            const targetFolderId = utils.getFolderIdByPath(strParentFolderName + '/' + strSystemDate, true);

            log.debug({
                title: 'POST - ��ƃt�H���_',
                details: '����ID: ' + targetFolderId
            });

            /**
             * �f�[�^�t�@�C���쐬
             * @type {file}
             */
            let fileData = null;
            /**
             * �f�[�^�t�@�C������ID
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
                    title: 'post - �f�[�^�t�@�C���쐬���s',
                    details: error
                });
                objResult.status = 1;
                objResult.message = '�f�[�^�t�@�C���쐬���s : ' + error;
                return objResult;
            }

            let numDataRecordId = '';

            try {
                /**
                 * �J�X�^�����R�[�h�uDJ_�O���V�X�e��_�����ړ��`�[�A�g�f�[�^�v���쐬
                 * @type {record}
                 */
                const objDataRecord = record.create({ type: 'customrecord_djkk_exsystem_so_to_import' });

                /** DJ_�A�g��� */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_process_type',
                    value: requestBody['caseNo']
                });

                /** DJ_�A�g�f�[�^ */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_data_file',
                    value: numFileId
                });
				if (!requestBody.hasOwnProperty('record_data') || (requestBody['record_data'].length <= 0)) {
                    /** �L���ȃf�[�^��0���ł���ꍇ */
                    objDataRecord.setValue({
                        fieldId: 'custrecord_djkk_exsystem_process_status',
                        value: 2
                    });
                }
                /**
                 * �J�X�^�����R�[�h�uDJ_�O���V�X�e��_�����ړ��`�[�A�g�f�[�^�v����ID
                 * @type {number}
                 */
                numDataRecordId = objDataRecord.save();

                log.audit({
                    title: 'post - ���R�[�h�uDJ_�O���V�X�e��_�����ړ��`�[�A�g�f�[�^�v�쐬',
                    details: '����ID: ' + numDataRecordId
                });

            } catch (error) {
                log.error({
                    title: 'post - ���ԃ��R�[�h�쐬���s',
                    details: error
                });

                objResult.status = 1;
                objResult.message = '���ԃ��R�[�h�쐬���s : ' + error;
                return objResult;
            }

            /**
             * �����pMAPREDUCE�͎��s�ł��邩
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
                     * MAPREDUCE�^�X�N�쐬
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
                     * �^�X�N�����s���A�^�X�NID���擾
                     * @type {string}
                     */
                    var taskId = taskMapReduce.submit()
                    log.debug({
                        title: 'post - taskId',
                        details: taskId
                    });
                    /** MAPREDUCE���s�Ǘ����R�[�h�Ƀ^�X�NID���L�^ */
                    record.submitFields({
                        type: 'customlist_djkk_exsystem_mr_manage',
                        id: 1,
                        values: {
                            name: taskId
                        }
                    });
                } catch (error) {
                    log.error({
                        title: 'MapReduce�^�X�N�쐬���s',
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
         * �捞�����pMAP/REDUCE���s��Ԋm�F
         * @returns {boolean} ���s���ł��邩�ǂ���
         */
        function checkMapReduceStatus() {
            let flgProcess = true;

            let columns = [];
            columns.push(search.createColumn({name: 'name'}));
            const results = utils.searchResult('customlist_djkk_exsystem_mr_manage', [], columns);
            if (results != null && results != '' && results.length > 0) {
                /**
                 * MAPREDUCE�̑O����sTASK ID
                 * @type {string}
                 */
                const strTaskId = results[0].getValue({name: 'name'});

                const strTaskStatus = task.checkStatus({taskId: strTaskId});
                if ([task.TaskStatus.PENDING, task.TaskStatus.PROCESSING].indexOf(strTaskStatus) >= 0) {
                    /** ����MAPREDUCE�͎��s����y���f�B���O�ł���ꍇ */
                    log.audit({
                      title: 'checkMapReduceStatus',
                      details: 'MAP/REDUCE���s��'
                    });
                    flgProcess = false;
                }
            } else {
                /** MAP/REDUCE���s����Ă��Ȃ��ꍇ */
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
