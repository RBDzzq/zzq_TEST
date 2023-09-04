/**
 * DJ_輸入諸掛のClient mainsublist
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/23     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function mainClientSaveRecord(){
	var count = nlapiGetLineItemCount('custpage_main_sublist');
	var landedcostamount5=nlapiGetFieldValue('custrecord_djkk_landedcostamount5');
	var landedcostamount6=nlapiGetFieldValue('custrecord_djkk_landedcostamount6');
	var landedcostamount7=nlapiGetFieldValue('custrecord_djkk_landedcostamount7');
	var landedcostamount13=nlapiGetFieldValue('custrecord_djkk_landedcostamount13');
	var landedcostamount14=nlapiGetFieldValue('custrecord_djkk_landedcostamount14');
		var percentAll5=0;
		var percentAll6=0;
		var percentAll7=0;
		var percentAll13=0;
		var percentAll14=0;
		for (var i = 1; i < count + 1; i++) {
			var Percent5 = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_djkk_main_landedcostamount5_per',i);
			if(isEmpty(Percent5)){Percent5='0';}
			percentAll5+=Number(Percent5.split('%')[0]);
			
			var Percent6 = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_djkk_main_landedcostamount6_per',i);
			if(isEmpty(Percent6)){Percent6='0';}
			percentAll6+=Number(Percent6.split('%')[0]);
			
            var Percent7 = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_djkk_main_landedcostamount7_per',i);
            if(isEmpty(Percent7)){Percent7='0';}
			percentAll7+=Number(Percent7.split('%')[0]);
			
			var Percent13 = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_djkk_main_landedcostamount13_per',i);
            if(isEmpty(Percent13)){Percent13='0';}
			percentAll13+=Number(Percent13.split('%')[0]);
			
			var Percent14 = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_djkk_main_landedcostamount14_per',i);
            if(isEmpty(Percent14)){Percent14='0';}
			percentAll14+=Number(Percent14.split('%')[0]);

		}
		if(percentAll5!='100'&&percentAll5!='0'&&!isEmpty(landedcostamount5)&&landedcostamount5!=0){
			alert('PO配賦のAIR/SEA運賃割合率の合計は100%ではありません');
			return false;
		}
		if(percentAll6!='100'&&percentAll6!='0'&&!isEmpty(landedcostamount6)&&landedcostamount6!=0){
			alert('PO配賦の保険料割合率の合計は100%ではありません');
			return false;
		}
		if(percentAll7!='100'&&percentAll7!='0'&&!isEmpty(landedcostamount7)&&landedcostamount7!=0){
			alert('PO配賦の通関手数料割合率の合計は100%ではありません');
			return false;
		}
		if(percentAll13!='100'&&percentAll13!='0'&&!isEmpty(landedcostamount13)&&landedcostamount13!=0){
			alert('PO配賦のその他経費割合率の合計は100%ではありません');
			return false;
		}
		if(percentAll14!='100'&&percentAll14!='0'&&!isEmpty(landedcostamount14)&&landedcostamount14!=0){
			alert('PO配賦の国内運賃割合率の合計は100%ではありません');
			return false;
		}		
	return true;
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function mainClientFieldChanged(type, name, linenum){
	var mainSubtype='custpage_main_sublist';
	var lineSubType='custpage_sublist';
	if(name=='custpage_flag'){
		var flg=nlapiGetFieldValue('custpage_flag');
		if(flg=='hi'){
			nlapiSetFieldValue('custrecord_djkk_landedcost_hol','T');
			}else if(flg=='lo'){
			nlapiSetFieldValue('custrecord_djkk_landedcost_hol','F');	
			}
		var licount=nlapiGetLineItemCount(lineSubType);
		for(var lic=1;lic<licount+1;lic++){
			var duty_rate_hi=0;
			var duty_rate_lo=0;
			var sun_amount_1=0;
			if(!isEmpty(nlapiGetLineItemValue(lineSubType, 'custpage_djkk_landedcost_sun_amount_1', lic))){
			sun_amount_1=nlapiGetLineItemValue(lineSubType, 'custpage_djkk_landedcost_sun_amount_1', lic);
			}
			var sun_amount_2=0;
			if(!isEmpty(nlapiGetLineItemValue(lineSubType, 'custpage_djkk_landedcost_sun_amount_2', lic))){
			sun_amount_2=nlapiGetLineItemValue(lineSubType, 'custpage_djkk_landedcost_sun_amount_2', lic);
			}
			if(Number(sun_amount_1)>=Number(sun_amount_2)){
				duty_rate_hi=sun_amount_1;
				duty_rate_lo=sun_amount_2;
			}else{
				duty_rate_hi=sun_amount_2;
				duty_rate_lo=sun_amount_1;
			}
			if(flg=='hi'){
			nlapiSetLineItemValue(lineSubType, 'custpage_djkk_customs_duty_rate', lic,duty_rate_hi);
			}else if(flg=='lo'){
			nlapiSetLineItemValue(lineSubType, 'custpage_djkk_customs_duty_rate', lic,duty_rate_lo);
			}
		}
	}	
	// DJ_AIR/SEA運賃
	if(name=='custrecord_djkk_landedcostamount5'||name=='custrecord_djkk_landedcostmethod5'){
		var landedcostmethodField='custrecord_djkk_landedcostmethod5';
		var landedcostamountField='custrecord_djkk_landedcostamount5';
		var landedcostamountperField='custpage_djkk_main_landedcostamount5_per';
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField);
	}
	
	// DJ_通関手数料
	if(name=='custrecord_djkk_landedcostamount7'||name=='custrecord_djkk_landedcostmethod7'){
		var landedcostmethodField='custrecord_djkk_landedcostmethod7';
		var landedcostamountField='custrecord_djkk_landedcostamount7';
		var landedcostamountperField='custpage_djkk_main_landedcostamount7_per';
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField);
	}
	
	// DJ_その他経費
	if(name=='custrecord_djkk_landedcostamount13'||name=='custrecord_djkk_landedcostmethod13'){
		var landedcostmethodField='custrecord_djkk_landedcostmethod13';
		var landedcostamountField='custrecord_djkk_landedcostamount13';
		var landedcostamountperField='custpage_djkk_main_landedcostamount13_per';
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField);
	}
	
	// DJ_国内運賃
	if(name=='custrecord_djkk_landedcostamount14'||name=='custrecord_djkk_landedcostmethod14'){
		var landedcostmethodField='custrecord_djkk_landedcostmethod14';
		var landedcostamountField='custrecord_djkk_landedcostamount14';
		var landedcostamountperField='custpage_djkk_main_landedcostamount14_per';
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField);
	}
	
	// DJ_保険料
	if(name=='custrecord_djkk_landedcostamount6'){
		var landedcostamountField='custrecord_djkk_landedcostamount6';
		var landedcostamountperField='custpage_djkk_main_landedcostamount6_per';
		changeMainLinePercent(mainSubtype,null, landedcostamountField,landedcostamountperField);
	}
	
	// DJ_梱包代CH377
	if(name=='custrecord_djkk_baling_generation'||name=='custrecord_djkk_baling_method'){
		var landedcostmethodField='custrecord_djkk_baling_method';
		var landedcostamountField='custrecord_djkk_baling_generation';
		var landedcostamountperField='custpage_djkk_main_baling_generation';//todo
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField);
	}
			
	// mainsublist field change
		if(name=='custpage_djkk_main_landedcostamount5_per'){
			var landedcostmethodField='custrecord_djkk_landedcostmethod5';
			var landedcostamountField='custrecord_djkk_landedcostamount5';
			var mianPerField='custpage_djkk_main_landedcostamount5_per';
			var linePerField='custpage_djkk_landedcostamount5_per';
			var linelandedcostamountmField='custpage_djkk_landedcostamount5_m';
			var linelandedcostamountchamField='custpage_djkk_landedcostamount5_cha_m';
			changeLineLinePercent(mainSubtype,lineSubType,landedcostmethodField,landedcostamountField, mianPerField,linePerField, linelandedcostamountmField,linelandedcostamountchamField,linenum);
		}
		
		if(name=='custpage_djkk_main_landedcostamount7_per'){
			var landedcostmethodField='custrecord_djkk_landedcostmethod7';
			var landedcostamountField='custrecord_djkk_landedcostamount7';
			var mianPerField='custpage_djkk_main_landedcostamount7_per';
			var linePerField='custpage_djkk_landedcostamount7_per';
			var linelandedcostamountmField='custpage_djkk_landedcostamount7_m';
			var linelandedcostamountchamField='custpage_djkk_landedcostamount7_cha_m';
			changeLineLinePercent(mainSubtype,lineSubType,landedcostmethodField,landedcostamountField, mianPerField,linePerField, linelandedcostamountmField,linelandedcostamountchamField,linenum);
		}
		if(name=='custpage_djkk_main_landedcostamount13_per'){
			var landedcostmethodField='custrecord_djkk_landedcostmethod13';
			var landedcostamountField='custrecord_djkk_landedcostamount13';
			var mianPerField='custpage_djkk_main_landedcostamount13_per';
			var linePerField='custpage_djkk_landedcostamount13_per';
			var linelandedcostamountmField='custpage_djkk_landedcostamount13_m';
			var linelandedcostamountchamField='custpage_djkk_landedcostamount13_cha_m';
			changeLineLinePercent(mainSubtype,lineSubType,landedcostmethodField,landedcostamountField, mianPerField,linePerField, linelandedcostamountmField,linelandedcostamountchamField,linenum);
		}
		if(name=='custpage_djkk_main_landedcostamount14_per'){
			var landedcostmethodField='custrecord_djkk_landedcostmethod14';
			var landedcostamountField='custrecord_djkk_landedcostamount14';
			var mianPerField='custpage_djkk_main_landedcostamount14_per';
			var linePerField='custpage_djkk_landedcostamount14_per';
			var linelandedcostamountmField='custpage_djkk_landedcostamount14_m';
			var linelandedcostamountchamField='custpage_djkk_landedcostamount14_cha_m';
			changeLineLinePercent(mainSubtype,lineSubType,landedcostmethodField,landedcostamountField, mianPerField,linePerField,linelandedcostamountmField,linelandedcostamountchamField,linenum);
		}
        if(name=='custpage_djkk_main_landedcostamount6_per'){
			var landedcostamountField='custrecord_djkk_landedcostamount6';
			var mianPerField='custpage_djkk_main_landedcostamount6_per';
			var linePerField='custpage_djkk_landedcostamount6_per';
			var linelandedcostamountmField='custpage_djkk_landedcostamount6_m';
			var linelandedcostamountchamField='custpage_djkk_landedcostamount6_cha_m';
			changeLineLinePercent(mainSubtype,lineSubType,null,landedcostamountField, mianPerField,linePerField, linelandedcostamountmField,linelandedcostamountchamField,linenum);
		}
        document.getElementById("custpage_po_line_amount_sum").onclick();
}

/**
 * 
 */
function changeMainLinePercent(mainSubtype, landedcostmethodField,landedcostamountField, landedcostamountperField) {
	var splitType = '';
	var splitSum = '';
	var lcWeightSum = 0;
	var lcQuantitySum = 0;
	var lcAcountSum = 0;
	var count = nlapiGetLineItemCount(mainSubtype);
	for (var m = 1; m < count + 1; m++) {
		lcWeightSum += Number(nlapiGetLineItemValue(mainSubtype,'custpage_djkk_main_weight', m));
		lcQuantitySum += Number(nlapiGetLineItemValue(mainSubtype,'custpage_djkk_main_quantity', m));
		lcAcountSum += Number(nlapiGetLineItemValue(mainSubtype,'custpage_djkk_main_acount', m));
	}
	var landedcostmethod = '';
	if(!isEmpty(landedcostmethodField)){
		landedcostmethod =nlapiGetFieldValue(landedcostmethodField);
	}else{
		landedcostmethod ='3';
	}
	var landedcostamount = nlapiGetFieldValue(landedcostamountField);
	if (isEmpty(landedcostmethod) || isEmpty(landedcostamount)) {
		for (var s = 1; s < count + 1; s++) {
			nlapiSetLineItemValue(mainSubtype, landedcostamountperField, s, '');
		}
	} else {
			// 重量
			if (landedcostmethod == '1') {
				splitType = 'custpage_djkk_main_weight';
				splitSum = lcWeightSum;

				// 数量
			} else if (landedcostmethod == '2') {
				splitType = 'custpage_djkk_main_quantity';
				splitSum = lcQuantitySum;
				// 値
			} else if (landedcostmethod == '3') {
				splitType = 'custpage_djkk_main_acount';
				splitSum = lcAcountSum;
			}
		if (!isEmpty(landedcostamount)) {
			for (var i = 1; i < count + 1; i++) {
				if (i != count) {
					var lPercent = (Number(nlapiGetLineItemValue(mainSubtype,splitType, i)) / splitSum) * 100;
					lPercent = (lPercent.toString() == 'NaN') ? "0" : Number(lPercent.toFixed(2));
					nlapiSetLineItemValue(mainSubtype,landedcostamountperField, i, lPercent + '%');
				} else {
					var persum = 0;
					var amountSum = 0;
					for (var j = 1; j < count; j++) {
						var jpp=nlapiGetLineItemValue(mainSubtype,landedcostamountperField, j)
						if(isEmpty(jpp)){
							jpp='0';
						}
						persum += Number(jpp.split('%')[0]);
						
					}
					nlapiSetLineItemValue(mainSubtype,landedcostamountperField, i,Number((100 - Number(persum)).toFixed(2)) + '%');
				}
			}
		}

	}
}

/**
 * 
 */
function changeLineLinePercent(mainSubtype,lineSubtype,landedcostmethodField,landedcostamountField, landedcostamountperField,linelandedcostamountperField, linelandedcostamountmField,linelandedcostamountchamField,linenum) {
	var splitType = '';
	var lineSplitType=''; 
	var landedcostmethod = '';
	var count=nlapiGetLineItemCount(mainSubtype);
	var lineCount=nlapiGetLineItemCount(lineSubtype);
	if(!isEmpty(landedcostmethodField)){
		landedcostmethod =nlapiGetFieldValue(landedcostmethodField);
	}else{
		landedcostmethod ='3';
	}
	var landedcostamount = nlapiGetFieldValue(landedcostamountField);
	if (isEmpty(landedcostmethod) || isEmpty(landedcostamount)) {
		for (var s = 1; s < count + 1; s++) {
			nlapiSetLineItemValue(mainSubtype, landedcostamountperField, s, '');
		}
		for (var q = 1; q < lineCount + 1; q++) {
			nlapiSetLineItemValue(lineSubtype, linelandedcostamountperField, q, '');
		}
	} else {
			// 重量
			if (landedcostmethod == '1') {
				splitType ='custpage_djkk_main_weight';
				lineSplitType='custpage_djkk_weight';

				// 数量
			} else if (landedcostmethod == '2') {
				splitType ='custpage_djkk_main_quantity';
				lineSplitType='custpage_djkk_quantity';
				// 値
			} else if (landedcostmethod == '3') {
				splitType ='custpage_djkk_main_acount';
				lineSplitType='custpage_djkk_acount';
			}
		if (!isEmpty(landedcostamount)) {
			var per=nlapiGetLineItemValue(mainSubtype, landedcostamountperField, linenum);
			var perins='0';
			if(!isEmpty(per)){
				perins=Number(per.split('%')[0])
			}
			per=(perins.toString()== 'NaN') ? "0" : perins;
			var selectSum=nlapiGetLineItemValue(mainSubtype,splitType, linenum);
			var poId=nlapiGetLineItemValue(mainSubtype,'custpage_main_po', linenum);
			
			for(var lic=1;lic<lineCount+1;lic++){
			if(lic!=lineCount){
				var linePoId=nlapiGetLineItemValue(lineSubtype, 'custpage_po', lic);
				  if(linePoId==poId){
					var lineselect=nlapiGetLineItemValue(lineSubtype,lineSplitType, lic);					
					var lineper='';
					  if(selectSum!=0&&selectSum!='0'&&!isEmpty(selectSum)){
					   lineper=Number((per*(lineselect/selectSum)).toFixed(2));
					      }
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountperField, lic,lineper + '%');
					var changeAmount=Number(landedcostamount)*Number(lineper/100);
					changeAmount=(changeAmount.toString()== 'NaN') ? "" : Number(changeAmount).toFixed(2);
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountmField, lic, Number(changeAmount).toFixed(2));
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountchamField, lic, Number(changeAmount).toFixed(2));
				     }
				}else{
					var persum=0;
					var amountSum=0;
					for(var j=1;j<lineCount;j++){
						var linp='0';
						if(!isEmpty(nlapiGetLineItemValue(lineSubtype, linelandedcostamountperField, j))){
							linp=nlapiGetLineItemValue(lineSubtype, linelandedcostamountperField, j).split('%')[0];
						}
						persum+=Number(linp);
						amountSum+=Number(nlapiGetLineItemValue(lineSubtype, linelandedcostamountchamField, j));
					}
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountperField,lic,Number((100-Number(persum)).toFixed(2))+'%');
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountmField, lic, Number(Number(landedcostamount)-Number(amountSum)).toFixed(2));
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountchamField, lic,Number(Number(landedcostamount)-Number(amountSum)).toFixed(2));
				}
			}
		}

	}
}