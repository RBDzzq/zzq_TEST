/**
 * DJ_前受金PLUGIN
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/11/30     CPC_苑
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
	            var entity;//名前
	            var memo;//メモ
	            var location;//倉庫
	            var totalamount = 0;//元帳元金額
	            var department = 0;//部署
	            var strClass = 0;//クラス
	            for (var i = 0; i < standardLines.getCount(); i++) {//元帳明細
	            	//元帳明細
	                var currLineCredit = standardLines.getLine(i);
	                var creditAmount = currLineCredit.getCreditAmount();
	                var debitAmount =currLineCredit.getDebitAmount();
	                entity = currLineCredit.getEntityId();//名前
                    memo = currLineCredit.getMemo();//メモ
                    location = currLineCredit.getLocationId();//倉庫
                    department = currLineCredit.getDepartmentId();
                    strClass = currLineCredit.getClassId();	
                    if(transactionRecord.getFieldValue('custbody_djkk_trans_appr_status')!=2){
	                if (creditAmount > 0) {
	                	if (!isEmpty(currLineCredit.getAccountId())) {
	                        creditAccountId = currLineCredit.getAccountId();//勘定科目
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
 * 貸方を追加
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
 * 借方を追加
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