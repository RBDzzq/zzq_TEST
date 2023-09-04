/**
 * me.js
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define(function () {
    /**
     * Sort by name ascending `_.sortBy(data, string_comparator('name'));`
     * @param param_name
     * @param compare_depth
     * @returns {*}
     */
    function string_comparator(param_name, compare_depth) {
        if (param_name[0] == '-') {
            param_name = param_name.slice(1),
                compare_depth = compare_depth || 10;
            return function (item) {
                return String.fromCharCode.apply(String,
                    _.map(item[param_name].slice(0, compare_depth).split(""), function (c) {
                        return 0xffff - c.charCodeAt();
                    })
                );
            };
        } else {
            return function (item) {
                return item[param_name];
            };
        }
    };

    /**
     * Check if param is empty
     * @param stValue
     * @returns {boolean}
     */
    function isEmpty(stValue) {
        if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * return current date
     * @returns {Date}
     */
    function getNowDateJP() {
        var stNow = new Date();
        stNow.setMilliseconds((3600000 * 9));
        var stYear = stNow.getUTCFullYear();
        var stMonth = stNow.getUTCMonth();
        var stDate = stNow.getUTCDate();
        stNow = new Date(stYear, stMonth, stDate);
        return stNow;
    }

    /**
     * string 123,456,789 -> int 123456789
     * @param stringNumber
     * @returns {number | *}
     */
    function getInt(stringNumber) {
        stringNumber = stringNumber.split(",");
        var stringtotal = '';
        stringNumber.forEach(function (item, index) {
            stringtotal = stringtotal + item;
        });
        stringNumber = parseInt(stringtotal);
        return stringNumber;
    }

    /**
     * Input a string of csv data and parse it and return to two dimension array
     * @param {[string]} strData      [csv string data]
     * @param {[string]} strDelimiter [split method charactor]
     */
    function CSVToArray(strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
            ) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }
            var strMatchedValue;
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"),
                    "\""
                );
            } else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }

        // Return the parsed data.
        return (arrData);
    }

    /**
     * 291030 -> 2017/10/30
     * using as var date = new Date(convertDate((paymentArray[i][2]),warekiYear));
     * @param strDate
     * @param warekiYear = 1988
     * @returns {number | any}
     */
    function convertDate(strDate, warekiYear) {
        var date = parseFloat(strDate);
        var yearString = warekiYear * 10000 + date;
        var year = yearString.toString().slice(0, 4);
        var month = yearString.toString().slice(4, 6);
        var day = yearString.toString().slice(6);
        var parsedDateStringAsRawDateObject = format.parse({
            value: month + '/' + day + '/' + year,
            type: format.Type.DATE
        });
        return (parsedDateStringAsRawDateObject);
    }

    //Function for convertKanaToOneByte
    function createKanaMap(properties, values) {
        var kanaMap = {};
        // �O�̂��ߕ��������������ǂ������`�F�b�N����(�����ƃ}�b�s���O�ł��邩)
        if (properties.length === values.length) {
            for (var i = 0, len = properties.length; i < len; i++) {
                var property = properties.charCodeAt(i),
                    value = values.charCodeAt(i);
                kanaMap[property] = value;
            }
        }
        return kanaMap;
    };

    // �S�p���甼�p�ւ̕ϊ��p�}�b�v
    var m = createKanaMap(
        '�A�C�E�G�I�J�L�N�P�R�T�V�X�Z�\�^�`�c�e�g�i�j�k�l�m�n�q�t�w�z�}�~�����������������������������@�B�D�F�H�b������',
        '�������������������������������������������ܦݧ��������'
    );
    // ���p����S�p�ւ̕ϊ��p�}�b�v
    /*var mm = createKanaMap(
        '�������������������������������������������ܦݧ��������',
        '�A�C�E�G�I�J�L�N�P�R�T�V�X�Z�\�^�`�c�e�g�i�j�k�l�m�n�q�t�w�z�}�~�����������������������������@�B�D�F�H�b������'
    );*/

    // �S�p���甼�p�ւ̕ϊ��p�}�b�v
    var g = createKanaMap(
        '�K�M�O�Q�S�U�W�Y�[�]�_�a�d�f�h�o�r�u�x�{',
        '��������������������'
    );
    // ���p����S�p�ւ̕ϊ��p�}�b�v
    /*var gg = createKanaMap(
        '��������������������',
        '�K�M�O�Q�S�U�W�Y�[�]�_�a�d�f�h�o�r�u�x�{'
    );*/

    // �S�p���甼�p�ւ̕ϊ��p�}�b�v
    var p = createKanaMap(
        '�p�s�v�y�|',
        '�����'
    );
    // ���p����S�p�ւ̕ϊ��p�}�b�v
    /*var pp = createKanaMap(
        '�����',
        '�p�s�v�y�|'
    );*/

    var gMark = '�'.charCodeAt(0);
    var pMark = '�'.charCodeAt(0);

    /**
     * client_half = client_half.replace(/\s/g, ''); -> Clearing blank
     * client_half = convertKanaToOneByte(client_half);
     * @param str
     * @returns {*}
     */
    function convertKanaToOneByte(str) {
        for (var i = 0, len = str.length; i < len; i++) {
            if (g.hasOwnProperty(str.charCodeAt(i)) || p.hasOwnProperty(str.charCodeAt(i))) {
                if (g[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(g[str.charCodeAt(i)]) + String.fromCharCode(gMark));
                } else if (p[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(p[str.charCodeAt(i)]) + String.fromCharCode(pMark));
                } else {
                    break;
                }
                i++;
                len = str.length;
            } else {
                if (m[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(m[str.charCodeAt(i)]));
                }
            }
        }
        return str;
    }

    /**
     * [stringToXMLTag return a string with new line \r\n with html tag <br />]
     * @param  {[string]} stringInput [string have \r\n as new line]
     * @return {[type]}             [description]
     */
    function stringToXMLTag(stringInput) {
        var arrData = stringInput.replace(new RegExp('\r?\n', 'g'), '<br />');
        return arrData;
    }

    /**
     * �z�@���~���h�b�N�@���@�z�A���~���h�c�N
     * @param kanaVal
     * @returns {string}
     */
    function convertBigKana(kanaVal) {
        var smallKana = Array('�@', '�B', '�D', '�F', '�H', '��', '��', '��', '�b', '�]', '-', '�|', '�\', '�r', '�E', '�Y');
        var bigKana = Array('�A', '�C', '�E', '�G', '�I', '��', '��', '��', '�c', '�[', '�[', '�[', '�[', '���B', '', '�d');
        var ckanaVal = '';
        for (var i = 0; i < kanaVal.length; i++) {
            var index = smallKana.indexOf(kanaVal.charAt(i)); //indexOf and stri[i] don't work on ie
            //var index = jQuery.inArray(kanaVal.charAt(i), smallKana);
            if (index !== -1) {
                ckanaVal += bigKana[index];
            }
            else {
                ckanaVal += kanaVal.charAt(i);
            }
        }
        return ckanaVal;
    }

    /**
     * [dateFormat yyyy�Nmm��dd��]
     * @param  {[type]} date [yyyy/mm/dd]
     * @return {[type]}      [description]
     */
    function jpDateFormat(strDate) {
        if (strDate == null) return '';
        var arrData = strDate.split('/');
        if (arrData.length == 3) {
            return arrData[0] + '�N' + arrData[1] + '��' + arrData[2] + '��';
        } else return null;
    }

    function stringToDate(strDate) {
        if (strDate == null) return null;
        var arrData = strDate.split('/');
        if (arrData.length == 3) {
            return new Date(arrData[0], arrData[1] - 1, arrData[2]);
        }
        return null;
    }

    /**
     * '2017/10/11', '2018/01/02'
     * @param strDate1
     * @param strDate2
     * @returns {null}
     */
    function getDiffMonth(strDate1, strDate2) {
        var d1 = stringToDate(strDate1);
        var d2 = stringToDate(strDate2);
        if (d1 !== null && d2 !== null) {
            return getDiffMonthWithDate(d1, d2)
        }
        return null;
    }

    function getDiffMonthWithDate(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth() + 1;
        months += d2.getMonth();
        if (d2.getDate() >= d1.getDate())
            months += 1;
        return months <= 0 ? 0 : months;
    }

    /**
     * Clear space in string
     * @param str
     * @returns {string | void}
     */
    function clearSpace(str) {
        return str.replace(/\s/g, '');
    }

    return {
        string_comparator: string_comparator,
        isEmpty: isEmpty,
        getNowDateJP: getNowDateJP,
        getInt: getInt,
        CSVToArray: CSVToArray,
        convertDate: convertDate,
        convertKanaToOneByte: convertKanaToOneByte,
        stringToXMLTag: stringToXMLTag,
        convertBigKana: convertBigKana,
        getDiffMonthWithDate: getDiffMonthWithDate,
        getDiffMonth: getDiffMonth,
        stringToDate: stringToDate,
        jpDateFormat: jpDateFormat,
        clearSpace: clearSpace
    }
});