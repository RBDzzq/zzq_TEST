/**
 * DJ_�A�����|��Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/17     CPC_��
 *
 */

/**
 *PO�z��
 */



function poAllocation(){
	setTableNone('custpage_sublist_layer');
	setTableInline('custpage_main_sublist_layer');
}

/**
 * PO���הz��
 */
function poLineAllocation(){
	setTableNone('custpage_main_sublist_layer');
	setTableInline('custpage_sublist_layer');
	
}

/**
 * �����z1�Čv�Z
 * �����z1(�\��֐ŋ��z)=(POLINE�̋��z*DJ_�ʊ֗p�בփ��[�g�{AIR/SEA�^���{�ی���)*�\��֐ŗ�
 */
function getAmount1(){
	
	// DJ_�ʊ֗p�בփ��[�g
	var ceRate=nlapiGetFieldValue('custrecord_djkk_landedcost_ce_rate');
	var flg=nlapiGetFieldValue('custpage_flag');
	if(!isEmpty(ceRate)){
		var lineCounts=nlapiGetLineItemCount('custpage_sublist');
		for(var i=1;i<lineCounts+1;i++){
			var amount1='';
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
			amount1=(Number(polineAmount)*Number(ceRate)+Number(airsea)+Number(safe))*Number(duty_exp);
			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', i,amount1);
			

			var duty_rate_hi=0;
			var duty_rate_lo=0;
			var sun_amount_1=amount1;
			var sun_amount_2=0;
			if(!isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_2', i))){
			sun_amount_2=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_2', i);
			}
			if(Number(sun_amount_1)>=Number(sun_amount_2)){
				duty_rate_hi=sun_amount_1;
				duty_rate_lo=sun_amount_2;
			}else{
				duty_rate_hi=sun_amount_2;
				duty_rate_lo=sun_amount_1;
			}
			if(flg=='hi'){
			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_rate', i,duty_rate_hi);
			}else if(flg=='lo'){
			nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_rate', i,duty_rate_lo);
			}
		
		}
	}
}

function clientPageInit(type){
	if(type!='view'){
	setButtunButtonDisable('tbl_customize');
	setButtunButtonDisable('tbl_secondarycustomize');
	if(type=='edit'){
	setButtunButtonDisable('spn_ACTIONMENU_d1');
	setButtunButtonDisable('spn_secondaryACTIONMENU_d1');
	setButtunButtonDisable('tdbody_changeid');
	setButtunButtonDisable('tdbody_secondarychangeid');
	}
	setTableHidden('main_mh');
	setTableNone('custpage_sublist_layer');
	//setTableNone('custpage_main_sublist_layer');
	}
}

function clientSaveRecord() {
	//var landedcostmethod = nlapiGetFieldValue('custrecord_djkk_landedcost_pop');
	var count = nlapiGetLineItemCount('custpage_sublist');
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
		var changeMoney5=0;
		var changeMoney6=0;
		var changeMoney7=0;
		var changeMoney13=0;
		var changeMoney14=0;
		for (var i = 1; i < count + 1; i++) {
			if(isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_act',i))){
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_act', i, nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_rate',i));
			}
			if(isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act',i))){
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act', i, nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_rate',i));
			}
			if(isEmpty(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_work_cost_act',i))){
				nlapiSetLineItemValue('custpage_sublist', 'custpage_djkk_work_cost_act', i, nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_work_cost_rate',i));
			}
			var Percent5 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_per',i);
			if(isEmpty(Percent5)){Percent5='0';}
			percentAll5+=Number(Percent5.split('%')[0]);
			changeMoney5+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m',i));
			
			var Percent6 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_per',i);
			if(isEmpty(Percent6)){Percent6='0';}
			percentAll6+=Number(Percent6.split('%')[0]);
			changeMoney6+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m',i));
			
            var Percent7 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_per',i);
            if(isEmpty(Percent7)){Percent7='0';}
			percentAll7+=Number(Percent7.split('%')[0]);
			changeMoney7+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_cha_m',i));
			
			var Percent13 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_per',i);
            if(isEmpty(Percent13)){Percent13='0';}
			percentAll13+=Number(Percent13.split('%')[0]);
			changeMoney13+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_cha_m',i));
			
			var Percent14 = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_per',i);
            if(isEmpty(Percent14)){Percent14='0';}
			percentAll14+=Number(Percent14.split('%')[0]);
			changeMoney14+=Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_cha_m',i));

		}
		if(percentAll5!='100'&&percentAll5!='0'&&!isEmpty(landedcostamount5)&&landedcostamount5!=0){
			alert('PO���הz����AIR/SEA�^���������̍��v��100%�ł͂���܂���');
			return false;
		}
		if(percentAll6!='100'&&percentAll6!='0'&&!isEmpty(landedcostamount6)&&landedcostamount6!=0){
			alert('PO���הz���̕ی����������̍��v��100%�ł͂���܂���');
			return false;
		}
		if(percentAll7!='100'&&percentAll7!='0'&&!isEmpty(landedcostamount7)&&landedcostamount7!=0){
			alert('PO���הz���̒ʊ֎萔���������̍��v��100%�ł͂���܂���');
			return false;
		}
		if(percentAll13!='100'&&percentAll13!='0'&&!isEmpty(landedcostamount13)&&landedcostamount13!=0){
			alert('PO���הz���̂��̑��o������̍��v��100%�ł͂���܂���');
			return false;
		}
		if(percentAll14!='100'&&percentAll14!='0'&&!isEmpty(landedcostamount14)&&landedcostamount14!=0){
			alert('PO���הz���̍����^���������̍��v��100%�ł͂���܂���');
			return false;
		}
//		if(changeMoney5!=landedcostamount5){
//			alert('PO���הz����AIR/SEA�^����������z�̍��v�z��DJ_AIR/SEA�^���𒴂��Ă��܂�');
//			return false;
//		}
//		if(changeMoney6!=landedcostamount6){
//			alert('PO���הz���̕ی�����������z�̍��v�z��DJ_�ی����𒴂��Ă��܂�');
//			return false;
//		}
//		if(changeMoney7!=landedcostamount7){
//			alert('PO���הz���̒ʊ֎萔����������z�̍��v�z��DJ_�ʊ֎萔���𒴂��Ă��܂�');
//			return false;
//		}
//		if(changeMoney13!=landedcostamount13){
//			alert('PO���הz���̂��̑��o�������z�̍��v�z��DJ_���̑��o��𒴂��Ă��܂�');
//			return false;
//		}
//		if(changeMoney14!=landedcostamount14){
//			alert('PO���הz���̍����^����������z�̍��v�z��DJ_�����^���𒴂��Ă��܂�');
//			return false;
//		}
//		
	return true;
}

function clientFieldChanged(type, name, linenum) {
	if(name=='custrecord_djkk_landedcostamount5'||name=='custrecord_djkk_landedcostamount6'||name=='custrecord_djkk_landedcostamount7'
		||name=='custrecord_djkk_landedcostamount13'||name=='custrecord_djkk_landedcostamount14'||name=='custrecord_djkk_landedcostmethod5'
		||name=='custrecord_djkk_landedcostmethod7'||name=='custrecord_djkk_landedcostmethod13'||name=='custrecord_djkk_landedcostmethod14'){
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
	
		var splitType='';
		var splitSum='';
		var count=nlapiGetLineItemCount('custpage_sublist');
		for(var m=1;m<count+1;m++){			
			lcWeightSum+=Number(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_weight', m));
			lcQuantitySum+=Number(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_quantity', m));
			lcAcountSum+=Number(nlapiGetLineItemValue('custpage_sublist','custpage_djkk_acount', m));
		}
		if(name=='custrecord_djkk_landedcostmethod5'||name=='custrecord_djkk_landedcostmethod7'
			||name=='custrecord_djkk_landedcostmethod13'||name=='custrecord_djkk_landedcostmethod14'){
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
						}
					}			
			}else{
				// �d��					
				if(landedcostmethod=='1'){
				 splitType='custpage_djkk_weight';
				 splitSum=lcWeightSum;
												
				// ����
				}else if(landedcostmethod=='2'){
				 splitType='custpage_djkk_quantity';
				 splitSum=lcQuantitySum;
				// �l
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
				}			
			}
			
		}
		
		if(name=='custrecord_djkk_landedcostamount5'){
			var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_landedcostmethod5');
			if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
				// �d��					
				if(landedcostmethod=='1'){
				 splitType='custpage_djkk_weight';
				 splitSum=lcWeightSum;
												
				// ����
				}else if(landedcostmethod=='2'){
				 splitType='custpage_djkk_quantity';
				 splitSum=lcQuantitySum;
				// �l
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
        if(name=='custrecord_djkk_landedcostamount7'){
        var landedcostmethod=nlapiGetFieldValue('custrecord_djkk_landedcostmethod7');
         if(!isEmpty(nlapiGetFieldValue(name))&&!isEmpty(landedcostmethod)){
			// �d��					
			if(landedcostmethod=='1'){
			 splitType='custpage_djkk_weight';
			 splitSum=lcWeightSum;
											
			// ����
			}else if(landedcostmethod=='2'){
			 splitType='custpage_djkk_quantity';
			 splitSum=lcQuantitySum;
			// �l
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
   			// �d��					
   			if(landedcostmethod=='1'){
   			 splitType='custpage_djkk_weight';
   			 splitSum=lcWeightSum;
   											
   			// ����
   			}else if(landedcostmethod=='2'){
   			 splitType='custpage_djkk_quantity';
   			 splitSum=lcQuantitySum;
   			// �l
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
   			// �d��					
   			if(landedcostmethod=='1'){
   			 splitType='custpage_djkk_weight';
   			 splitSum=lcWeightSum;
   											
   			// ����
   			}else if(landedcostmethod=='2'){
   			 splitType='custpage_djkk_quantity';
   			 splitSum=lcQuantitySum;
   			// �l
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
	}
	
	// 02
	if(name=='custrecord_djkk_landedcostamount5'||name=='custrecord_djkk_landedcostamount6'||name=='custrecord_djkk_landedcostamount7'
		||name=='custrecord_djkk_landedcostamount13'||name=='custrecord_djkk_landedcostamount14'){
		var per='';
		var lm='';
		var lcham='';
		var alerttxt='';
			
	// DJ_AIR/SEA�^��
	if(name=='custrecord_djkk_landedcostamount5'){
		 per='custpage_djkk_landedcostamount5_per';
		 lm='custpage_djkk_landedcostamount5_m';
		 lcham='custpage_djkk_landedcostamount5_cha_m';
		 alerttxt='AIR/SEA�^��';
	}
	
	// DJ_�ی���
	if(name=='custrecord_djkk_landedcostamount6'){
		 per='custpage_djkk_landedcostamount6_per';
		 lm='custpage_djkk_landedcostamount6_m';
		 lcham='custpage_djkk_landedcostamount6_cha_m';
		 alerttxt='�ی���';
	}
	
	// DJ_�ʊ֎萔��
	if(name=='custrecord_djkk_landedcostamount7'){
		 per='custpage_djkk_landedcostamount7_per';
		 lm='custpage_djkk_landedcostamount7_m';
		 lcham='custpage_djkk_landedcostamount7_cha_m';
		 alerttxt='�ʊ֎萔��';
	}
	
	// DJ_���̑��o��
	if(name=='custrecord_djkk_landedcostamount13'){
		 per='custpage_djkk_landedcostamount13_per';
		 lm='custpage_djkk_landedcostamount13_m';
		 lcham='custpage_djkk_landedcostamount13_cha_m';
		 alerttxt='���̑��o��';
	}
	
	// DJ_�����^��
	if(name=='custrecord_djkk_landedcostamount14'){
		 per='custpage_djkk_landedcostamount14_per';
		 lm='custpage_djkk_landedcostamount14_m';
		 lcham='custpage_djkk_landedcostamount14_cha_m';
		 alerttxt='�����^��';
	}
	changeLcHeaderData(name,per,lm,lcham,alerttxt);
	}
	
	// 03
	if (type == 'custpage_sublist'
			&& (name == 'custpage_djkk_landedcostamount5_per'
			|| name == 'custpage_djkk_landedcostamount6_per'
			|| name == 'custpage_djkk_landedcostamount7_per'
			|| name == 'custpage_djkk_landedcostamount13_per'
			|| name == 'custpage_djkk_landedcostamount14_per')) {
		
		var hid='';
		var lm='';
		var lcham='';
		var alerttxt='';
		// AIR/SEA�^��������
	if(name=='custpage_djkk_landedcostamount5_per'){
		
		 hid='custrecord_djkk_landedcostamount5';
		 lm='custpage_djkk_landedcostamount5_m';
		 lcham='custpage_djkk_landedcostamount5_cha_m';
		 alerttxt='AIR/SEA�^��';
		
	}
	
	// �ی���������
    if(name=='custpage_djkk_landedcostamount6_per'){
    	 hid='custrecord_djkk_landedcostamount6';
		 lm='custpage_djkk_landedcostamount6_m';
		 lcham='custpage_djkk_landedcostamount6_cha_m';
		 alerttxt='�ی���';
	}
    
    // �ʊ֎萔��������
    if(name=='custpage_djkk_landedcostamount7_per'){
    	 hid='custrecord_djkk_landedcostamount7';
		 lm='custpage_djkk_landedcostamount7_m';
		 lcham='custpage_djkk_landedcostamount7_cha_m';
		 alerttxt='�ʊ֎萔��';
	}
    
    // ���̑��o�����
    if(name=='custpage_djkk_landedcostamount13_per'){
    	 hid='custrecord_djkk_landedcostamount13';
		 lm='custpage_djkk_landedcostamount13_m';
		 lcham='custpage_djkk_landedcostamount13_cha_m';
		 alerttxt='���̑��o��';
	}
    
    // �����^��������
    if(name=='custpage_djkk_landedcostamount14_per'){
    	 hid='custrecord_djkk_landedcostamount14';
		 lm='custpage_djkk_landedcostamount14_m';
		 lcham='custpage_djkk_landedcostamount14_cha_m';
		 alerttxt='�����^��';
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
//		// AIR/SEA�^����������z
//		if (name == 'custpage_djkk_landedcostamount5_cha_m') {
//
//			hid = 'custrecord_djkk_landedcostamount5';
//			alerttxt = 'AIR/SEA�^��';
//
//		}
//
//		// �ی�����������z
//		if (name == 'custpage_djkk_landedcostamount6_cha_m') {
//			hid = 'custrecord_djkk_landedcostamount6';
//			alerttxt = '�ی���';
//		}
//
//		// �ʊ֎萔����������z
//		if (name == 'custpage_djkk_landedcostamount7_cha_m') {
//			hid = 'custrecord_djkk_landedcostamount7';
//			alerttxt = '�ʊ֎萔��';
//		}
//		sumChangeMoney(type, name, linenum, hid, alerttxt);
//	}
     // ���ۊ֐ŋ��z
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
    
    // ���ۂ��̑��̐ŋ�
    if(type=='custpage_sublist'&&name=='custpage_djkk_other_taxes_act'){
    	var count=nlapiGetLineItemCount(type);
    	var dutyActAll=0;
    	for(var i=1;i<count+1;i++){
    		var changem=Number(nlapiGetLineItemValue(type, name, i));
    		dutyActAll+=changem;
    	  }
        nlapiSetFieldValue('custrecord_djkk_landedcostamount15', dutyActAll, false, true);
        var duty_rate=nlapiGetLineItemValue(type, 'custpage_djkk_other_taxes_rate', linenum);
        var duty_act=nlapiGetLineItemValue(type, name, linenum);
        nlapiSetLineItemValue(type, 'custpage_djkk_other_taxes_dif', linenum, Number(duty_act)-Number(duty_rate));
	}
    
    // ���ۍ�Ɣ�
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
 * �A�����|�폜
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
    alert('DJ_�A�����|���폜����܂���');
	window.opener.location.reload();
	window.close();
	}else{
		alert(flag);
	}	
}

/*
 * �����ו�
 * 
 * */
function backTOlanedcost() {
	
	window.opener.location.reload();
	window.close();
}

/**
 * ��������z
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
		alert(alerttxt+'�̍��v�z�� DJ_'+alerttxt+'�𒴂��Ă��܂�');
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
		alert(alerttxt+'�������̍��v��100%�𒴂���');
		nlapiSetLineItemValue(type, name, linenum, null);
	}else{
		var cxxi=nlapiGetLineItemValue(type, name, linenum);
		if(isEmpty(cxxi)){
			cxxi='0';
		}
		var lPercent=Number(cxxi.split('%')[0])/100;
		var changeAmount=Number(landedcostamount)*Number(lPercent.toFixed(2));
		changeAmount=(changeAmount.toString()== 'NaN') ? "" : Number(changeAmount.toFixed(2));
		nlapiSetLineItemValue(type, lm, linenum, changeAmount);		
		//if(isEmpty(nlapiGetLineItemValue(type, lcham, linenum))){
		nlapiSetLineItemValue(type, lcham, linenum, changeAmount);
		//}
	}
	}else{
		alert('DJ_'+alerttxt+'����ɂ��邱�Ƃ͂ł��܂���');
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
		for(var i=1;i<count+1;i++){
			var lpp='0';
			if(!isEmpty(nlapiGetLineItemValue(type, per, i))){
				lpp=nlapiGetLineItemValue(type, per, i);
			}		
		var lPercent=Number(lpp.split('%')[0])/100;
		var changeAmount=Number(landedcostamount)*Number(lPercent.toFixed(2));
		changeAmount=(changeAmount.toString()== 'NaN') ? "" : Number(changeAmount.toFixed(2));
		nlapiSetLineItemValue(type, lm, i, changeAmount);
		//if(isEmpty(nlapiGetLineItemValue(type, lcham, linenum))){
		nlapiSetLineItemValue(type, lcham, i, changeAmount);
		//}
		}
	}else{
		alert('DJ_'+alerttxt+'����ɂ��邱�Ƃ͂ł��܂���');
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
			nlapiSetLineItemValue(sublistType, lm, i, Number(changeAmount.toFixed(2)));
			nlapiSetLineItemValue(sublistType, changem, i, Number(changeAmount.toFixed(2)));
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
				nlapiSetLineItemValue(sublistType, lm, i, (Number(landedcostamount)-Number(amountSum)).toFixed(2));
				nlapiSetLineItemValue(sublistType, changem, i,(Number(landedcostamount)-Number(amountSum)).toFixed(2));
				
			}
		}
	}
	}