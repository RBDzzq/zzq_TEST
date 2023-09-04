/**
 * @NApiVersion 2.1
 */
define(['N/search', 'N/record', 'N/log', 'N/email', 'N/config'], function (search, record, log, email, config) {

    /**
     * 共通検索ファンクション
     * @param {String} searchType 検索対象
     * @param {Array} filters 検索条件
     * @param {Array} columns 検索結果列
     * @returns {Array} 検索結果
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
     * フォルダパスにより指定のフォルダの内部IDを取得
     * @param {String} folderName フォルダパス
     * @param {boolean} flgCreateFolder 指定のパスでフォルダ特定できない場合、フォルダ作成するか
     * @returns {String | Number} 指定パスのフォルダの内部ID
     */
    function getFolderIdByPath(path, flgCreateFolder) {
        var resultFolderId = '';

        /**
         * ファイルキャビネット内フォルダ情報を格納
         * @type {Array}
         */
        const arrFolderInfos = [];

        /**
         * フォルダ作成用レコード
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
         * 指定パス各階層のフォルダ名を格納('/'で切り分け)
         * @type {Array}
         */
        const arrPathNames = path.split('/');

        /**
         * 親フォルダ内部ID
         * @type {number}
         */
        var numParentFolderId = 0;

        /**
         * 条件でフォルダ情報をフィルタリングし格納
         * @type {Array}
         */
        var tmpArrFolderInfo = [];

        /** 条件でフォルダ情報をフィルタリング（親フォルダ無し、フォルダ名はパス内一階層目と一致） */
        tmpArrFolderInfo = arrFolderInfos.filter(function (element) {
            if (element.name == arrPathNames[0] && !element.parent) {
                return true;
            }
            return false;
        })

        if (tmpArrFolderInfo.length == 0) {
            /** 指定の条件で有効なフォルダ情報特定できない場合 */

            if (flgCreateFolder) {
                recordFolder = record.create({ type: record.Type.FOLDER });
                /** フォルダ名 */
                recordFolder.setValue({
                    fieldId: 'name',
                    value: arrPathNames[0]
                });

                numParentFolderId = recordFolder.save();
            } else {
                log.error({
                    title: 'フォルダ特定エラー',
                    details: '指定のフォルダ[' + path + ']が見つかりません。'
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
                /** 指定の条件で有効なフォルダ情報特定できない場合 */

                if (flgCreateFolder) {
                    recordFolder = record.create({ type: record.Type.FOLDER });
                    /** フォルダ名 */
                    recordFolder.setValue({
                        fieldId: 'name',
                        value: arrPathNames[pathIndex]
                    });
                    /** 親フォルダ */
                    recordFolder.setValue({
                        fieldId: 'parent',
                        value: numParentFolderId
                    });

                    numParentFolderId = recordFolder.save();

                    if (pathIndex == arrPathNames.length - 1) {
                        /** パス内最終階層である場合 */
                        resultFolderId = numParentFolderId;
                        break;
                    }
                } else {
                    log.error({
                        title: 'フォルダ特定エラー',
                        details: '指定のフォルダ[' + path + ']が見つかりません。'
                    });
                    return '';
                }
            } else {
                if (pathIndex != arrPathNames.length - 1) {
                    /** パス内最終階層ではない場合 */

                    numParentFolderId = tmpArrFolderInfo[0].id;
                } else {
                    /** パス内最終階層である場合 */

                    resultFolderId = tmpArrFolderInfo[0].id;
                }
            }
        }

        return resultFolderId;
    }

    /**
     * 日本時間でのシステム日時を取得
     * @returns {Date}日本時間システム日時
     */
    function getJapanDateTime() {
        const now = new Date();
        const offSet = now.getTimezoneOffset();
        const offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);
        return now;
    };

    /**
     * 日付文字列を日付に変換
     * @param {string} strDate 日付文字列
     * @param {string} strFormat 日付フォーマット
     * @returns {Date} 結果日付
     */
    function parseStringToDate(strDate, strFormat) {
        if (!strDate) {
            log.error({
                title: 'parseStringToDate - error',
                details: 'パラメータ - strDate が入力されていない。'
            });
        }
        if (!strFormat) {
            log.error({
                title: 'parseStringToDate - error',
                details: 'パラメータ - strFormat が入力されていない。'
            });
        }

        /**
         * 結果日付
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
     * 日付を文字列に変換
     * @param {Date} date 日付
     * @param {String} strFormat 日付フォーマット
     * @returns {string} 日付文字列
     */
    function dateToString(date, strFormat) {
        if (!date) {
            log.error({
                title: 'dateToString - error',
                details: 'パラメータ - date が入力されていない。'
            });
        }
        if (!strFormat) {
            return JSON.stringify(date);
        }

        /**
         * 結果日付文字列
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
     * 指定フォーマットの日付文字列をNetsuite設定のフォーマットに変換
     * @param {string} strDate 日付文字列
     * @param {string} strFormat 日付フォーマット
     * @returns {string} 結果日付文字列
     */
    function changeDateStringFormat(strDate, strFormat) {
        /**
         * Netsuiteプリファレンス - 日付フォーマット設定
         * @type {string}
         */
        const strPreferenceDateFormat = config
            .load({ type: config.Type.USER_PREFERENCES })
            .getValue({ fieldId: 'DATEFORMAT' });
        const strPreferenceTimeFormat = config
            .load({ type: config.Type.USER_PREFERENCES })
            .getValue({ fieldId: 'TIMEFORMAT' });

        /**
         * 指定フォーマットで日付文字列から日付に変換
         */
        const dateResult = parseStringToDate(strDate, strFormat);

        /**
         * 日付をNetsuiteプリファレンスでの日付フォーマットで文字列に変換
         */
        const strResult = dateToString(dateResult, strPreferenceDateFormat);

        return strResult;
    }

    /**
     * マスタデータ取得
     * @param {string} tableName マスタテーブルID
     * @param {string} keyField コードの参照先フィールドID
     * @param {string | number | Array} codes コード配列
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
     * メール送信
     * @param {string} processId 処理ID
     * @param {string} processName 処理名
     * @param {string} errorMessage エラー内容
     * @param {string | Array} recipients 受信者（デフォルト受信者のみに送信する場合指定不要）
     * @param {boolean} sendToDefaultRecipient デフォルト受信者に送信するか（デフォルト値: True）
     * @throws {string} 受信者（recipients）に指定なし、
     *                  且つデフォルト受信者送信フラグ（sendToDefaultRecipient）にFalseと指定した場合、エラー
     */
    function sendMail(processId, processName, errorMessage, recipients, sendToDefaultRecipient) {

        const dateSystemDate = getJapanDateTime();

        /**
         * システム日付文字列（YYYYMMDD）
         * @type {String}
         */
        const strSystemDate = dateToString(dateSystemDate, 'YYYY年MM月DD日 HH:mm:ss');

        /**
         * 受信者メールアドレス
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
            /** デフォルト受信者に送信する場合 */

            arrRecipients.push('system@degica.com');
            arrRecipients.push('accounting@degica.com');
            arrRecipients.push('Degica_Notice_ML@evangsol.co.jp');
        }

        /** 指定したの受信者を追加 */
        if (typeof recipients == 'string') {
            arrRecipients.push(recipients);
        } else {
            for (var i = 0; i < recipients.length; i++) {
                arrRecipients.push(recipients[i]);
            }
        }

        if (arrRecipients.length <= 0) {
            throw '一件や一件以上の受信者を指定してください。';
        }

        const title = '【Netsuite連携処理エラー】' + processName + '処理エラー';
        var body = '';
        body += '【処理名】\n';
        body += '　　' + processName + '\n';
        body += '【処理ID】\n';
        body += '　　' + processId + '\n';
        body += '【発生時刻】\n';
        body += '　　' + strSystemDate + '\n';
        body += '【エラー内容】\n';
        body += '　　' + errorMessage;

        // TODO 送信者従業員更新
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