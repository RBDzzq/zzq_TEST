/**
 * DJ_輸入諸掛のClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/17     CPC_苑
 *
 */
/**
 *PO配賦
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
 * PO明細配賦
 */
function poLineAllocation(){
	setTableNone('custpage_main_sublist_layer');
	setTableInline('custpage_sublist_layer');
	
}

/**
 * 総金額1再計算
 * 総金額1(予定関税金額)=(POLINEの金額*DJ_通関用為替レート＋AIR/SEA運賃＋保険料)*予定関税率
 */
function getAmount1(){
	// DJ_通関用為替レート
	var ceRate=nlapiGetFieldValue('custrecord_djkk_landedcost_ce_rate');
	if(isEmpty(ceRate)){
		ceRate = 1;
	}
	var arrivalLuggage = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');//到着番号
	var subsidiaryHeader = nlapiLookupField('inboundshipment',arrivalLuggage,'custrecord_djkk_subsidiary_header');//会社別
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
				value = nlapiGetLineItemValue('custpage_sublist','custpage_express',i);//計算式
			}
			var poNum=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_quantity', i))){
			    poNum = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_quantity',i);// 数量
			}
			var poItemMon=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_min_invun', i))){
				poItemMon = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_min_invun',i);// 最小在庫単位関税
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
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', i,amount1);//20230706 changed by zhou CH603 小数を表示しないはずです
			}else{
				var amount2=Math.round(Number(poNum)*Number(poItemMon)*costWeight);
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', i,Math.round(amount1));//20230706 changed by zhou CH603 小数を表示しないはずです
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
	var arrivalLuggage = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');//到着番号  //20230706 add by zhou
	var subsidiaryHeader = nlapiLookupField('inboundshipment',arrivalLuggage,'custrecord_djkk_subsidiary_header');//会社別 //20230706 add by zhou
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
			var money = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_acount',i);//金額
			var air = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamount5_m',i);//AIR/SEA調整後金額
			var itemId = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_lc_item',i);//アイテム内部ID
			var express = nlapiGetLineItemValue('custpage_sublist','custpage_express',i);//関税金額計算式
			if(isEmpty(air)){
				air=0;
			}
			var insurer = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamount6_m',i);//保険料調整後金額
			if(isEmpty(insurer)){
				insurer=0;
			}
			var pack = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamountpack_m',i);//梱包代
			if(isEmpty(pack)){
				pack=0;
			}
			var exp = toPoint(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_exp',i));// 予定関税率
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
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', i, Math.round(amount));//20230706 changed by zhou CH603 小数を表示しないはずです	
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
			alert('為替は円の場合は1を入力ください。');
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
	var landedcostamount15=nlapiGetFieldValue('custrecord_djkk_landedcostamount15');//0215王よりその他の手数料追加
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
		var percentAll15=0;//0215王よりその他の手数料追加
		var percentAll15Temp=0;//0215王よりその他の手数料追加
		var changeMoney5=0;
		var changeMoney6=0;
		var changeMoney7=0;
		var changeMoney13=0;
		var changeMoney14=0;
		var changeMoney15=0;//0215王よりその他の手数料追加
		//changed by geng add start
		var percentBal = 0;
		var percentBalTemp=0;
		var changeMoneyBal = 0
		
		//changed by geng add end 
		for (var i = 1; i < count + 1; i++) {
			if(isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_act',i))){
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_act', i, nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_rate',i));
			}
			//sublistにそのほかの税金へ値設定はいらないです。
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

			//0215王よりその他の手数料追加
			var Percent15 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount15_per',i);
			if(isEmpty(Percent15)){Percent15='0';}
			percentAll15Temp=Number(Percent15.split('%')[0])+Number(percentAll15);
			percentAll15 = percentAll15Temp.toFixed(2); 
			changeMoney15+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act',i));
			
			
		}
		//changed by geng add start
		if(percentBal!='100.00'&&percentBal!='0'&&!isEmpty(landedcostamountbal)&&landedcostamountbal!=0){
			alert('PO明細配賦の梱包代割合率の合計は100%ではありません');
//			return false;
		}
		//changed by geng add end
		if(percentAll5!='100.00'&&percentAll5!='0'&&!isEmpty(landedcostamount5)&&landedcostamount5!=0){
//			alert(percentAll5)
//			alert(landedcostamount5)
			alert('PO明細配賦のAIR/SEA運賃割合率の合計は100%ではありません');
//			return false;
		}
		if(percentAll6!='100.00'&&percentAll6!='0'&&!isEmpty(landedcostamount6)&&landedcostamount6!=0){
			alert('PO明細配賦の保険料割合率の合計は100%ではありません');
//			return false;
		}
		if(percentAll7!='100.00'&&percentAll7!='0'&&!isEmpty(landedcostamount7)&&landedcostamount7!=0){
			alert('PO明細配賦の通関手数料割合率の合計は100%ではありません');
//			return false;
		}
		if(percentAll13!='100.00'&&percentAll13!='0'&&!isEmpty(landedcostamount13)&&landedcostamount13!=0){
			alert('PO明細配賦のその他経費割合率の合計は100%ではありません');
//			return false;
		}
		if(percentAll14!='100.00'&&percentAll14!='0'&&!isEmpty(landedcostamount14)&&landedcostamount14!=0){
			alert('PO明細配賦の国内運賃割合率の合計は100%ではありません');
//			return false;
		}
		//0215王よりその他の手数料追加
		if(percentAll15!='100.00'&&percentAll15!='0'&&!isEmpty(landedcostamount15)&&landedcostamount15!=0){
			alert('PO明細配賦のその他の税金の合計は100%ではありません');
//			return false;
		}
		
		if(changeMoney5!=landedcostamount5){
		alert('PO明細配賦のAIR/SEA運賃調整後金額の合計額とDJ_AIR/SEA運賃はあっていないです');
		return false;
	}
	if(changeMoney6!=landedcostamount6){
		alert('PO明細配賦の保険料調整後金額の合計額とDJ_保険料はあっていないです');
		return false;
	}
	if(changeMoney7!=landedcostamount7){
		alert('PO明細配賦の通関手数料調整後金額の合計額とDJ_通関手数料はあっていないです');
		return false;
	}
	if(changeMoney13!=landedcostamount13){
		alert('PO明細配賦のその他経費調整後金額の合計額とDJ_その他経費はあっていないです');
		return false;
	}
	if(changeMoney14!=landedcostamount14){
		alert('PO明細配賦の国内運賃調整後金額の合計額とDJ_国内運賃はあっていないです');
		return false;
	}
	if(changeMoney15!=landedcostamount15){
//		alert('changeMoney15='+changeMoney15)
//		alert('landedcostamount15='+landedcostamount15)
		alert('PO明細配賦その他の税金の合計額とDJその他の税金はあっていないです');
		return false;
	}
	if(changeMoneyBal!=landedcostamountbal){
//		alert('changeMoneyBal='+changeMoneyBal)
//		alert('landedcostamountbal='+landedcostamountbal)
		alert('PO明細配賦梱包代の合計額とDJ梱包代はあっていないです');
		return false;
	}
		
//		if(changeMoney5!=landedcostamount5){
//			alert('PO明細配賦のAIR/SEA運賃調整後金額の合計額がDJ_AIR/SEA運賃を超えています');
//			return false;
//		}
//		if(changeMoney6!=landedcostamount6){
//			alert('PO明細配賦の保険料調整後金額の合計額がDJ_保険料を超えています');
//			return false;
//		}
//		if(changeMoney7!=landedcostamount7){
//			alert('PO明細配賦の通関手数料調整後金額の合計額がDJ_通関手数料を超えています');
//			return false;
//		}
//		if(changeMoney13!=landedcostamount13){
//			alert('PO明細配賦のその他経費調整後金額の合計額がDJ_その他経費を超えています');
//			return false;
//		}
//		if(changeMoney14!=landedcostamount14){
//			alert('PO明細配賦の国内運賃調整後金額の合計額がDJ_国内運賃を超えています');
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
				alert('その他の税金対象フィールドはチェックオンしないと、入力できません。');
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
	        var value = Number(nlapiGetLineItemValue('custpage_main_sublist','custpage_djkk_main_premium',i));//保険料
//	        alert('line'+linenum+'保険料'+value)
	        premium+=value
	    }
//	    alert('総保険料'+premium)
	    nlapiSetFieldValue('custrecord_djkk_landedcostamount6', premium, false, true);
	}
	
	//changed by geng add start U585
	if(name=='custpage_express'){
		var count=nlapiGetLineItemCount('custpage_sublist');
		var ceRate = nlapiGetFieldValue('custrecord_djkk_landedcost_ce_rate');//DJ_通関用為替レート
		if(isEmpty(ceRate)){
			ceRate = 1;
		}
		for(var i=1;i<count+1;i++){
			var poRate=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_po_rate', i);
			var value = nlapiGetLineItemValue('custpage_sublist','custpage_express',i);//計算式
			var money = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_acount',i);//金額
			var air = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamount5_m',i);//AIR/SEA調整後金額
			var insurer = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamount6_m',i);//保険料調整後金額
			var pack = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_landedcostamountpack_m',i);//梱包代
			var exp = toPoint(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_exp',i));// 予定関税率
			var poNum = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_quantity',i);// 数量
			var poItemMon = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_customs_duty_min_invun',i);// 最小在庫単位関税
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
	//changed by geng add end U585　0215王よりその他の税金を追加
	if(name=='custrecord_djkk_landedcostamount5'||name=='custrecord_djkk_landedcostamount6'||name=='custrecord_djkk_landedcostamount7'
		||name=='custrecord_djkk_landedcostamount13'||name=='custrecord_djkk_landedcostamount14'||name=='custrecord_djkk_landedcostamount15'||name=='custrecord_djkk_landedcostmethod5'
		||name=='custrecord_djkk_landedcostmethod7'||name=='custrecord_djkk_landedcostmethod13'||name=='custrecord_djkk_landedcostmethod14' ||name=='custrecord_djkk_landedcostmethod15' ||name == 'custrecord_djkk_baling_generation'){
		
		var arrivalLuggage = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');//到着番号  //20230706 add by zhou
		var subsidiaryHeader = nlapiLookupField('inboundshipment',arrivalLuggage,'custrecord_djkk_subsidiary_header');//会社別 //20230706 add by zhou
		
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

		//0215王よりその他の税金を追加 15は既存あるので151を使う
		var hdf151='custrecord_djkk_landedcostamount15';
		var per151='custpage_djkk_landedcostamount15_per';
		var lm151='custpage_djkk_landedcostamount15_m';
		if(subsidiaryHeader == SUB_SCETI || subsidiaryHeader == SUB_DPKK){
			var changem151='custpage_djkk_other_taxes_act';//20230706 changed by zhou CH603
		}else{
			var changem151='custpage_djkk_other_taxes_rate';//20230706 changed by zhou set その他の税金調整後金額 => 予定その他の税金 
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
						}else if(name=='custrecord_djkk_landedcostmethod15'){//0215王よりその他の税金を追加 15は既存あるので151を使う
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount15_per', i, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act', i, '');
					}else if(name=='custrecord_djkk_baling_method'){
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_per', i, '');
					nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m', i, '');
						}
					}			
			}else{
				// 重量					
				if(landedcostmethod=='1'){
				 splitType='custpage_djkk_weight';
				 splitSum=lcWeightSum;
												
				// 数量
				}else if(landedcostmethod=='2'){
				 splitType='custpage_djkk_quantity';
				 splitSum=lcQuantitySum;
				// 値
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
				}else if(name=='custrecord_djkk_landedcostmethod15'){//0215王よりその他の税金を追加 15は既存あるので151を使う
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
				// 重量					
				if(landedcostmethod=='1'){
				 splitType='custpage_djkk_weight';
				 splitSum=lcWeightSum;
												
				// 数量
				}else if(landedcostmethod=='2'){
				 splitType='custpage_djkk_quantity';
				 splitSum=lcQuantitySum;
				// 値
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
				// 重量					
				if(landedcostmethod=='1'){
				 splitType='custpage_djkk_weight';
				 splitSum=lcWeightSum;
												
				// 数量
				}else if(landedcostmethod=='2'){
				 splitType='custpage_djkk_quantity';
				 splitSum=lcQuantitySum;
				// 値
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
			// 重量					
			if(landedcostmethod=='1'){
			 splitType='custpage_djkk_weight';
			 splitSum=lcWeightSum;
											
			// 数量
			}else if(landedcostmethod=='2'){
			 splitType='custpage_djkk_quantity';
			 splitSum=lcQuantitySum;
			// 値
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
   			// 重量					
   			if(landedcostmethod=='1'){
   			 splitType='custpage_djkk_weight';
   			 splitSum=lcWeightSum;
   											
   			// 数量
   			}else if(landedcostmethod=='2'){
   			 splitType='custpage_djkk_quantity';
   			 splitSum=lcQuantitySum;
   			// 値
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
   			// 重量					
   			if(landedcostmethod=='1'){
   			 splitType='custpage_djkk_weight';
   			 splitSum=lcWeightSum;
   											
   			// 数量
   			}else if(landedcostmethod=='2'){
   			 splitType='custpage_djkk_quantity';
   			 splitSum=lcQuantitySum;
   			// 値
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
      //0215王よりその他の税金を追加 15は既存あるので151を使う
        if(name=='custrecord_djkk_landedcostamount15'){
        	var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_landedcostmethod15');
        	if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
        		// 重量					
        		if(landedcostmethod=='1'){
        			splitType='custpage_djkk_weight';
        			splitSum=lcWeightSum;
        			
        			// 数量
        		}else if(landedcostmethod=='2'){
        			splitType='custpage_djkk_quantity';
        			splitSum=lcQuantitySum;
        			// 値
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
			
	// DJ_AIR/SEA運賃
	if(name=='custrecord_djkk_landedcostamount5'){
		 per='custpage_djkk_landedcostamount5_per';
		 lm='custpage_djkk_landedcostamount5_m';
		 lcham='custpage_djkk_landedcostamount5_cha_m';
		 alerttxt='AIR/SEA運賃';
	}
	
	// DJ_保険料
	if(name=='custrecord_djkk_landedcostamount6'){
		 per='custpage_djkk_landedcostamount6_per';
		 lm='custpage_djkk_landedcostamount6_m';
		 lcham='custpage_djkk_landedcostamount6_cha_m';
		 alerttxt='保険料';
	}
	
	// DJ_通関手数料
	if(name=='custrecord_djkk_landedcostamount7'){
		 per='custpage_djkk_landedcostamount7_per';
		 lm='custpage_djkk_landedcostamount7_m';
		 lcham='custpage_djkk_landedcostamount7_cha_m';
		 alerttxt='通関手数料';
	}
	
	// DJ_その他経費
	if(name=='custrecord_djkk_landedcostamount13'){
		 per='custpage_djkk_landedcostamount13_per';
		 lm='custpage_djkk_landedcostamount13_m';
		 lcham='custpage_djkk_landedcostamount13_cha_m';
		 alerttxt='その他経費';
	}
	
	// DJ_国内運賃
	if(name=='custrecord_djkk_landedcostamount14'){
		 per='custpage_djkk_landedcostamount14_per';
		 lm='custpage_djkk_landedcostamount14_m';
		 lcham='custpage_djkk_landedcostamount14_cha_m';
		 alerttxt='国内運賃';
	}
	// DJ_梱包代
	if(name=='custrecord_djkk_baling_generation'){
		 per='custpage_djkk_landedcostamountpack_per';
		 lm='custpage_djkk_landedcostamountpack_m';
		 lcham='custpage_djkk_landedcostamountpack_cha_m';
		 alerttxt='梱包代';
	}
	// 2023/02/15王よりその他の税金を追加
	if(name=='custrecord_djkk_landedcostamount15'){
		per='custpage_djkk_landedcostamount15_per';
		lm='custpage_djkk_landedcostamount15_m';
		lcham='custpage_djkk_other_taxes_act';
		alerttxt='その他の税金';
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
		// AIR/SEA運賃割合率
	if(name=='custpage_djkk_landedcostamount5_per'){
		
		 hid='custrecord_djkk_landedcostamount5';
		 lm='custpage_djkk_landedcostamount5_m';
		 lcham='custpage_djkk_landedcostamount5_cha_m';
		 alerttxt='AIR/SEA運賃';
		
	}
	
	// 保険料割合率
    if(name=='custpage_djkk_landedcostamount6_per'){
    	 hid='custrecord_djkk_landedcostamount6';
		 lm='custpage_djkk_landedcostamount6_m';
		 lcham='custpage_djkk_landedcostamount6_cha_m';
		 alerttxt='保険料';
	}
    
    // 通関手数料割合率
    if(name=='custpage_djkk_landedcostamount7_per'){
    	 hid='custrecord_djkk_landedcostamount7';
		 lm='custpage_djkk_landedcostamount7_m';
		 lcham='custpage_djkk_landedcostamount7_cha_m';
		 alerttxt='通関手数料';
	}
    
    // その他経費割合率
    if(name=='custpage_djkk_landedcostamount13_per'){
    	 hid='custrecord_djkk_landedcostamount13';
		 lm='custpage_djkk_landedcostamount13_m';
		 lcham='custpage_djkk_landedcostamount13_cha_m';
		 alerttxt='その他経費';
	}
    
    // 国内運賃割合率
    if(name=='custpage_djkk_landedcostamount14_per'){
    	 hid='custrecord_djkk_landedcostamount14';
		 lm='custpage_djkk_landedcostamount14_m';
		 lcham='custpage_djkk_landedcostamount14_cha_m';
		 alerttxt='国内運賃';
	}
    // 梱包代割合率
    if(name=='custpage_djkk_landedcostamountpack_per'){
    	 hid='custrecord_djkk_baling_generation';
		 lm='custpage_djkk_landedcostamountpack_m';
		 lcham='custpage_djkk_landedcostamountpack_cha_m';
		 alerttxt='梱包代';
	}
    // 23/02/15その他の税金を追加
    if(name=='custpage_djkk_landedcostamount15_per'){
    	hid='custrecord_djkk_landedcostamount15';
    	lm='custpage_djkk_landedcostamount15_m';
    	lcham='custpage_djkk_other_taxes_act';
    	alerttxt='その他の税金';
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
//		// AIR/SEA運賃調整後金額
//		if (name == 'custpage_djkk_landedcostamount5_cha_m') {
//
//			hid = 'custrecord_djkk_landedcostamount5';
//			alerttxt = 'AIR/SEA運賃';
//
//		}
//
//		// 保険料調整後金額
//		if (name == 'custpage_djkk_landedcostamount6_cha_m') {
//			hid = 'custrecord_djkk_landedcostamount6';
//			alerttxt = '保険料';
//		}
//
//		// 通関手数料調整後金額
//		if (name == 'custpage_djkk_landedcostamount7_cha_m') {
//			hid = 'custrecord_djkk_landedcostamount7';
//			alerttxt = '通関手数料';
//		}
//		sumChangeMoney(type, name, linenum, hid, alerttxt);
//	}
     // 実際関税金額
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
    
    // 実際その他の税金
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
    
    // 実際作業費
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
 * 輸入諸掛削除
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
    alert('DJ_輸入諸掛が削除されました');
	window.opener.location.reload();
	window.close();
	}else{
		alert(flag);
	}	
}

/*
 * 到着荷物
 * 
 * */
function backTOlanedcost() {
	window.opener.location.reload();
	window.close();
}

/**
 * 調整後金額
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
		alert(alerttxt+'の合計額が DJ_'+alerttxt+'を超えています');
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
		alert(alerttxt+'割合率の合計が100%を超える');
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
//		alert('DJ_'+alerttxt+'を空にすることはできません');
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
		if(alerttxt == '保険料'){
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
//		alert('DJ_'+alerttxt+'を空にすることはできません');
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
            var itemQuantity = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_quantity',lineNum);//数量
            var itemWeight = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_weight',lineNum);//重量
            var itemAcount = nlapiGetLineItemValue('custpage_sublist','custpage_djkk_acount',lineNum);//金額
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
//			alert(i+'-変数1--'+(Number(nlapiGetLineItemValue(sublistType,splitType, itemArray[i][4]))))
//			alert(i+'-変数2--'+splitSum)
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