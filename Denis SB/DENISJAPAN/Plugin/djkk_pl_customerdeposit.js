/**
 * DJ_�O���PLUGIN
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/11/30     CPC_��
 *
 */

/*
 * 
 * */
function customizeGlImpact(transactionRecord, standardLines, customLines, book) {

    try {
    	 if (isEmpty(standardLines)) {
    	        return;
    	    }
            var recType = transactionRecord.getRecordType();
        	nlapiLogExecution('DEBUG', 'recType', recType);

	        if (recType == 'customerdeposit') {
	            var creditAccountId;//credit account
	            var debitAccountId;//debit account
	            var entity;//���O
	            var memo;//����
	            var location;//�q��
	            var totalamount = 0;//���������z
	            var department = 0;//����
	            var strClass = 0;//�N���X
	            for (var i = 0; i < standardLines.getCount(); i++) {//��������
	            	//��������
	                var currLineCredit = standardLines.getLine(i);
	                var creditAmount = currLineCredit.getCreditAmount();
	                var debitAmount =currLineCredit.getDebitAmount();
	                entity = currLineCredit.getEntityId();//���O
                    memo = currLineCredit.getMemo();//����
                    location = currLineCredit.getLocationId();//�q��
                    department = currLineCredit.getDepartmentId();
                    strClass = currLineCredit.getClassId();	
                    if(transactionRecord.getFieldValue('custbody_djkk_trans_appr_status')!=2){
	                if (creditAmount > 0) {
	                	if (!isEmpty(currLineCredit.getAccountId())) {
	                        creditAccountId = currLineCredit.getAccountId();//����Ȗ�
                            addDebitGlLine(customLines, creditAmount, creditAccountId, entity, memo, location, department, strClass);
	                	}             
	                } else {
	                	if (!isEmpty(currLineCredit.getAccountId())) {
	                    	debitAccountId = currLineCredit.getAccountId();
	                    	addCreditGlLine(customLines, debitAmount, debitAccountId, entity, memo, location, department, strClass);
	                	}
	                }  
                 }
                 }
	        }
    } catch (e) {
        nlapiLogExecution('ERROR', e.name, e.message);
    }
}

/**
 * �ݕ���ǉ�
 * 
 * @param customLines
 * @param creditAmount
 * @param creditAccountId
 */
function addCreditGlLine(customLines, creditAmount, creditAccountId, entity, memo, location, department, strClass) {
    var newLine = customLines.addNewLine();
    newLine.setCreditAmount(creditAmount);
    newLine.setAccountId(creditAccountId);
    newLine.setEntityId(entity);
    newLine.setMemo(memo);
    newLine.setLocationId(location);
    newLine.setDepartmentId(department);
    newLine.setClassId(strClass);
    nlapiLogExecution('DEBUG', 'addReverseGlLine');
}

/**
 * �ؕ���ǉ�
 * 
 * @param customLines
 * @param debitAmount
 * @param creditAccountId
 */
function addDebitGlLine(customLines, debitAmount, creditAccountId, entity, memo, location, department, strClass) {
    var newLine = customLines.addNewLine();
    newLine.setDebitAmount(debitAmount);
    newLine.setAccountId(creditAccountId);
    newLine.setEntityId(entity);
    newLine.setMemo(memo);
    newLine.setLocationId(location);
    newLine.setDepartmentId(department);
    newLine.setClassId(strClass);

    nlapiLogExecution('DEBUG', 'addNewGlLine');
}