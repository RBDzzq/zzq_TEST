/**
 * DJ_—A“ü”Š|‚ÌClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/17     CPC_‰‘
 *
 */
/**
 *PO”z•Š
 */
//add by song add start U378
//function typeClientPageInit(){
//	nlapiSetFieldValue('custrecord_djkk_landedcost_flg','T');
//}
//add by song add end U378

function poAllocation(){
	setTableNone('custpage_sublist_layer');
	setTableInline('custpage_main_sublist_layer');
}

/**
 * PO–¾×”z•Š
 */
function poLineAllocation(){
	setTableNone('custpage_main_sublist_layer');
	setTableInline('custpage_sublist_layer');
	
}

/**
 * ‘‹àŠz1ÄŒvZ
 * ‘‹àŠz1(—\’èŠÖÅ‹àŠz)=(POLINE‚Ì‹àŠz*DJ_’ÊŠÖ—pˆ×‘ÖƒŒ[ƒg{AIR/SEA‰^’À{•ÛŒ¯—¿)*—\’èŠÖÅ—¦
 */
function getAmount1(){
	// DJ_’ÊŠÖ—pˆ×‘ÖƒŒ[ƒg
	var ceRate=nlapiGetFieldValue('custrecord_djkk_landedcost_ce_rate');
	if(isEmpty(ceRate)){
		ceRate = 1;
	}
	var arrivalLuggage = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');//“’…”Ô†
	var subsidiaryHeader = nlapiLookupField('inboundshipment',arrivalLuggage,'custrecord_djkk_subsidiary_header');//‰ïĞ•Ê
//	var flg=nlapiGetFieldValue('custpage_flag');
//	if(!isEmpty(ceRate)){
		var lineCounts=nlapiGetLineItemCount('custpage_sublist');
		for(var i=1;i<lineCounts+1;i++){
			var amount1 = 0;
			var polineAmount=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_acount', i))){
			polineAmount=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_acount', i);
			}
			var airsea=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m', i))){
				airsea=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m', i);
			}
			var safe=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m', i))){
				safe=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m', i);
			}
			
			var duty_exp=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_exp', i))){
				duty_exp=toPoint(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_exp', i));
			}
			//changed by geng add start U584
			var pack=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m', i))){
				pack=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m', i);
			}
			//changed by geng add start U585
			var value='';
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_express', i))){
				value = nlapiGetLineItemValue('custpage_sublist','custpage_express',i);//ŒvZ®
			}
			var poNum=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_quantity', i))){
			    poNum = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_quantity',i);// ”—Ê
			}
			var poItemMon=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_min_invun', i))){
				poItemMon = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_min_invun',i);// Å¬İŒÉ’PˆÊŠÖÅ
			}
			//changed by geng add end U585
			//changed by geng add start U581
			var poRate=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_po_rate', i))){
				poRate=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_po_rate', i);
			}
			
			//changed by geng add end U581
			
			var costWeight = 1;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_cost_weight', i))){
					costWeight = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_cost_weight', i);
				}
			
			
			//amount1=(Number(polineAmount)*Number(ceRate)+Number(airsea)+Number(safe))*Number(duty_exp);
			amount1=Math.round(Number(((Number(polineAmount)*Number(ceRate)+Number(airsea)+Number(safe)+Number(pack))*Number(duty_exp)).toFixed(2)));
			
//			console.log('debug', 'polineAmount', polineAmount);
//			console.log('debug', 'poRate', poRate);
//			console.log('debug', 'airsea', airsea);
//			console.log('debug', 'safe', safe);
//			console.log('debug', 'pack', pack);
//			console.log('debug', 'duty_exp', duty_exp);
//			console.log('debug', 'amount1', amount1);
			
			

			if(subsidiaryHeader == SUB_SCETI || subsidiaryHeader == SUB_DPKK){
				var amount2=Math.round(Number(poNum)*Number(poItemMon));
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', i,amount1);//20230706 changed by zhou CH603 ¬”‚ğ•\¦‚µ‚È‚¢‚Í‚¸‚Å‚·
			}else{
				var amount2=Math.round(Number(poNum)*Number(poItemMon)*costWeight);
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', i,Math.round(amount1));//20230706 changed by zhou CH603 ¬”‚ğ•\¦‚µ‚È‚¢‚Í‚¸‚Å‚·
			}
//			console.log('debug', 'poNum', poNum);
//			console.log('debug', 'poItemMon', poItemMon);
//			console.log('debug', 'amount2', amount2);
			if(value=='one'){
				nlapiSetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_rate',i,amount1);
			}else if(value=='two'){
				nlapiSetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_rate',i,amount2);
			}else if(value=='three'){
				nlapiSetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_rate',i,amount1+amount2);
			}
//			var duty_rate_hi=0;
//			var duty_rate_lo=0;
//			var sun_amount_1=amount1;
//			var sun_amount_2=0;
//			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_2', i))){
//			sun_amount_2=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_2', i);
//			}
//			if(Number(sun_amount_1)>=Number(sun_amount_2)){
//				duty_rate_hi=sun_amount_1;
//				duty_rate_lo=sun_amount_2;
//			}else{
//				duty_rate_hi=sun_amount_2;
//				duty_rate_lo=sun_amount_1;
//			}
//			if(flg=='hi'){
//			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_rate', i,duty_rate_hi);
//			}else if(flg=='lo'){
//			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_rate', i,duty_rate_lo);
//			}
		
		}
	}
//}

function clientPageInit(type){
	var arrivalLuggage = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');//“’…”Ô†  //20230706 add by zhou
	var subsidiaryHeader = nlapiLookupField('inboundshipment',arrivalLuggage,'custrecord_djkk_subsidiary_header');//‰ïĞ•Ê //20230706 add by zhou
	//add by song add start U378
		nlapiSetFieldValue('custrecord_djkk_landedcost_flg','T');
	//add by song add end U378
	if(type!='view'){
	setButtunButtonDisable('tbl_customize');
	setButtunButtonDisable('tbl_secondarycustomize');
   setButtunButtonDisable('tbl__cancel');
   setButtunButtonDisable('tbl_secondary_cancel');  
	if(type=='edit'){
	setButtunButtonDisable('spn_ACTIONMENU_d1');
	setButtunButtonDisable('spn_secondaryACTIONMENU_d1');
	setButtunButtonDisable('tbl_changeid');
	setButtunButtonDisable('tbl_secondarychangeid');
	}
	setTableHidden('main_mh');
	setTableNone('custpage_sublist_layer');
	//setTableNone('custpage_main_sublist_layer');
	}
	//changed by geng add start U581
	if(type=='create'||type=='edit'){
		var count = nlapiGetLineItemCount('custpage_sublist');
		for(var i=1;i<count+1;i++){
			var poId = nlapiGetLineItemValue('custpage_sublist', 'custpage_po',i);
			var value = nlapiLookupField('purchaseorder', poId, 'exchangerate'); 
			var money = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_acount',i);//‹àŠz
			var air = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamount5_m',i);//AIR/SEA’²®Œã‹àŠz
			var itemId = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_lc_item',i);//ƒAƒCƒeƒ€“à•”ID
			var express = nlapiGetLineItemValue('custpage_sublist','custpage_express',i);//ŠÖÅ‹àŠzŒvZ®
			if(isEmpty(air)){
				air=0;
			}
			var insurer = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamount6_m',i);//•ÛŒ¯—¿’²®Œã‹àŠz
			if(isEmpty(insurer)){
				insurer=0;
			}
			var pack = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamountpack_m',i);//«•ï‘ã
			if(isEmpty(pack)){
				pack=0;
			}
			var exp = toPoint(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_exp',i));// —\’èŠÖÅ—¦
			if(isEmpty(exp)){
				exp=0;
			}
			
			if(isEmpty(express)){
				var costMethod = nlapiLookupField('item', itemId, 'custitem_djkk_cost_method');
				if(!isEmpty(costMethod)){
					if(costMethod == '1'){
						nlapiSetLineItemValue('custpage_sublist', 'custpage_express', i, 'one');
					}else if(costMethod == '2'){
						nlapiSetLineItemValue('custpage_sublist', 'custpage_express', i, 'two');
					}else{
						nlapiSetLineItemValue('custpage_sublist', 'custpage_express', i, 'three');
					}
				}
			}
			
			var amount = Number((Number(value)*Number(money)+Number(air)+Number(insurer)+Number(pack))*Number(exp)).toFixed(0);
			if(subsidiaryHeader == SUB_SCETI || subsidiaryHeader == SUB_DPKK){
			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', i, amount);
			}else{
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', i, Math.round(amount));//20230706 changed by zhou CH603 ¬”‚ğ•\¦‚µ‚È‚¢‚Í‚¸‚Å‚·	
			}
			
			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_po_rate', i, value);
			
		}
	}
	//changed by geng add end U581
}

function clientSaveRecord() {
	//changed by geng add U430 start
//	var arrival_luggage = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');
//	var sub = nlapiLookupField('inboundShipment',arrival_luggage,'custrecord_djkk_subsidiary_header');
//	if(sub == SUB_SCETI || sub == SUB_DPKK){
		var landedCostRate=nlapiGetFieldValue('custrecord_djkk_landedcost_ce_rate');
		if(isEmpty(landedCostRate)){
			alert('ˆ×‘Ö‚Í‰~‚Ìê‡‚Í1‚ğ“ü—Í‚­‚¾‚³‚¢B');
			return false;
		}
//	}

	//changed by geng add U430 end
	//var landedcostmethod = nlapiGetFieldValue('custrecord_djkk_landedcost_pop');
	var count = nlapiGetLineItemCount('custpage_sublist');
	var landedcostamount5=nlapiGetFieldValue('custrecord_djkk_landedcostamount5');
	var landedcostamount6=nlapiGetFieldValue('custrecord_djkk_landedcostamount6');
	var landedcostamount7=nlapiGetFieldValue('custrecord_djkk_landedcostamount7');
	var landedcostamount13=nlapiGetFieldValue('custrecord_djkk_landedcostamount13');
	var landedcostamount14=nlapiGetFieldValue('custrecord_djkk_landedcostamount14');
	var landedcostamount15=nlapiGetFieldValue('custrecord_djkk_landedcostamount15');//0215‰¤‚æ‚è‚»‚Ì‘¼‚Ìè”—¿’Ç‰Á
	//changed by geng add start U584
	var landedcostamountbal=nlapiGetFieldValue('custrecord_djkk_baling_generation');
	//changed by geng add end U584
		var percentAll5=0;
		var percentAll5Temp=0;
		var percentAll6=0;
		var percentAll6Temp=0;
		var percentAll7=0;
		var percentAll7Temp=0;
		var percentAll13=0;
		var percentAll13Temp=0;
		var percentAll14=0;
		var percentAll14Temp=0;
		var percentAll15=0;//0215‰¤‚æ‚è‚»‚Ì‘¼‚Ìè”—¿’Ç‰Á
		var percentAll15Temp=0;//0215‰¤‚æ‚è‚»‚Ì‘¼‚Ìè”—¿’Ç‰Á
		var changeMoney5=0;
		var changeMoney6=0;
		var changeMoney7=0;
		var changeMoney13=0;
		var changeMoney14=0;
		var changeMoney15=0;//0215‰¤‚æ‚è‚»‚Ì‘¼‚Ìè”—¿’Ç‰Á
		//changed by geng add start
		var percentBal = 0;
		var percentBalTemp=0;
		var changeMoneyBal = 0
		
		//changed by geng add end 
		for (var i = 1; i < count + 1; i++) {
			if(isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_act',i))){
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_act', i, nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_rate',i));
			}
			//sublist‚É‚»‚Ì‚Ù‚©‚ÌÅ‹à‚Ö’lİ’è‚Í‚¢‚ç‚È‚¢‚Å‚·B
			if(isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act',i))){
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act', i, nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_rate',i));
			}
			//start
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_po_rate',i))){
				nlapiSetLineItemValue('custpage_djkk_po_rate',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_po_rate',i));
			}
			//end
			if(isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_work_cost_act',i))){
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_work_cost_act', i, nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_work_cost_rate',i));
			}
			var Percent5 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_per',i);
			if(isEmpty(Percent5)){Percent5='0';}
			percentAll5Temp= Number(Percent5.split('%')[0])+Number(percentAll5);
			percentAll5 = percentAll5Temp.toFixed(2);
			
//			alert('Percent5='+Percent5)
//			alert('percentAll5Temp='+percentAll5Temp)
//			alert('percentAll5='+percentAll5)
			changeMoney5+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m',i));
			
			var Percent6 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_per',i);
			if(isEmpty(Percent6)){Percent6='0';}
			percentAll6Temp= Number(Percent6.split('%')[0])+Number(percentAll6);
			percentAll6 = percentAll6Temp.toFixed(2);
//			alert('percentAll6='+percentAll6)
			changeMoney6+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m',i));
			
			//changed by geng add start
			var PercentBal = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_per',i);
			if(isEmpty(PercentBal)){PercentBal='0';}
			percentBalTemp =Number(PercentBal.split('%')[0])+Number(percentBal);
			percentBal = percentBalTemp.toFixed(2);
//			alert(percentBal)
			changeMoneyBal+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m',i));
			//changed by geng add end
			
            var Percent7 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_per',i);
            if(isEmpty(Percent7)){Percent7='0';}
			percentAll7Temp =Number(Percent7.split('%')[0])+Number(percentAll7);
			percentAll7 = percentAll7Temp.toFixed(2);
			changeMoney7+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_cha_m',i));
			
			var Percent13 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_per',i);
            if(isEmpty(Percent13)){Percent13='0';}
			percentAll13Temp =Number(Percent13.split('%')[0])+Number(percentAll13);
			percentAll13 = percentAll13Temp.toFixed(2); 
			changeMoney13+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_cha_m',i));
			
			var Percent14 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_per',i);
            if(isEmpty(Percent14)){Percent14='0';}
			percentAll14Temp =Number(Percent14.split('%')[0])+Number(percentAll14);
			percentAll14 = percentAll14Temp.toFixed(2);
			changeMoney14+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_cha_m',i));

			//0215‰¤‚æ‚è‚»‚Ì‘¼‚Ìè”—¿’Ç‰Á
			var Percent15 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount15_per',i);
			if(isEmpty(Percent15)){Percent15='0';}
			percentAll15Temp=Number(Percent15.split('%')[0])+Number(percentAll15);
			percentAll15 = percentAll15Temp.toFixed(2); 
			changeMoney15+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act',i));
			
			
		}
		//changed by geng add start
		if(percentBal!='100.00'&&percentBal!='0'&&!isEmpty(landedcostamountbal)&&landedcostamountbal!=0){
			alert('PO–¾×”z•Š‚Ì«•ï‘ãŠ„‡—¦‚Ì‡Œv‚Í100%‚Å‚Í‚ ‚è‚Ü‚¹‚ñ');
//			return false;
		}
		//changed by geng add end
		if(percentAll5!='100.00'&&percentAll5!='0'&&!isEmpty(landedcostamount5)&&landedcostamount5!=0){
//			alert(percentAll5)
//			alert(landedcostamount5)
			alert('PO–¾×”z•Š‚ÌAIR/SEA‰^’ÀŠ„‡—¦‚Ì‡Œv‚Í100%‚Å‚Í‚ ‚è‚Ü‚¹‚ñ');
//			return false;
		}
		if(percentAll6!='100.00'&&percentAll6!='0'&&!isEmpty(landedcostamount6)&&landedcostamount6!=0){
			alert('PO–¾×”z•Š‚Ì•ÛŒ¯—¿Š„‡—¦‚Ì‡Œv‚Í100%‚Å‚Í‚ ‚è‚Ü‚¹‚ñ');
//			return false;
		}
		if(percentAll7!='100.00'&&percentAll7!='0'&&!isEmpty(landedcostamount7)&&landedcostamount7!=0){
			alert('PO–¾×”z•Š‚Ì’ÊŠÖè”—¿Š„‡—¦‚Ì‡Œv‚Í100%‚Å‚Í‚ ‚è‚Ü‚¹‚ñ');
//			return false;
		}
		if(percentAll13!='100.00'&&percentAll13!='0'&&!isEmpty(landedcostamount13)&&landedcostamount13!=0){
			alert('PO–¾×”z•Š‚Ì‚»‚Ì‘¼Œo”ïŠ„‡—¦‚Ì‡Œv‚Í100%‚Å‚Í‚ ‚è‚Ü‚¹‚ñ');
//			return false;
		}
		if(percentAll14!='100.00'&&percentAll14!='0'&&!isEmpty(landedcostamount14)&&landedcostamount14!=0){
			alert('PO–¾×”z•Š‚Ì‘“à‰^’ÀŠ„‡—¦‚Ì‡Œv‚Í100%‚Å‚Í‚ ‚è‚Ü‚¹‚ñ');
//			return false;
		}
		//0215‰¤‚æ‚è‚»‚Ì‘¼‚Ìè”—¿’Ç‰Á
		if(percentAll15!='100.00'&&percentAll15!='0'&&!isEmpty(landedcostamount15)&&landedcostamount15!=0){
			alert('PO–¾×”z•Š‚Ì‚»‚Ì‘¼‚ÌÅ‹à‚Ì‡Œv‚Í100%‚Å‚Í‚ ‚è‚Ü‚¹‚ñ');
//			return false;
		}
		
		if(changeMoney5!=landedcostamount5){
		alert('PO–¾×”z•Š‚ÌAIR/SEA‰^’À’²®Œã‹àŠz‚Ì‡ŒvŠz‚ÆDJ_AIR/SEA‰^’À‚Í‚ ‚Á‚Ä‚¢‚È‚¢‚Å‚·');
		return false;
	}
	if(changeMoney6!=landedcostamount6){
		alert('PO–¾×”z•Š‚Ì•ÛŒ¯—¿’²®Œã‹àŠz‚Ì‡ŒvŠz‚ÆDJ_•ÛŒ¯—¿‚Í‚ ‚Á‚Ä‚¢‚È‚¢‚Å‚·');
		return false;
	}
	if(changeMoney7!=landedcostamount7){
		alert('PO–¾×”z•Š‚Ì’ÊŠÖè”—¿’²®Œã‹àŠz‚Ì‡ŒvŠz‚ÆDJ_’ÊŠÖè”—¿‚Í‚ ‚Á‚Ä‚¢‚È‚¢‚Å‚·');
		return false;
	}
	if(changeMoney13!=landedcostamount13){
		alert('PO–¾×”z•Š‚Ì‚»‚Ì‘¼Œo”ï’²®Œã‹àŠz‚Ì‡ŒvŠz‚ÆDJ_‚»‚Ì‘¼Œo”ï‚Í‚ ‚Á‚Ä‚¢‚È‚¢‚Å‚·');
		return false;
	}
	if(changeMoney14!=landedcostamount14){
		alert('PO–¾×”z•Š‚Ì‘“à‰^’À’²®Œã‹àŠz‚Ì‡ŒvŠz‚ÆDJ_‘“à‰^’À‚Í‚ ‚Á‚Ä‚¢‚È‚¢‚Å‚·');
		return false;
	}
	if(changeMoney15!=landedcostamount15){
//		alert('changeMoney15='+changeMoney15)
//		alert('landedcostamount15='+landedcostamount15)
		alert('PO–¾×”z•Š‚»‚Ì‘¼‚ÌÅ‹à‚Ì‡ŒvŠz‚ÆDJ‚»‚Ì‘¼‚ÌÅ‹à‚Í‚ ‚Á‚Ä‚¢‚È‚¢‚Å‚·');
		return false;
	}
	if(changeMoneyBal!=landedcostamountbal){
//		alert('changeMoneyBal='+changeMoneyBal)
//		alert('landedcostamountbal='+landedcostamountbal)
		alert('PO–¾×”z•Š«•ï‘ã‚Ì‡ŒvŠz‚ÆDJ«•ï‘ã‚Í‚ ‚Á‚Ä‚¢‚È‚¢‚Å‚·');
		return false;
	}
		
//		if(changeMoney5!=landedcostamount5){
//			alert('PO–¾×”z•Š‚ÌAIR/SEA‰^’À’²®Œã‹àŠz‚Ì‡ŒvŠz‚ªDJ_AIR/SEA‰^’À‚ğ’´‚¦‚Ä‚¢‚Ü‚·');
//			return false;
//		}
//		if(changeMoney6!=landedcostamount6){
//			alert('PO–¾×”z•Š‚Ì•ÛŒ¯—¿’²®Œã‹àŠz‚Ì‡ŒvŠz‚ªDJ_•ÛŒ¯—¿‚ğ’´‚¦‚Ä‚¢‚Ü‚·');
//			return false;
//		}
//		if(changeMoney7!=landedcostamount7){
//			alert('PO–¾×”z•Š‚Ì’ÊŠÖè”—¿’²®Œã‹àŠz‚Ì‡ŒvŠz‚ªDJ_’ÊŠÖè”—¿‚ğ’´‚¦‚Ä‚¢‚Ü‚·');
//			return false;
//		}
//		if(changeMoney13!=landedcostamount13){
//			alert('PO–¾×”z•Š‚Ì‚»‚Ì‘¼Œo”ï’²®Œã‹àŠz‚Ì‡ŒvŠz‚ªDJ_‚»‚Ì‘¼Œo”ï‚ğ’´‚¦‚Ä‚¢‚Ü‚·');
//			return false;
//		}
//		if(changeMoney14!=landedcostamount14){
//			alert('PO–¾×”z•Š‚Ì‘“à‰^’À’²®Œã‹àŠz‚Ì‡ŒvŠz‚ªDJ_‘“à‰^’À‚ğ’´‚¦‚Ä‚¢‚Ü‚·');
//			return false;
//		}
//		
	return true;
}

function clientFieldChanged(type, name, linenum) {
	//changed by geng add start U582
	if(name=='custpage_djkk_other_taxes_act'){
		var lineNum = nlapiGetCurrentLineItemIndex('custpage_sublist');
			var item = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_lc_item',lineNum);
			var check = nlapiLookupField('item',item,'custitem_djkk_other_tax_targets');
			if(check=='F'){
				alert('‚»‚Ì‘¼‚ÌÅ‹à‘ÎÛƒtƒB[ƒ‹ƒh‚Íƒ`ƒFƒbƒNƒIƒ“‚µ‚È‚¢‚ÆA“ü—Í‚Å‚«‚Ü‚¹‚ñB');
				nlapiSetLineItemValue('custpage_sublist','custpage_djkk_other_taxes_act',lineNum,'');
				return false;
			}
		}
	
	//changed by geng add end U582
	
	//changed by wang add end CH310
	if (type == 'custpage_main_sublist' && name == 'custpage_djkk_main_premium'){
//	    alert(type)
//	    alert(name)
//	    alert(linenum)
	    var premium = 0;
	    var count=nlapiGetLineItemCount('custpage_main_sublist');
	    for(var i=1;i<count+1;i++){
	        var value = Number(nlapiGetLineItemValue('custpage_main_sublist','custpage_djkk_main_premium',i));//•ÛŒ¯—¿
//	        alert('line'+linenum+'•ÛŒ¯—¿'+value)
	        premium+=value
	    }
//	    alert('‘•ÛŒ¯—¿'+premium)
	    nlapiSetFieldValue('custrecord_djkk_landedcostamount6', premium, false, true);
	}
	
	//changed by geng add start U585
	if(name=='custpage_express'){
		var count=nlapiGetLineItemCount('custpage_sublist');
		var ceRate = nlapiGetFieldValue('custrecord_djkk_landedcost_ce_rate');//DJ_’ÊŠÖ—pˆ×‘ÖƒŒ[ƒg
		if(isEmpty(ceRate)){
			ceRate = 1;
		}
		for(var i=1;i<count+1;i++){
			var poRate=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_po_rate', i);
			var value = nlapiGetLineItemValue('custpage_sublist','custpage_express',i);//ŒvZ®
			var money = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_acount',i);//‹àŠz
			var air = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamount5_m',i);//AIR/SEA’²®Œã‹àŠz
			var insurer = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamount6_m',i);//•ÛŒ¯—¿’²®Œã‹àŠz
			var pack = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamountpack_m',i);//«•ï‘ã
			var exp = toPoint(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_exp',i));// —\’èŠÖÅ—¦
			var poNum = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_quantity',i);// ”—Ê
			var poItemMon = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_min_invun',i);// Å¬İŒÉ’PˆÊŠÖÅ
//			var moneyOne = ((Number(poRate)*Number(money))+Number(air)+Number(insurer)+Number(pack))*Number(exp);
			var moneyOne = ((Number(ceRate)*Number(money))+Number(air)+Number(insurer)+Number(pack))*Number(exp);
			var moneyTwo = Number(poNum)*Number(poItemMon);			
			if(value=='one'){
				nlapiSetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_rate',i,moneyOne);
			}else if(value=='two'){
				nlapiSetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_rate',i,moneyTwo);
			}else if(value=='three'){
				nlapiSetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_rate',i,moneyOne+moneyTwo);
			}else if(value==''){
				nlapiSetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_rate',i,'');
			}
		}
		
		
	}
	//changed by geng add end U585@0215‰¤‚æ‚è‚»‚Ì‘¼‚ÌÅ‹à‚ğ’Ç‰Á
	if(name=='custrecord_djkk_landedcostamount5'||name=='custrecord_djkk_landedcostamount6'||name=='custrecord_djkk_landedcostamount7'
		||name=='custrecord_djkk_landedcostamount13'||name=='custrecord_djkk_landedcostamount14'||name=='custrecord_djkk_landedcostamount15'||name=='custrecord_djkk_landedcostmethod5'
		||name=='custrecord_djkk_landedcostmethod7'||name=='custrecord_djkk_landedcostmethod13'||name=='custrecord_djkk_landedcostmethod14' ||name=='custrecord_djkk_landedcostmethod15' ||name == 'custrecord_djkk_baling_generation'){
		
		var arrivalLuggage = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');//“’…”Ô†  //20230706 add by zhou
		var subsidiaryHeader = nlapiLookupField('inboundshipment',arrivalLuggage,'custrecord_djkk_subsidiary_header');//‰ïĞ•Ê //20230706 add by zhou
		
		var lcWeightSum=0;
	    var lcQuantitySum=0;
		var lcAcountSum=0;
		var sublistType='custpage_sublist';
		
		var hdf5='custrecord_djkk_landedcostamount5';
		var per5='custpage_djkk_landedcostamount5_per';
		var lm5='custpage_djkk_landedcostamount5_m';
		var changem5='custpage_djkk_landedcostamount5_cha_m';
		
		var hdf6='custrecord_djkk_landedcostamount6';
		var per6='custpage_djkk_landedcostamount6_per';
		var lm6='custpage_djkk_landedcostamount6_m';
		var changem6='custpage_djkk_landedcostamount6_cha_m';
		
		var hdf7='custrecord_djkk_landedcostamount7';
		var per7='custpage_djkk_landedcostamount7_per';
		var lm7='custpage_djkk_landedcostamount7_m';
		var changem7='custpage_djkk_landedcostamount7_cha_m';
		
		var hdf13='custrecord_djkk_landedcostamount13';
		var per13='custpage_djkk_landedcostamount13_per';
		var lm13='custpage_djkk_landedcostamount13_m';
		var changem13='custpage_djkk_landedcostamount13_cha_m';
		
		var hdf14='custrecord_djkk_landedcostamount14';
		var per14='custpage_djkk_landedcostamount14_per';
		var lm14='custpage_djkk_landedcostamount14_m';
		var changem14='custpage_djkk_landedcostamount14_cha_m';

		//0215‰¤‚æ‚è‚»‚Ì‘¼‚ÌÅ‹à‚ğ’Ç‰Á 15‚ÍŠù‘¶‚ ‚é‚Ì‚Å151‚ğg‚¤
		var hdf151='custrecord_djkk_landedcostamount15';
		var per151='custpage_djkk_landedcostamount15_per';
		var lm151='custpage_djkk_landedcostamount15_m';
		if(subsidiaryHeader == SUB_SCETI || subsidiaryHeader == SUB_DPKK){
			var changem151='custpage_djkk_other_taxes_act';//20230706 changed by zhou CH603
		}else{
			var changem151='custpage_djkk_other_taxes_rate';//20230706 changed by zhou set ‚»‚Ì‘¼‚ÌÅ‹à’²®Œã‹àŠz => —\’è‚»‚Ì‘¼‚ÌÅ‹à 
		}
	
		
		//changed by geng add start U584
		var hdf15='custrecord_djkk_baling_generation';
		var per15='custpage_djkk_landedcostamountpack_per';
		var lm15='custpage_djkk_landedcostamountpack_m';
		var changem15='custpage_djkk_landedcostamountpack_cha_m';
		//changed by geng add end U584
		
		var splitType='';
		var splitSum='';
		var count=nlapiGetLineItemCount('custpage_sublist');
		for(var m=1;m<count+1;m++){			
			lcWeightSum+=Number(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_weight', m));
			lcQuantitySum+=Number(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_quantity', m));
			lcAcountSum+=Number(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_acount', m));
		}
		if(name=='custrecord_djkk_landedcostmethod5'||name=='custrecord_djkk_landedcostmethod7'
			||name=='custrecord_djkk_landedcostmethod13'||name=='custrecord_djkk_landedcostmethod14'||name=='custrecord_djkk_landedcostmethod15'||name=='custrecord_djkk_baling_method'){
			var landedcostmethod=nlapiGetFieldValue(name);
			if(isEmpty(landedcostmethod)){
					for(var i=1;i<count+1;i++){
						if(name=='custrecord_djkk_landedcostmethod5'){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_per', i, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m', i, '');
						}else if(name=='custrecord_djkk_landedcostmethod7'){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_per', i, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_cha_m', i, '');
						}else if(name=='custrecord_djkk_landedcostmethod13'){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_per', i, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_cha_m', i, '');
						}else if(name=='custrecord_djkk_landedcostmethod14'){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_per', i, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_cha_m', i, '');
						}else if(name=='custrecord_djkk_landedcostmethod15'){//0215‰¤‚æ‚è‚»‚Ì‘¼‚ÌÅ‹à‚ğ’Ç‰Á 15‚ÍŠù‘¶‚ ‚é‚Ì‚Å151‚ğg‚¤
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount15_per', i, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act', i, '');
					}else if(name=='custrecord_djkk_baling_method'){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_per', i, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m', i, '');
						}
					}			
			}else{
				// d—Ê					
				if(landedcostmethod=='1'){
				 splitType='custpage_djkk_weight';
				 splitSum=lcWeightSum;
												
				// ”—Ê
				}else if(landedcostmethod=='2'){
				 splitType='custpage_djkk_quantity';
				 splitSum=lcQuantitySum;
				// ’l
				}else if(landedcostmethod=='3'){
				 splitType='custpage_djkk_acount';
				 splitSum=lcAcountSum;
				}
				if(name=='custrecord_djkk_landedcostmethod5'){
				headerSplitChange(sublistType, hdf5, per5,lm5,changem5,splitType,splitSum,count);
				}else if(name=='custrecord_djkk_landedcostmethod7'){
				headerSplitChange(sublistType, hdf7, per7,lm7,changem7,splitType,splitSum,count);
				}else if(name=='custrecord_djkk_landedcostmethod13'){
				headerSplitChange(sublistType, hdf13, per13,lm13,changem13,splitType,splitSum,count);
				}else if(name=='custrecord_djkk_landedcostmethod14'){
				headerSplitChange(sublistType, hdf14, per14,lm14,changem14,splitType,splitSum,count);
				}else if(name=='custrecord_djkk_landedcostmethod15'){//0215‰¤‚æ‚è‚»‚Ì‘¼‚ÌÅ‹à‚ğ’Ç‰Á 15‚ÍŠù‘¶‚ ‚é‚Ì‚Å151‚ğg‚¤
//				headerSplitChange(sublistType, hdf151, per151,lm151,changem151,splitType,splitSum,count);
				headerSplitChangeOtherTax(sublistType, hdf151, per151,lm151,changem151,splitType,splitSum);
				}else if(name=='custrecord_djkk_baling_method'){
				headerSplitChange(sublistType, hdf14, per14,lm14,changem14,splitType,splitSum,count);
			}					
			}
			
		}
		
		if(name=='custrecord_djkk_landedcostamount5'){
			var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_landedcostmethod5');
			if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
				// d—Ê					
				if(landedcostmethod=='1'){
				 splitType='custpage_djkk_weight';
				 splitSum=lcWeightSum;
												
				// ”—Ê
				}else if(landedcostmethod=='2'){
				 splitType='custpage_djkk_quantity';
				 splitSum=lcQuantitySum;
				// ’l
				}else if(landedcostmethod=='3'){
				 splitType='custpage_djkk_acount';
				 splitSum=lcAcountSum;
				}
				headerSplitChange(sublistType, hdf5, per5,lm5,changem5,splitType,splitSum,count);
			}else{
				for(var is=1;is<count+1;is++){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_per', is, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m',is, '');
					}
			}		
		}
        if(name=='custrecord_djkk_landedcostamount6'){
        	if(!isEmpty(nlapiGetFieldValue(name))){
				headerSplitChange(sublistType, hdf6, per6,lm6,changem6,'custpage_djkk_acount',lcAcountSum,count);
			}else{
				for(var is=1;is<count+1;is++){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_per', is, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m',is, '');
					}
			}
		}
        
        //changed by geng add start U584
        if(name=='custrecord_djkk_baling_generation'){
//        	if(!isEmpty(nlapiGetFieldValue(name))){
//				headerSplitChange(sublistType, hdf15, per15,lm15,changem15,'custpage_djkk_acount',lcAcountSum,count);
//			}else{
//				for(var j=1;j<count+1;j++){
//					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_per', j, '');
//					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m',j, '');
//					}
//			}
        	
			var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_baling_method');
			if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
				// d—Ê					
				if(landedcostmethod=='1'){
				 splitType='custpage_djkk_weight';
				 splitSum=lcWeightSum;
												
				// ”—Ê
				}else if(landedcostmethod=='2'){
				 splitType='custpage_djkk_quantity';
				 splitSum=lcQuantitySum;
				// ’l
				}else if(landedcostmethod=='3'){
				 splitType='custpage_djkk_acount';
				 splitSum=lcAcountSum;
				}
				headerSplitChange(sublistType, hdf15, per15,lm15,changem15,splitType,splitSum,count);
			}else{
				for(var is=1;is<count+1;is++){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_per', is, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m',is, '');
					}
			}
		}
      //changed by geng add end U584
        
        if(name=='custrecord_djkk_landedcostamount7'){
        var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_landedcostmethod7');
         if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
			// d—Ê					
			if(landedcostmethod=='1'){
			 splitType='custpage_djkk_weight';
			 splitSum=lcWeightSum;
											
			// ”—Ê
			}else if(landedcostmethod=='2'){
			 splitType='custpage_djkk_quantity';
			 splitSum=lcQuantitySum;
			// ’l
			}else if(landedcostmethod=='3'){
			 splitType='custpage_djkk_acount';
			 splitSum=lcAcountSum;
			}
			headerSplitChange(sublistType, hdf7, per7,lm7,changem7,splitType,splitSum,count);
		  }else{
			for(var is=1;is<count+1;is++){
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_per',is, '');
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_cha_m',is, '');
				}
		}
        }
        
        if(name=='custrecord_djkk_landedcostamount13'){
        var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_landedcostmethod13');
            if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
   			// d—Ê					
   			if(landedcostmethod=='1'){
   			 splitType='custpage_djkk_weight';
   			 splitSum=lcWeightSum;
   											
   			// ”—Ê
   			}else if(landedcostmethod=='2'){
   			 splitType='custpage_djkk_quantity';
   			 splitSum=lcQuantitySum;
   			// ’l
   			}else if(landedcostmethod=='3'){
   			 splitType='custpage_djkk_acount';
   			 splitSum=lcAcountSum;
   			}
   			headerSplitChange(sublistType, hdf13, per13,lm13,changem13,splitType,splitSum,count);
   		  }else{
   			for(var is=1;is<count+1;is++){
   				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_per',is, '');
   				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_cha_m',is, '');
   				}
   		}
           }
        
        if(name=='custrecord_djkk_landedcostamount14'){
        	var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_landedcostmethod14');
            if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
   			// d—Ê					
   			if(landedcostmethod=='1'){
   			 splitType='custpage_djkk_weight';
   			 splitSum=lcWeightSum;
   											
   			// ”—Ê
   			}else if(landedcostmethod=='2'){
   			 splitType='custpage_djkk_quantity';
   			 splitSum=lcQuantitySum;
   			// ’l
   			}else if(landedcostmethod=='3'){
   			 splitType='custpage_djkk_acount';
   			 splitSum=lcAcountSum;
   			}
   			headerSplitChange(sublistType, hdf14, per14,lm14,changem14,splitType,splitSum,count);
   		  }else{
   			for(var is=1;is<count+1;is++){
   				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_per',is, '');
   				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_cha_m',is, '');
   				}
   		}
           }
      //0215‰¤‚æ‚è‚»‚Ì‘¼‚ÌÅ‹à‚ğ’Ç‰Á 15‚ÍŠù‘¶‚ ‚é‚Ì‚Å151‚ğg‚¤
        if(name=='custrecord_djkk_landedcostamount15'){
        	var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_landedcostmethod15');
        	if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
        		// d—Ê					
        		if(landedcostmethod=='1'){
        			splitType='custpage_djkk_weight';
        			splitSum=lcWeightSum;
        			
        			// ”—Ê
        		}else if(landedcostmethod=='2'){
        			splitType='custpage_djkk_quantity';
        			splitSum=lcQuantitySum;
        			// ’l
        		}else if(landedcostmethod=='3'){
        			splitType='custpage_djkk_acount';
        			splitSum=lcAcountSum;
        		}
//        		headerSplitChange(sublistType, hdf151, per151,lm151,changem151,splitType,splitSum,count);
        		headerSplitChangeOtherTax(sublistType, hdf151, per151,lm151,changem151,splitType,splitSum);
        	}else{
        		for(var is=1;is<count+1;is++){
        			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount151_per',is, '');
        			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount151_cha_m',is, '');
        		}
        	}
        }
	}
	
	// 02
	if(name=='custrecord_djkk_landedcostamount5'||name=='custrecord_djkk_landedcostamount6'||name=='custrecord_djkk_landedcostamount7'
		||name=='custrecord_djkk_landedcostamount13'||name=='custrecord_djkk_landedcostamount14'||name=='custrecord_djkk_landedcostamount15'||name=='custrecord_djkk_baling_method'){
		var per='';
		var lm='';
		var lcham='';
		var alerttxt='';
			
	// DJ_AIR/SEA‰^’À
	if(name=='custrecord_djkk_landedcostamount5'){
		 per='custpage_djkk_landedcostamount5_per';
		 lm='custpage_djkk_landedcostamount5_m';
		 lcham='custpage_djkk_landedcostamount5_cha_m';
		 alerttxt='AIR/SEA‰^’À';
	}
	
	// DJ_•ÛŒ¯—¿
	if(name=='custrecord_djkk_landedcostamount6'){
		 per='custpage_djkk_landedcostamount6_per';
		 lm='custpage_djkk_landedcostamount6_m';
		 lcham='custpage_djkk_landedcostamount6_cha_m';
		 alerttxt='•ÛŒ¯—¿';
	}
	
	// DJ_’ÊŠÖè”—¿
	if(name=='custrecord_djkk_landedcostamount7'){
		 per='custpage_djkk_landedcostamount7_per';
		 lm='custpage_djkk_landedcostamount7_m';
		 lcham='custpage_djkk_landedcostamount7_cha_m';
		 alerttxt='’ÊŠÖè”—¿';
	}
	
	// DJ_‚»‚Ì‘¼Œo”ï
	if(name=='custrecord_djkk_landedcostamount13'){
		 per='custpage_djkk_landedcostamount13_per';
		 lm='custpage_djkk_landedcostamount13_m';
		 lcham='custpage_djkk_landedcostamount13_cha_m';
		 alerttxt='‚»‚Ì‘¼Œo”ï';
	}
	
	// DJ_‘“à‰^’À
	if(name=='custrecord_djkk_landedcostamount14'){
		 per='custpage_djkk_landedcostamount14_per';
		 lm='custpage_djkk_landedcostamount14_m';
		 lcham='custpage_djkk_landedcostamount14_cha_m';
		 alerttxt='‘“à‰^’À';
	}
	// DJ_«•ï‘ã
	if(name=='custrecord_djkk_baling_generation'){
		 per='custpage_djkk_landedcostamountpack_per';
		 lm='custpage_djkk_landedcostamountpack_m';
		 lcham='custpage_djkk_landedcostamountpack_cha_m';
		 alerttxt='«•ï‘ã';
	}
	// 2023/02/15‰¤‚æ‚è‚»‚Ì‘¼‚ÌÅ‹à‚ğ’Ç‰Á
	if(name=='custrecord_djkk_landedcostamount15'){
		per='custpage_djkk_landedcostamount15_per';
		lm='custpage_djkk_landedcostamount15_m';
		lcham='custpage_djkk_other_taxes_act';
		alerttxt='‚»‚Ì‘¼‚ÌÅ‹à';
	}
	changeLcHeaderData(name,per,lm,lcham,alerttxt);
	}
	
	// 03
	if (type == 'custpage_sublist'
			&& (name == 'custpage_djkk_landedcostamount5_per'
			|| name == 'custpage_djkk_landedcostamount6_per'
			|| name == 'custpage_djkk_landedcostamount7_per'
			|| name == 'custpage_djkk_landedcostamount13_per'
			|| name == 'custpage_djkk_landedcostamount14_per'
			|| name == 'custpage_djkk_landedcostamount15_per'
				
			)) {
		
		var hid='';
		var lm='';
		var lcham='';
		var alerttxt='';
		// AIR/SEA‰^’ÀŠ„‡—¦
	if(name=='custpage_djkk_landedcostamount5_per'){
		
		 hid='custrecord_djkk_landedcostamount5';
		 lm='custpage_djkk_landedcostamount5_m';
		 lcham='custpage_djkk_landedcostamount5_cha_m';
		 alerttxt='AIR/SEA‰^’À';
		
	}
	
	// •ÛŒ¯—¿Š„‡—¦
    if(name=='custpage_djkk_landedcostamount6_per'){
    	 hid='custrecord_djkk_landedcostamount6';
		 lm='custpage_djkk_landedcostamount6_m';
		 lcham='custpage_djkk_landedcostamount6_cha_m';
		 alerttxt='•ÛŒ¯—¿';
	}
    
    // ’ÊŠÖè”—¿Š„‡—¦
    if(name=='custpage_djkk_landedcostamount7_per'){
    	 hid='custrecord_djkk_landedcostamount7';
		 lm='custpage_djkk_landedcostamount7_m';
		 lcham='custpage_djkk_landedcostamount7_cha_m';
		 alerttxt='’ÊŠÖè”—¿';
	}
    
    // ‚»‚Ì‘¼Œo”ïŠ„‡—¦
    if(name=='custpage_djkk_landedcostamount13_per'){
    	 hid='custrecord_djkk_landedcostamount13';
		 lm='custpage_djkk_landedcostamount13_m';
		 lcham='custpage_djkk_landedcostamount13_cha_m';
		 alerttxt='‚»‚Ì‘¼Œo”ï';
	}
    
    // ‘“à‰^’ÀŠ„‡—¦
    if(name=='custpage_djkk_landedcostamount14_per'){
    	 hid='custrecord_djkk_landedcostamount14';
		 lm='custpage_djkk_landedcostamount14_m';
		 lcham='custpage_djkk_landedcostamount14_cha_m';
		 alerttxt='‘“à‰^’À';
	}
    // «•ï‘ãŠ„‡—¦
    if(name=='custpage_djkk_landedcostamountpack_per'){
    	 hid='custrecord_djkk_baling_generation';
		 lm='custpage_djkk_landedcostamountpack_m';
		 lcham='custpage_djkk_landedcostamountpack_cha_m';
		 alerttxt='«•ï‘ã';
	}
    // 23/02/15‚»‚Ì‘¼‚ÌÅ‹à‚ğ’Ç‰Á
    if(name=='custpage_djkk_landedcostamount15_per'){
    	hid='custrecord_djkk_landedcostamount15';
    	lm='custpage_djkk_landedcostamount15_m';
    	lcham='custpage_djkk_other_taxes_act';
    	alerttxt='‚»‚Ì‘¼‚ÌÅ‹à';
    }
    changeLcLineData(type, name,linenum,hid,lm,lcham,alerttxt);
}
	

//		if (type == 'custpage_sublist'
//			&& (name == 'custpage_djkk_landedcostamount5_cha_m')
//			|| (name == 'custpage_djkk_landedcostamount6_cha_m')
//			|| (name == 'custpage_djkk_landedcostamount7_cha_m')) {
//
//		var hid = '';
//		var alerttxt = '';
//		// AIR/SEA‰^’À’²®Œã‹àŠz
//		if (name == 'custpage_djkk_landedcostamount5_cha_m') {
//
//			hid = 'custrecord_djkk_landedcostamount5';
//			alerttxt = 'AIR/SEA‰^’À';
//
//		}
//
//		// •ÛŒ¯—¿’²®Œã‹àŠz
//		if (name == 'custpage_djkk_landedcostamount6_cha_m') {
//			hid = 'custrecord_djkk_landedcostamount6';
//			alerttxt = '•ÛŒ¯—¿';
//		}
//
//		// ’ÊŠÖè”—¿’²®Œã‹àŠz
//		if (name == 'custpage_djkk_landedcostamount7_cha_m') {
//			hid = 'custrecord_djkk_landedcostamount7';
//			alerttxt = '’ÊŠÖè”—¿';
//		}
//		sumChangeMoney(type, name, linenum, hid, alerttxt);
//	}
     // ÀÛŠÖÅ‹àŠz
    if(type=='custpage_sublist'&&name=='custpage_djkk_customs_duty_act'){
    	var count=nlapiGetLineItemCount(type);
    	var dutyActAll=0;
    	for(var i=1;i<count+1;i++){
    		var changem=Number(nlapiGetLineItemValue(type, name, i));
    		dutyActAll+=changem;
    	  }
        nlapiSetFieldValue('custrecord_djkk_landedcostamount8', dutyActAll, false, true);
        var duty_rate=nlapiGetLineItemValue(type, 'custpage_djkk_customs_duty_rate', linenum);
        var duty_act=nlapiGetLineItemValue(type, name, linenum);
        nlapiSetLineItemValue(type, 'custpage_djkk_customs_duty_dif', linenum, Number(duty_act)-Number(duty_rate));
	}
    
    // ÀÛ‚»‚Ì‘¼‚ÌÅ‹à
    if(type=='custpage_sublist'&&name=='custpage_djkk_other_taxes_act'){
    	var count=nlapiGetLineItemCount(type);
    	var dutyActAll=0;
    	for(var i=1;i<count+1;i++){
    		var changem=Number(nlapiGetLineItemValue(type, name, i));
    		dutyActAll+=changem;
    	  }
//        nlapiSetFieldValue('custrecord_djkk_landedcostamount15', dutyActAll, false, true);
        var duty_rate=nlapiGetLineItemValue(type, 'custpage_djkk_other_taxes_rate', linenum);
        var duty_act=nlapiGetLineItemValue(type, name, linenum);
        nlapiSetLineItemValue(type, 'custpage_djkk_other_taxes_dif', linenum, Number(duty_act)-Number(duty_rate));
	}
    
    // ÀÛì‹Æ”ï
    if(type=='custpage_sublist'&&name=='custpage_djkk_work_cost_act'){
    	var count=nlapiGetLineItemCount(type);
    	var dutyActAll=0;
    	for(var i=1;i<count+1;i++){
    		var changem=Number(nlapiGetLineItemValue(type, name, i));
    		dutyActAll+=changem;
    	  }
        nlapiSetFieldValue('custrecord_djkk_landedcostamount16', dutyActAll, false, true);
        var duty_rate=nlapiGetLineItemValue(type, 'custpage_djkk_work_cost_rate', linenum);
        var duty_act=nlapiGetLineItemValue(type, name, linenum);
        nlapiSetLineItemValue(type, 'custpage_djkk_work_cost_dif', linenum, Number(duty_act)-Number(duty_rate));
	}
    
	document.getElementById("custpage_po_line_amount_sum").onclick();
}

/*
 ** 
 * —A“ü”Š|íœ
 * 
 * */
function deletelanedcost() {
	var RecordType=nlapiGetRecordType()
    var  RecordId=nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_client_deleterecord', 'customdeploy_djkk_sl_client_deleterecord');
    theLink += '&RecordType=' + RecordType;
    theLink += '&RecordId=' + RecordId;
    var rse = nlapiRequestURL(theLink);
    var flag = rse.getBody();
    if (flag == 'T') {
    alert('DJ_—A“ü”Š|‚ªíœ‚³‚ê‚Ü‚µ‚½');
	window.opener.location.reload();
	window.close();
	}else{
		alert(flag);
	}	
}

/*
 * “’…‰×•¨
 * 
 * */
function backTOlanedcost() {
	window.opener.location.reload();
	window.close();
}

/**
 * ’²®Œã‹àŠz
 */
function sumChangeMoney(type, lcham,linenum,hid,alerttxt){
	var count=nlapiGetLineItemCount(type);
	var changemAll=0;
	var landedcostamount=nlapiGetFieldValue(hid);
	if(!isEmpty(landedcostamount)){
	for(var i=1;i<count+1;i++){
		var changem=Number(nlapiGetLineItemValue(type, lcham, i));
		changemAll+=changem;
	  }
	if(changemAll>landedcostamount){
		alert(alerttxt+'‚Ì‡ŒvŠz‚ª DJ_'+alerttxt+'‚ğ’´‚¦‚Ä‚¢‚Ü‚·');
		nlapiSetLineItemValue(type, lcham, linenum, null);
	  }
	}
}

/**
 * line field change data change
 */
function changeLcLineData(type, name,linenum,hid,lm,lcham,alerttxt) {
	var count=nlapiGetLineItemCount(type);
	var amountPercentAll=0;
	var landedcostamount=nlapiGetFieldValue(hid);
	if(!isEmpty(landedcostamount)){
	for(var i=1;i<count+1;i++){
		var per=nlapiGetLineItemValue(type, name, i);
		if(isEmpty(per)){
			per='0';
		}
		amountPercentAll+=Number(per.split('%')[0]);
	}
	if(amountPercentAll>100){
		alert(alerttxt+'Š„‡—¦‚Ì‡Œv‚ª100%‚ğ’´‚¦‚é');
		nlapiSetLineItemValue(type, name, linenum, null);
	}else{
		var cxxi=nlapiGetLineItemValue(type, name, linenum);
		if(isEmpty(cxxi)){
			cxxi='0';
		}

		var lPercent=Number(cxxi.split('%')[0])/100;
		var changeAmount=Number(landedcostamount)*Number(lPercent.toFixed(2));
		changeAmount=(changeAmount.toString()== 'NaN') ? "" : Number(changeAmount.toFixed(2));
		nlapiSetLineItemValue(type, lm, linenum, Math.round(changeAmount));		
		//if(isEmpty(nlapiGetLineItemValue(type, lcham, linenum))){
		nlapiSetLineItemValue(type, lcham, linenum, Math.round(changeAmount));
		//}
	}
	}else{
//		alert('DJ_'+alerttxt+'‚ğ‹ó‚É‚·‚é‚±‚Æ‚Í‚Å‚«‚Ü‚¹‚ñ');
		nlapiSetLineItemValue(type, name, linenum, null);
	}
}

/**
 * header field change data change
 */
function changeLcHeaderData(hid,per,lm,lcham,alerttxt) {
	var type='custpage_sublist';
	var count=nlapiGetLineItemCount(type);
	var amountPercentAll=0;
	var landedcostamount=nlapiGetFieldValue(hid);
	if(!isEmpty(landedcostamount)){
		if(alerttxt == '•ÛŒ¯—¿'){
			for(var p=1;p<count+1;p++){
				
				if(p != count){
					var lpp='0';
					if(!isEmpty(nlapiGetLineItemValue(type, per, p))){
						lpp=nlapiGetLineItemValue(type, per, p);
					}		
					var lPercent=Number(lpp.split('%')[0])/100;
					var changeAmount=Number(landedcostamount)*Number(lPercent.toFixed(2));
					changeAmount=(changeAmount.toString()== 'NaN') ? "" : Number(changeAmount.toFixed(2));

					nlapiSetLineItemValue(type, lm, p, Math.round(Number(changeAmount).toFixed(2)));
					//if(isEmpty(nlapiGetLineItemValue(type, lcham, linenum))){
					nlapiSetLineItemValue(type, lcham, p, Math.round(Number(changeAmount).toFixed(2)));
					//}
				}else{
					var amountSum =0;;
					for(var k=1;k< count;k++){
						amountSum+=Number(nlapiGetLineItemValue(type, 'custpage_djkk_landedcostamount6_cha_m', k));
					}
					var changeAmount=Number(landedcostamount)- Number(amountSum);
					changeAmount=(changeAmount.toString()== 'NaN') ? "" : Number(changeAmount.toFixed(2));
					nlapiSetLineItemValue(type, lm, p, Math.round(Number(changeAmount).toFixed(2)));
					//if(isEmpty(nlapiGetLineItemValue(type, lcham, linenum))){
					nlapiSetLineItemValue(type, lcham, p, Math.round(Number(changeAmount).toFixed(2)));
				}
				
				
			}
		}
//		else{
//			for(var i=1;i<count+1;i++){
//				var lpp='0';
//				if(!isEmpty(nlapiGetLineItemValue(type, per, i))){
//					lpp=nlapiGetLineItemValue(type, per, i);
//				}		
//				var lPercent=Number(lpp.split('%')[0])/100;
//				var changeAmount=Number(landedcostamount)*Number(lPercent.toFixed(2));
//				changeAmount=(changeAmount.toString()== 'NaN') ? "" : Number(changeAmount.toFixed(2));
//
//				nlapiSetLineItemValue(type, lm, i, Math.round(changeAmount));
//				//if(isEmpty(nlapiGetLineItemValue(type, lcham, linenum))){
//				nlapiSetLineItemValue(type, lcham, i, Math.round(changeAmount));
//				//}
//			}
//		}
	}else{
//		alert('DJ_'+alerttxt+'‚ğ‹ó‚É‚·‚é‚±‚Æ‚Í‚Å‚«‚Ü‚¹‚ñ');
		for(var i=1;i<count+1;i++){
			nlapiSetLineItemValue(type, lm, i,'');
			nlapiSetLineItemValue(type, lcham, i, '');
		}
	}
}

function headerSplitChange(sublistType, hdf, per,lm,changem,splitType,splitSum,count) {
	var landedcostamount=nlapiGetFieldValue(hdf);
	if(!isEmpty(landedcostamount)){
		for(var i=1;i<count+1;i++){
			if(i!=count){
			var lPercent=(Number(nlapiGetLineItemValue(sublistType,splitType, i))/splitSum)*100;
			lPercent=(lPercent.toString()== 'NaN') ? "0" : Number(lPercent.toFixed(2));
			nlapiSetLineItemValue(sublistType,per, i,lPercent+'%');					
			var changeAmount=Number(landedcostamount)*Number(lPercent/100);
			changeAmount=(changeAmount.toString()== 'NaN') ? "" : changeAmount;
//			nlapiSetLineItemValue(sublistType, lm, i, Number(changeAmount.toFixed(2)));
			nlapiSetLineItemValue(sublistType, lm, i, Math.round(Number(changeAmount.toFixed(2))));
//			nlapiSetLineItemValue(sublistType, changem, i, Number(changeAmount.toFixed(2)));
			nlapiSetLineItemValue(sublistType, changem, i, Math.round(Number(changeAmount.toFixed(2))));
			}else{
				var persum=0;
				var amountSum=0;
				for(var j=1;j<count;j++){
					var linp='0';
					if(!isEmpty(nlapiGetLineItemValue(sublistType, per, j))){
						linp=nlapiGetLineItemValue(sublistType, per, j).split('%')[0];
					}
					persum+=Number(linp);
					amountSum+=Number(nlapiGetLineItemValue(sublistType, changem, j));
				}
				nlapiSetLineItemValue(sublistType,per, i,Number((100-Number(persum)).toFixed(2))+'%');
				nlapiSetLineItemValue(sublistType, lm, i, Math.round((Number(landedcostamount)-Number(amountSum)).toFixed(2)));
				nlapiSetLineItemValue(sublistType, changem, i,Math.round((Number(landedcostamount)-Number(amountSum)).toFixed(2)));
				
			}
		}
	}
}

function headerSplitChangeOtherTax(sublistType, hdf, per,lm,changem,splitType,splitSum) {
	var landedcostamount=nlapiGetFieldValue(hdf);
	
    if(!isEmpty(landedcostamount)){

        var count = nlapiGetLineItemCount('custpage_sublist');
        var itemArray=new Array();
        for(var lineNum=1;lineNum<count+1;lineNum++){
            var itemId = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_lc_item',lineNum);
            var itemQuantity = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_quantity',lineNum);//”—Ê
            var itemWeight = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_weight',lineNum);//d—Ê
            var itemAcount = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_acount',lineNum);//‹àŠz
            var check = nlapiLookupField('item',itemId,'custitem_djkk_other_tax_targets');
            if(check == 'T'){
                itemArray.push([ itemId, itemQuantity, itemWeight, itemAcount,lineNum ]);
            }
        }

        var itemQuantitySum = 0;
        var itemWeightSum = 0;
        var itemAcountSum = 0;
        for(var itemNum=0;itemNum<itemArray.length;itemNum++){
            var itemQuantityTemp = Number(itemArray[itemNum][1]);
            var itemWeightTemp = Number(itemArray[itemNum][2]);
            var itemAcountTemp = Number(itemArray[itemNum][3]);
            itemQuantitySum += itemQuantityTemp;
            itemWeightSum += itemWeightTemp;
            itemAcountSum += itemAcountTemp;
        }

        var splitSum = 0;
        if(splitType == 'custpage_djkk_weight'){
            splitSum = itemWeightSum;
        }else if(splitType == 'custpage_djkk_quantity'){
            splitSum = itemQuantitySum;
        }else if(splitType == 'custpage_djkk_acount'){
            splitSum = itemAcountSum;
        }



		for(var i=0;i<itemArray.length;i++){
//			alert('itemArray.length'+itemArray.length)
			if(i!=itemArray.length-1){
			var lPercent=(Number(nlapiGetLineItemValue(sublistType,splitType, itemArray[i][4]))/splitSum)*100;
//			alert(i+'-•Ï”1--'+(Number(nlapiGetLineItemValue(sublistType,splitType, itemArray[i][4]))))
//			alert(i+'-•Ï”2--'+splitSum)
//			
//			alert('lineNum'+itemArray[i][4])
			lPercent=(lPercent.toString()== 'NaN') ? "0" : Number(lPercent.toFixed(2));
			nlapiSetLineItemValue(sublistType,per, itemArray[i][4],lPercent+'%');					
			var changeAmount=Number(landedcostamount)*Number(lPercent/100);
			changeAmount=(changeAmount.toString()== 'NaN') ? "" : changeAmount;
			nlapiSetLineItemValue(sublistType, lm, itemArray[i][4], Math.round(Number(changeAmount.toFixed(2))));
			nlapiSetLineItemValue(sublistType, changem, itemArray[i][4], Math.round(Number(changeAmount.toFixed(2))));
			}
			else{
				var persum=0;
				var amountSum=0;
				for(var j=1;j<itemArray.length;j++){
					var linp='0';
					if(!isEmpty(nlapiGetLineItemValue(sublistType, per, j))){
						linp=nlapiGetLineItemValue(sublistType, per, j).split('%')[0];
					}
					persum+=Number(linp);
					amountSum+=Number(nlapiGetLineItemValue(sublistType, changem, j));
				}
				nlapiSetLineItemValue(sublistType,per, itemArray[i][4],Number((100-Number(persum)).toFixed(2))+'%');
				nlapiSetLineItemValue(sublistType, lm, itemArray[i][4], Math.round((Number(landedcostamount)-Number(amountSum)).toFixed(2)));
				nlapiSetLineItemValue(sublistType, changem, itemArray[i][4],Math.round((Number(landedcostamount)-Number(amountSum)).toFixed(2)));
				
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