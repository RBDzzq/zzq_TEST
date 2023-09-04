/**
 * @NApiVersion 2.0
 * @NScriptType plugintypeimpl
 *
 * 共有機能
 *
 * Version    Date            Author           Remarks
 * 1.00       2018/01/09      Astop            Initial
 *
 */

define(function() {
    var createKanaMap =  function(properties, values) {
        var kanaMap = {};
        // 念のため文字数が同じかどうかをチェックする(ちゃんとマッピングできるか)
        if(properties.length === values.length) {
            for(var i=0, len=properties.length; i<len; i++) {
                var property= properties.charCodeAt(i),
                    value = values.charCodeAt(i);
                kanaMap[property] = value;
            }
        }
        return kanaMap;
    };

    // 全角から半角への変換用マップ
    var m = createKanaMap(
        'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォッャュョ',
        'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｯｬｭｮ'
    );
    // 半角から全角への変換用マップ
    /*var mm = createKanaMap(
        'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｯｬｭｮ',
        'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォッャュョ'
    );*/

    // 全角から半角への変換用マップ
    var g = createKanaMap(
        'ガギグゲゴザジズゼゾダヂヅデドバビブベボ',
        'ｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎ'
    );
    // 半角から全角への変換用マップ
    /*var gg = createKanaMap(
        'ｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎ',
        'ガギグゲゴザジズゼゾダヂヅデドバビブベボ'
    );*/
      
    // 全角から半角への変換用マップ
    var p = createKanaMap(
        'パピプペポ',
        'ﾊﾋﾌﾍﾎ'
    );
    // 半角から全角への変換用マップ
    /*var pp = createKanaMap(
        'ﾊﾋﾌﾍﾎ',
        'パピプペポ'
    );*/

    var gMark = 'ﾞ'.charCodeAt(0);
    var pMark = 'ﾟ'.charCodeAt(0);

    return {
        isEmpty: function(stValue) {
            if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
                return true;
            } else {
                return false;
            }
        },
        convertKanaToOneByte: function(str){
            for(var i=0, len=str.length; i<len; i++) {
                if(g.hasOwnProperty(str.charCodeAt(i)) || p.hasOwnProperty(str.charCodeAt(i))) {
                    if(g[str.charCodeAt(i)]) {
                        str = str.replace(str[i], String.fromCharCode(g[str.charCodeAt(i)])+String.fromCharCode(gMark));
                    }else if(p[str.charCodeAt(i)]) {
                        str = str.replace(str[i], String.fromCharCode(p[str.charCodeAt(i)])+String.fromCharCode(pMark));
                    }else {
                        break;
                    }
                    i++;
                    len = str.length;
                }else {
                    if(m[str.charCodeAt(i)]) {
                        str = str.replace(str[i], String.fromCharCode(m[str.charCodeAt(i)]));
                    }
                }
            }
            return str;
        },
        /**
	 	* Input a string of csv data and parse it and return to two dimension array
	 	* @param {[string]} strData      [csv string data]
	 	* @param {[string]} strDelimiter [split method charactor]
	 	*/
        CSVToArray: function( strData, strDelimiter ){
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
		  while (arrMatches = objPattern.exec( strData )){

		      // Get the delimiter that was found.
		      var strMatchedDelimiter = arrMatches[ 1 ];

		      // Check to see if the given delimiter has a length
		      // (is not the start of string) and if it matches
		      // field delimiter. If id does not, then we know
		      // that this delimiter is a row delimiter.
		      if (
		          strMatchedDelimiter.length &&
		          strMatchedDelimiter !== strDelimiter
		          ){

		          // Since we have reached a new row of data,
		          // add an empty row to our data array.
		            arrData.push( [] );
		        }
		        var strMatchedValue;
		      // Now that we have our delimiter out of the way,
		      // let's check to see which kind of value we
		      // captured (quoted or unquoted).
		        if (arrMatches[ 2 ]){
		          // We found a quoted value. When we capture
		          // this value, unescape any double quotes.
		            strMatchedValue = arrMatches[ 2 ].replace(
		            	new RegExp( "\"\"", "g" ),
		            	"\""
		            );
		        }else {
		          // We found a non-quoted value.
		            strMatchedValue = arrMatches[ 3 ];
		        }
		      // Now that we have our value string, let's add
		      // it to the data array.
		        arrData[ arrData.length - 1 ].push( strMatchedValue );
		    }

		  // Return the parsed data.
		    return( arrData );
		}
    }
});