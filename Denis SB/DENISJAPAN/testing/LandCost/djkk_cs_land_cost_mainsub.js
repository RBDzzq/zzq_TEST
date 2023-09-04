/**
 * DJ_�A�����|��Client mainsublist
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/23     CPC_��
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
	//changed by geng add start
	var landedcostamountBal = nlapiGetFieldValue('custrecord_djkk_baling_generation');
	//changed by geng add end
		var percentAll5=0;
		var percentAll6=0;
		var percentAll7=0;
		var percentAll13=0;
		var percentAll14=0;
		//changed by geng add start
		var percentAllBal=0;
		//changed by geng add end
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
			
			//changed by geng add start
			var PercentBal = nlapiGetLineItemValue('custpage_main_sublist', 'custpage_djkk_main_baling_generation',i);
            if(isEmpty(PercentBal)){PercentBal='0';}
            percentAllBal+=Number(PercentBal.split('%')[0]);
			//changed by geng add end
			
		}
		if(percentAll5!='100'&&percentAll5!='0'&&!isEmpty(landedcostamount5)&&landedcostamount5!=0){
			alert('PO�z����AIR/SEA�^���������̍��v��100%�ł͂���܂���');
//			return false;
		}
		if(percentAll6!='100'&&percentAll6!='0'&&!isEmpty(landedcostamount6)&&landedcostamount6!=0){
			alert('PO�z���̕ی����������̍��v��100%�ł͂���܂���');
//			return false;
		}
		if(percentAll7!='100'&&percentAll7!='0'&&!isEmpty(landedcostamount7)&&landedcostamount7!=0){
			alert('PO�z���̒ʊ֎萔���������̍��v��100%�ł͂���܂���');
//			return false;
		}
		if(percentAll13!='100'&&percentAll13!='0'&&!isEmpty(landedcostamount13)&&landedcostamount13!=0){
			alert('PO�z���̂��̑��o������̍��v��100%�ł͂���܂���');
//			return false;
		}
		if(percentAll14!='100'&&percentAll14!='0'&&!isEmpty(landedcostamount14)&&landedcostamount14!=0){
			alert('PO�z���̍����^���������̍��v��100%�ł͂���܂���');
//			return false;
		}	
		//changed by geng add start
		if(percentAllBal!='100'&&percentAllBal!='0'&&!isEmpty(landedcostamountBal)&&landedcostamountBal!=0){
			alert('PO�z���̍���㊄�����̍��v��100%�ł͂���܂���');
//			return false;
		}
		//changed by geng add end
		
		//20221202 add by zhou CH147 
		//�ۑ�����po�z���ی�����po���הz���ی�����DJ _�ی�����r����
		var mainSubtype = 'custpage_main_sublist';//po�z��
		var lineSubtype = 'custpage_sublist';//po���הz��
		var count=nlapiGetLineItemCount(mainSubtype);//po�z��
		var lineCount=nlapiGetLineItemCount(lineSubtype);//po���הz��
		var premiumAmount = Number(nlapiGetFieldValue('custrecord_djkk_landedcostamount6'));
		var poMainPremiumAmount = 0 ;
		var poLinePremiumAmount = 0 ;
		for (var s = 1; s < count + 1; s++) {
			poMainPremiumAmount += Number(nlapiGetLineItemValue(mainSubtype, 'custpage_djkk_main_premium', s));
		}
		for (var q = 1; q < lineCount + 1; q++) {
			poLinePremiumAmount += Number(nlapiGetLineItemValue(lineSubtype, 'custpage_djkk_landedcostamount6_cha_m', q));
		}
		if(poMainPremiumAmount != premiumAmount){
			alert('po�z�����X�g�́u�ی����v�̉��i���z�́uDJ _�ی����v�Ɠ���������܂���̂ŁA���m�F���������B')
			return false;
		}
		if(poLinePremiumAmount != premiumAmount){
			alert('po���הz�����X�g�́u�ی����v�̉��i���z�́uDJ _�ی����v�Ɠ���������܂���̂ŁA���m�F���������B')
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
//	if(name=='custpage_flag'){
//		var flg=nlapiGetFieldValue('custpage_flag');
//		if(flg=='hi'){
//			nlapiSetFieldValue('custrecord_djkk_landedcost_hol','T');
//			}else if(flg=='lo'){
//			nlapiSetFieldValue('custrecord_djkk_landedcost_hol','F');	
//			}
//		var licount=nlapiGetLineItemCount(lineSubType);
//		for(var lic=1;lic<licount+1;lic++){
//			var duty_rate_hi=0;
//			var duty_rate_lo=0;
//			var sun_amount_1=0;
//			if(!isEmpty(nlapiGetLineItemValue(lineSubType, 'custpage_djkk_landedcost_sun_amount_1', lic))){
//			sun_amount_1=nlapiGetLineItemValue(lineSubType, 'custpage_djkk_landedcost_sun_amount_1', lic);
//			}
//			var sun_amount_2=0;
//			if(!isEmpty(nlapiGetLineItemValue(lineSubType, 'custpage_djkk_landedcost_sun_amount_2', lic))){
//			sun_amount_2=nlapiGetLineItemValue(lineSubType, 'custpage_djkk_landedcost_sun_amount_2', lic);
//			}
//			if(Number(sun_amount_1)>=Number(sun_amount_2)){
//				duty_rate_hi=sun_amount_1;
//				duty_rate_lo=sun_amount_2;
//			}else{
//				duty_rate_hi=sun_amount_2;
//				duty_rate_lo=sun_amount_1;
//			}
//			if(flg=='hi'){
//			nlapiSetLineItemValue(lineSubType, 'custpage_djkk_customs_duty_rate', lic,duty_rate_hi);
//			}else if(flg=='lo'){
//			nlapiSetLineItemValue(lineSubType, 'custpage_djkk_customs_duty_rate', lic,duty_rate_lo);
//			}
//		}
//	}	
	// DJ_AIR/SEA�^��
	if(name=='custrecord_djkk_landedcostamount5'||name=='custrecord_djkk_landedcostmethod5'){
		var landedcostmethodField='custrecord_djkk_landedcostmethod5';
		var landedcostamountField='custrecord_djkk_landedcostamount5';
		var landedcostamountperField='custpage_djkk_main_landedcostamount5_per';
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField,null);
	}
	
	// DJ_�ʊ֎萔��
	if(name=='custrecord_djkk_landedcostamount7'||name=='custrecord_djkk_landedcostmethod7'){
		var landedcostmethodField='custrecord_djkk_landedcostmethod7';
		var landedcostamountField='custrecord_djkk_landedcostamount7';
		var landedcostamountperField='custpage_djkk_main_landedcostamount7_per';
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField,null);
	}
	
	// DJ_���̑��o��
	if(name=='custrecord_djkk_landedcostamount13'||name=='custrecord_djkk_landedcostmethod13'){
		var landedcostmethodField='custrecord_djkk_landedcostmethod13';
		var landedcostamountField='custrecord_djkk_landedcostamount13';
		var landedcostamountperField='custpage_djkk_main_landedcostamount13_per';
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField,null);
	}
	
	// DJ_�����^��
	if(name=='custrecord_djkk_landedcostamount14'||name=='custrecord_djkk_landedcostmethod14'){
		var landedcostmethodField='custrecord_djkk_landedcostmethod14';
		var landedcostamountField='custrecord_djkk_landedcostamount14';
		var landedcostamountperField='custpage_djkk_main_landedcostamount14_per';
		changeMainLinePercent(mainSubtype, landedcostmethodField, landedcostamountField,landedcostamountperField,null);
	}
	
	// DJ_�ی���
	if(name=='custrecord_djkk_landedcostamount6'){
		//�ی����̌v�Zflag
		var countPremiumflag = true ;
		var landedcostamountField='custrecord_djkk_landedcostamount6';
		var landedcostamountperField='custpage_djkk_main_landedcostamount6_per';
//		changeMainLinePercent(mainSubtype,null, landedcostamountField,landedcostamountperField,countPremiumflag);
	}
	//changed by geng add start U583
	//DJ_�����
	if(name=='custrecord_djkk_baling_generation'){
		var landedcostmethodField='custrecord_djkk_baling_method';
		var landedcostamountField='custrecord_djkk_baling_generation';
		var landedcostamountperField='custpage_djkk_main_baling_generation';
		changeMainLinePercent(mainSubtype,landedcostmethodField, landedcostamountField,landedcostamountperField,null);
	}
	//changed by geng add end U583
			
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
        //20221202 add by zhou start
        if(name=='custpage_djkk_main_premium'){
			var landedcostamountField='custrecord_djkk_landedcostamount6'
			var mianPerField='custpage_djkk_main_landedcostamount6_per';;
			var mianLinePremiumField='custpage_djkk_main_premium';
			var linePerField='custpage_djkk_landedcostamount6_per';
			var linelandedcostamountmField='custpage_djkk_landedcostamount6_m';
			var linelandedcostamountchamField='custpage_djkk_landedcostamount6_cha_m';
			changeLinePremium(mainSubtype,lineSubType,null,landedcostamountField, mianPerField,mianLinePremiumField,linePerField, linelandedcostamountmField,linelandedcostamountchamField,linenum);
		}
        //end
        
        //changed by geng add start U584
        if(name=='custpage_djkk_main_baling_generation'){
			var landedcostamountField='custrecord_djkk_baling_generation';
			var mianPerField='custpage_djkk_main_baling_generation';
			var linePerField='custpage_djkk_landedcostamountpack_per';
			var linelandedcostamountmField='custpage_djkk_landedcostamountpack_m';
			var linelandedcostamountchamField='custpage_djkk_landedcostamountpack_cha_m';
			changeLineLinePercent(mainSubtype,lineSubType,null,landedcostamountField, mianPerField,linePerField, linelandedcostamountmField,linelandedcostamountchamField,linenum);
		}
      //changed by geng add end U584
        document.getElementById("custpage_po_line_amount_sum").onclick();
}

/**
 * 
 */
function changeMainLinePercent(mainSubtype, landedcostmethodField,landedcostamountField, landedcostamountperField,flag) {
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
			// �d��
			if (landedcostmethod == '1') {
				splitType = 'custpage_djkk_main_weight';
				splitSum = lcWeightSum;

				// ����
			} else if (landedcostmethod == '2') {
				splitType = 'custpage_djkk_main_quantity';
				splitSum = lcQuantitySum;
				// �l
			} else if (landedcostmethod == '3') {
				splitType = 'custpage_djkk_main_acount';
				splitSum = lcAcountSum;
			}
		if (!isEmpty(landedcostamount)) {
			//�ی���
			var premium;
			for (var i = 1; i < count + 1; i++) {
				if (i != count) {
					var lPercent = (Number(nlapiGetLineItemValue(mainSubtype,splitType, i)) / splitSum) * 100;
					lPercent = (lPercent.toString() == 'NaN') ? "0" : Number(lPercent.toFixed(2));
					nlapiSetLineItemValue(mainSubtype,landedcostamountperField, i, lPercent + '%');
					//�ی����̌v�Z�t���O
					if(flag == true){
						premium = 	Number(rounding(lPercent/100))*Number(landedcostamount);
						nlapiSetLineItemValue(mainSubtype,'custpage_djkk_main_premium', i,premium);
					}
					
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
					//�ی����̌v�Z�t���O
					if(flag == true){
						premium = 	Number(((100 - Number(persum))/100).toFixed(2))*Number(landedcostamount);
						nlapiSetLineItemValue(mainSubtype,'custpage_djkk_main_premium', i,premium,false,false);
					}
				}
			}
		}

	}
}
 
/**
 * po�z���ی����̕ϓ����̌v�Z-po���הz���ی����̓����ύX CH147 20221202 add by zhou
 */
function changeLinePremium(mainSubtype,lineSubtype,landedcostmethodField,landedcostamountField, mianPerField,mianLinePremiumField,linelandedcostamountperField, linelandedcostamountmField,linelandedcostamountchamField,linenum) {
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
			nlapiSetLineItemValue(mainSubtype, mianLinePremiumField, s, '');
		}
		for (var q = 1; q < lineCount + 1; q++) {
			nlapiSetLineItemValue(lineSubtype, linelandedcostamountchamField, q, '');
		}
	} else {

		if (!isEmpty(landedcostamount)) {
			var mianLinePremium =Number(nlapiGetLineItemValue(mainSubtype, mianLinePremiumField, linenum));
			var mianLinePer =nlapiGetLineItemValue(mainSubtype, mianPerField, linenum).split('%')[0];
			var poId=nlapiGetLineItemValue(mainSubtype,'custpage_main_po', linenum);
			var poAmount=Number(nlapiGetLineItemValue(mainSubtype,'custpage_djkk_main_acount', linenum));

			var theEndstNum;
			for(var j=1;j<lineCount+1;j++){
				var linePoId=nlapiGetLineItemValue(lineSubtype, 'custpage_po', j);
				if(linePoId==poId){
					theEndstNum = j;
				}
			}
			var tempAmountTotal = 0;
//			alert(lineCount)
			for(var lic=1;lic<lineCount+1;lic++){
				if(lic!=theEndstNum){
					var linePoId=nlapiGetLineItemValue(lineSubtype, 'custpage_po', lic);
					var lineAmount=Number(nlapiGetLineItemValue(lineSubtype, 'custpage_djkk_acount', lic));
//					alert('linePoId'+linePoId)
					if(linePoId==poId){
						
						var changeAmount = lineAmount/poAmount*mianLinePremium
//						var lineper=nlapiGetLineItemValue(lineSubtype,linelandedcostamountperField, lic).split('%')[0];
//						var changeAmount = Number(mianLinePremium)/Number(rounding(mianLinePer/100))*Number(rounding(lineper/100));

						
						changeAmount=(changeAmount.toString()== 'NaN') ? "" : Number(changeAmount);
//						alert(changeAmount)
					    nlapiSetLineItemValue(lineSubtype, linelandedcostamountmField, lic, Math.round(Number(changeAmount)));
						nlapiSetLineItemValue(lineSubtype, linelandedcostamountchamField, lic,Math.round(Number(changeAmount)));
				     }
				}else{	
					var amountSum=0;
					for(var k=1;k<theEndstNum;k++){
						var linePoIdAfter =nlapiGetLineItemValue(lineSubtype, 'custpage_po', k);
						if(linePoIdAfter==poId){
							amountSum+=Number(nlapiGetLineItemValue(lineSubtype, linelandedcostamountchamField, k));
						}
					}
					
					var changeAmount = Number(Number(mianLinePremium) - Number(amountSum))
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountmField, lic, Math.round(Number(changeAmount).toFixed(2)));
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountchamField, lic,Math.round(Number(changeAmount).toFixed(2)));
				}
			}
		}
	}
}
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
			// �d��
			if (landedcostmethod == '1') {
				splitType ='custpage_djkk_main_weight';
				lineSplitType='custpage_djkk_weight';

				// ����
			} else if (landedcostmethod == '2') {
				splitType ='custpage_djkk_main_quantity';
				lineSplitType='custpage_djkk_quantity';
				// �l
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
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountmField, lic, Math.round(Number(changeAmount).toFixed(2)));
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountchamField, lic, Math.round(Number(changeAmount).toFixed(2)));
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
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountmField, lic, Math.round(Number(Number(landedcostamount)-Number(amountSum)).toFixed(2)));
					nlapiSetLineItemValue(lineSubtype, linelandedcostamountchamField, lic,Math.round(Number(Number(landedcostamount)-Number(amountSum)).toFixed(2)));
				}
			}
		}

	}
}
function rounding(num){
	  var result = parseFloat(num);
	  result = Math.round(num * 100) / 100;
	  var s_x = result.toString();
	  var pos_decimal = s_x.indexOf('.');
	  if (pos_decimal < 0) {
	    pos_decimal = s_x.length;
	    s_x += '.';
	  }
	  while (s_x.length <= pos_decimal + 2) {
	    s_x += '0';
	  }
	  return Number(s_x);
}