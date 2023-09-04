/**
 * @NApiVersion 2.1
 */
define(['N/search', 'N/record', 'N/log', 'N/email', 'N/config'], function (search, record, log, email, config) {

    /**
     * ���ʌ����t�@���N�V����
     * @param {String} searchType �����Ώ�
     * @param {Array} filters ��������
     * @param {Array} columns �������ʗ�
     * @returns {Array} ��������
     */
    function searchResult(searchType, filters, columns) {
        const allSearchResult = [];

        const resultStep = 1000;
        var resultIndex = 0;

        const objSearch = search.create({
            type: searchType,
            filters: filters,
            columns: columns
        });

        const resultSet = objSearch.run();
        var results = [];

        do {
            if (resultIndex % resultStep != 0) {
                break;
            }

            results = resultSet.getRange({ start: resultIndex, end: resultIndex + resultStep });
            if (results != null && results != '') {
                for (var i = 0; i < results.length; i++) {
                    allSearchResult.push(results[i]);
                    resultIndex++;
                }
            }
        } while (results.length > 0);

        return allSearchResult;
    }

    /**
     * �t�H���_�p�X�ɂ��w��̃t�H���_�̓���ID���擾
     * @param {String} folderName �t�H���_�p�X
     * @param {boolean} flgCreateFolder �w��̃p�X�Ńt�H���_����ł��Ȃ��ꍇ�A�t�H���_�쐬���邩
     * @returns {String | Number} �w��p�X�̃t�H���_�̓���ID
     */
    function getFolderIdByPath(path, flgCreateFolder) {
        var resultFolderId = '';

        /**
         * �t�@�C���L���r�l�b�g���t�H���_�����i�[
         * @type {Array}
         */
        const arrFolderInfos = [];

        /**
         * �t�H���_�쐬�p���R�[�h
         * @type {record}
         */
        var recordFolder = null;

        const filters = [];

        const columns = [];
        columns.push(search.createColumn({ name: 'parent' }));
        columns.push(search.createColumn({ name: 'name' }));

        const results = searchResult(search.Type.FOLDER, filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpResult = results[i];

            arrFolderInfos.push({
                id: tmpResult.id,
                name: tmpResult.getValue({ name: 'name' }),
                parent: tmpResult.getValue({ name: 'parent' })
            });
        }

        /**
         * �w��p�X�e�K�w�̃t�H���_�����i�[('/'�Ő؂蕪��)
         * @type {Array}
         */
        const arrPathNames = path.split('/');

        /**
         * �e�t�H���_����ID
         * @type {number}
         */
        var numParentFolderId = 0;

        /**
         * �����Ńt�H���_�����t�B���^�����O���i�[
         * @type {Array}
         */
        var tmpArrFolderInfo = [];

        /** �����Ńt�H���_�����t�B���^�����O�i�e�t�H���_�����A�t�H���_���̓p�X����K�w�ڂƈ�v�j */
        tmpArrFolderInfo = arrFolderInfos.filter(function (element) {
            if (element.name == arrPathNames[0] && !element.parent) {
                return true;
            }
            return false;
        })

        if (tmpArrFolderInfo.length == 0) {
            /** �w��̏����ŗL���ȃt�H���_������ł��Ȃ��ꍇ */

            if (flgCreateFolder) {
                recordFolder = record.create({ type: record.Type.FOLDER });
                /** �t�H���_�� */
                recordFolder.setValue({
                    fieldId: 'name',
                    value: arrPathNames[0]
                });

                numParentFolderId = recordFolder.save();
            } else {
                log.error({
                    title: '�t�H���_����G���[',
                    details: '�w��̃t�H���_[' + path + ']��������܂���B'
                });
                return '';
            }
        } else {
            numParentFolderId = tmpArrFolderInfo[0].id;
            resultFolderId = tmpArrFolderInfo[0].id;
        }

        for (var pathIndex = 1; pathIndex < arrPathNames.length; pathIndex++) {
            tmpArrFolderInfo = arrFolderInfos.filter(function (element) {
                if (element.name == arrPathNames[pathIndex] && element.parent == numParentFolderId) {
                    return true;
                }
                return false;
            });

            if (tmpArrFolderInfo.length == 0) {
                /** �w��̏����ŗL���ȃt�H���_������ł��Ȃ��ꍇ */

                if (flgCreateFolder) {
                    recordFolder = record.create({ type: record.Type.FOLDER });
                    /** �t�H���_�� */
                    recordFolder.setValue({
                        fieldId: 'name',
                        value: arrPathNames[pathIndex]
                    });
                    /** �e�t�H���_ */
                    recordFolder.setValue({
                        fieldId: 'parent',
                        value: numParentFolderId
                    });

                    numParentFolderId = recordFolder.save();

                    if (pathIndex == arrPathNames.length - 1) {
                        /** �p�X���ŏI�K�w�ł���ꍇ */
                        resultFolderId = numParentFolderId;
                        break;
                    }
                } else {
                    log.error({
                        title: '�t�H���_����G���[',
                        details: '�w��̃t�H���_[' + path + ']��������܂���B'
                    });
                    return '';
                }
            } else {
                if (pathIndex != arrPathNames.length - 1) {
                    /** �p�X���ŏI�K�w�ł͂Ȃ��ꍇ */

                    numParentFolderId = tmpArrFolderInfo[0].id;
                } else {
                    /** �p�X���ŏI�K�w�ł���ꍇ */

                    resultFolderId = tmpArrFolderInfo[0].id;
                }
            }
        }

        return resultFolderId;
    }

    /**
     * ���{���Ԃł̃V�X�e���������擾
     * @returns {Date}���{���ԃV�X�e������
     */
    function getJapanDateTime() {
        const now = new Date();
        const offSet = now.getTimezoneOffset();
        const offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);
        return now;
    };

    /**
     * ���t���������t�ɕϊ�
     * @param {string} strDate ���t������
     * @param {string} strFormat ���t�t�H�[�}�b�g
     * @returns {Date} ���ʓ��t
     */
    function parseStringToDate(strDate, strFormat) {
        if (!strDate) {
            log.error({
                title: 'parseStringToDate - error',
                details: '�p�����[�^ - strDate �����͂���Ă��Ȃ��B'
            });
        }
        if (!strFormat) {
            log.error({
                title: 'parseStringToDate - error',
                details: '�p�����[�^ - strFormat �����͂���Ă��Ȃ��B'
            });
        }

        /**
         * ���ʓ��t
         * @type {Date}
         */
        var dateResult = new Date();
        dateResult.setDate(1);
        var strFormatForProcess = strFormat;
        var numTmpIndex = 0;

        const arrTypes = ['YYYY', 'YY', 'MM', 'M', 'DD', 'D', 'HH', 'H', 'mm', 'm', 'ss', 's', 'SSS', 'S'];
        for (var i = 0; i < arrTypes.length; i++) {
            var strTmpType = arrTypes[i];
            numTmpIndex = strFormat.indexOf(strTmpType);
            if (strFormatForProcess.indexOf(strTmpType) >= 0) {
                var strTmpValue = strDate.substring(numTmpIndex, numTmpIndex + strTmpType.length);
                switch (strTmpType) {
                    case 'YYYY':
                        dateResult.setFullYear(Number(strTmpValue));
                        break;
                    case 'YY':
                        dateResult.setFullYear(Number(strTmpValue));
                        break;
                    case 'MM':
                        dateResult.setMonth(Number(strTmpValue) - 1);
                        break;
                    case 'M':
                        dateResult.setMonth(Number(strTmpValue) - 1);
                        break;
                    case 'DD':
                        dateResult.setDate(Number(strTmpValue));
                        break;
                    case 'D':
                        dateResult.setDate(Number(strTmpValue));
                        break;
                    case 'HH':
                        dateResult.setHours(Number(strTmpValue));
                        break;
                    case 'H':
                        dateResult.setHours(Number(strTmpValue));
                        break;
                    case 'mm':
                        dateResult.setMinutes(Number(strTmpValue));
                        break;
                    case 'm':
                        dateResult.setMinutes(Number(strTmpValue));
                        break;
                    case 'ss':
                        dateResult.setSeconds(Number(strTmpValue));
                        break;
                    case 's':
                        dateResult.setSeconds(Number(strTmpValue));
                        break;
                    case 'SSS':
                        dateResult.setMilliseconds(Number(strTmpValue));
                        break;
                    case 's':
                        dateResult.setMilliseconds(Number(strTmpValue));
                        break;
                }
                strFormatForProcess = strFormatForProcess.replace(strTmpType, '');
            }
        }
        return dateResult;
    }

    /**
     * ���t�𕶎���ɕϊ�
     * @param {Date} date ���t
     * @param {String} strFormat ���t�t�H�[�}�b�g
     * @returns {string} ���t������
     */
    function dateToString(date, strFormat) {
        if (!date) {
            log.error({
                title: 'dateToString - error',
                details: '�p�����[�^ - date �����͂���Ă��Ȃ��B'
            });
        }
        if (!strFormat) {
            return JSON.stringify(date);
        }

        /**
         * ���ʓ��t������
         * @type {string}
         */
        var strResultDate = strFormat;

        strResultDate = strResultDate.replace(/YYYY/g, date.getFullYear());
        strResultDate = strResultDate.replace(/YY/g, date.getFullYear().toString().substring(2, 2));
        strResultDate = strResultDate.replace(/MM/g, ('00' + (date.getMonth() + 1)).slice(-2));
        strResultDate = strResultDate.replace(/M/g, (date.getMonth() + 1));
        strResultDate = strResultDate.replace(/DD/g, ('00' + date.getDate()).slice(-2));
        strResultDate = strResultDate.replace(/D/g, date.getDate());

        strResultDate = strResultDate.replace(/HH/g, ('00' + date.getHours()).slice(-2));
        strResultDate = strResultDate.replace(/H/g, date.getHours());
        strResultDate = strResultDate.replace(/mm/g, ('00' + date.getMinutes()).slice(-2));
        strResultDate = strResultDate.replace(/m/g, date.getMinutes());
        strResultDate = strResultDate.replace(/ss/g, ('00' + date.getSeconds()).slice(-2));
        strResultDate = strResultDate.replace(/s/g, date.getSeconds());

        strResultDate = strResultDate.replace(/SSS/g, ('000' + date.getMilliseconds()).slice(-3));
        strResultDate = strResultDate.replace(/S/g, date.getMilliseconds());

        return strResultDate;
    }

    /**
     * �w��t�H�[�}�b�g�̓��t�������Netsuite�ݒ�̃t�H�[�}�b�g�ɕϊ�
     * @param {string} strDate ���t������
     * @param {string} strFormat ���t�t�H�[�}�b�g
     * @returns {string} ���ʓ��t������
     */
    function changeDateStringFormat(strDate, strFormat) {
        /**
         * Netsuite�v���t�@�����X - ���t�t�H�[�}�b�g�ݒ�
         * @type {string}
         */
        const strPreferenceDateFormat = config
            .load({ type: config.Type.USER_PREFERENCES })
            .getValue({ fieldId: 'DATEFORMAT' });
        const strPreferenceTimeFormat = config
            .load({ type: config.Type.USER_PREFERENCES })
            .getValue({ fieldId: 'TIMEFORMAT' });

        /**
         * �w��t�H�[�}�b�g�œ��t�����񂩂���t�ɕϊ�
         */
        const dateResult = parseStringToDate(strDate, strFormat);

        /**
         * ���t��Netsuite�v���t�@�����X�ł̓��t�t�H�[�}�b�g�ŕ�����ɕϊ�
         */
        const strResult = dateToString(dateResult, strPreferenceDateFormat);

        return strResult;
    }

    /**
     * �}�X�^�f�[�^�擾
     * @param {string} tableName �}�X�^�e�[�u��ID
     * @param {string} keyField �R�[�h�̎Q�Ɛ�t�B�[���hID
     * @param {string | number | Array} codes �R�[�h�z��
     * @returns {Object}
     */
    function getMasterInfoByCode(tableName, keyField, codes) {
        const resultInfo = {};

        const filters = [];
        if (['string', 'number'].indexOf(typeof codes) >= 0) {
            filters.push(search.createFilter({
                name: keyField,
                operator: search.Operator.IS,
                values: codes
            }));
        } else {
            for (var i = 0; i < codes.length; i++) {
                filters.push([keyField, search.Operator.IS, codes[i]]);
                if (i != codes.length - 1) {
                    filters.push('OR');
                }
            }
        }

        const columns = [];
        columns.push(search.createColumn({ name: keyField }));

        const results = searchResult(tableName, filters, columns);

        if (results.length == 0) {
            return resultInfo;
        }

        if (results.length == 1) {
            var tmpId = results[0].id;
            var tmpCode = results[0].getValue({ name: keyField });
            resultInfo[(tmpCode.toString())] = tmpId;

            return resultInfo;
        }

        for (var i = 0; i < results.length; i++) {
            var tmpId = results[i].id;
            var tmpCode = results[i].getValue({ name: keyField });

            if (!resultInfo.hasOwnProperty(tmpCode.toString())) {
                resultInfo[(tmpCode.toString())] = tmpId;
            }
        }

        return resultInfo;
    }

    /**
     * ���[�����M
     * @param {string} processId ����ID
     * @param {string} processName ������
     * @param {string} errorMessage �G���[���e
     * @param {string | Array} recipients ��M�ҁi�f�t�H���g��M�҂݂̂ɑ��M����ꍇ�w��s�v�j
     * @param {boolean} sendToDefaultRecipient �f�t�H���g��M�҂ɑ��M���邩�i�f�t�H���g�l: True�j
     * @throws {string} ��M�ҁirecipients�j�Ɏw��Ȃ��A
     *                  ���f�t�H���g��M�ґ��M�t���O�isendToDefaultRecipient�j��False�Ǝw�肵���ꍇ�A�G���[
     */
    function sendMail(processId, processName, errorMessage, recipients, sendToDefaultRecipient) {

        const dateSystemDate = getJapanDateTime();

        /**
         * �V�X�e�����t������iYYYYMMDD�j
         * @type {String}
         */
        const strSystemDate = dateToString(dateSystemDate, 'YYYY�NMM��DD�� HH:mm:ss');

        /**
         * ��M�҃��[���A�h���X
         * @type {Array}
         */
        const arrRecipients = [];

        if (recipients == undefined) {
            recipients = [];
        }

        if (sendToDefaultRecipient == undefined) {
            sendToDefaultRecipient = true;
        }

        if (sendToDefaultRecipient) {
            /** �f�t�H���g��M�҂ɑ��M����ꍇ */

            arrRecipients.push('system@degica.com');
            arrRecipients.push('accounting@degica.com');
            arrRecipients.push('Degica_Notice_ML@evangsol.co.jp');
        }

        /** �w�肵���̎�M�҂�ǉ� */
        if (typeof recipients == 'string') {
            arrRecipients.push(recipients);
        } else {
            for (var i = 0; i < recipients.length; i++) {
                arrRecipients.push(recipients[i]);
            }
        }

        if (arrRecipients.length <= 0) {
            throw '�ꌏ��ꌏ�ȏ�̎�M�҂��w�肵�Ă��������B';
        }

        const title = '�yNetsuite�A�g�����G���[�z' + processName + '�����G���[';
        var body = '';
        body += '�y�������z\n';
        body += '�@�@' + processName + '\n';
        body += '�y����ID�z\n';
        body += '�@�@' + processId + '\n';
        body += '�y���������z\n';
        body += '�@�@' + strSystemDate + '\n';
        body += '�y�G���[���e�z\n';
        body += '�@�@' + errorMessage;

        // TODO ���M�ҏ]�ƈ��X�V
        email.send({
            author: 422,
            subject: title,
            body: body,
            recipients: arrRecipients
        });
    }

    return {
        getFolderIdByPath: getFolderIdByPath,
        searchResult: searchResult,
        getJapanDateTime: getJapanDateTime,
        parseStringToDate: parseStringToDate,
        dateToString: dateToString,
        getMasterInfoByCode: getMasterInfoByCode,
        sendMail: sendMail,
        changeDateStringFormat: changeDateStringFormat
    };
});