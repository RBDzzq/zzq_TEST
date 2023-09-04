/**
 * 為替レート換�?
 *
 * @param transactionRecord 画面レコー�?
 * @param standardLines Netsuite標準レコー�?
 * @param customLines カスタマイズレコー�?
 * @param book ブック
 */
function customizeGlImpact(transactionRecord, standardLines, customLines, book) {

    try {
        var currentRecord = transactionRecord;

        var recType = currentRecord.getRecordType();
        nlapiLogExecution('DEBUG', 'recType', recType);

        if (recType != 'customerpayment') {
            return;
        }
        // DJ_予�?為替レー�?_選�?
        var rateFlg = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_flg');
        var rateId1;
        var rateId2;
        var rateId3;
        // if (recType == 'vendorpayment') {
        //
        //     // DJ_予�?為替レー�?_購入
        //     rateId = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_p1');
        // } else
        if (recType == 'customerpayment') {

            // DJ_予�?為替レー�?_販売
            rateId1 = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_s1');
            rateId2 = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_s2');
            rateId3 = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_s3');
        } else {
            return;
        }
        if (rateFlg && rateId1) {

            // DJ_予�?為替レー�?_残�?
            var usedBalance1 = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_ba1');
            nlapiLogExecution('DEBUG', 'get usedBalance1',usedBalance1);
            if (usedBalance1) {
                usedBalance1 = isNaN(parseFloat(usedBalance1))? 0 : parseFloat(usedBalance1);
            } else {
                usedBalance1 = 0;
            }
            nlapiLogExecution('DEBUG', 'usedBalance1',usedBalance1);
            if (usedBalance1 == 0) {
                return;
            }

            // DJ_予�?為替レー�?_残�?
            var usedBalance2 = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_ba2');
            nlapiLogExecution('DEBUG', 'get usedBalance2',usedBalance2);
            if (usedBalance2) {
                usedBalance2 = isNaN(parseFloat(usedBalance2))? 0 : parseFloat(usedBalance2);
            } else {
                usedBalance2 = 0;
            }
            nlapiLogExecution('DEBUG', 'usedBalance2',usedBalance2);
            if (usedBalance2 == 0) {
                return;
            }

            // DJ_予�?為替レー�?_残�?
            var usedBalance3 = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_ba3');
            nlapiLogExecution('DEBUG', 'get usedBalance3',usedBalance3);
            if (usedBalance3) {
                usedBalance3 = isNaN(parseFloat(usedBalance3))? 0 : parseFloat(usedBalance3);
            } else {
                usedBalance3 = 0;
            }
            nlapiLogExecution('DEBUG', 'usedBalance3',usedBalance3);
            if (new Number(usedBalance1) + new Number(usedBalance2) + new Number(usedBalance3) == 0) {
                return;
            }

            // レコード�?�DJ_予�?為替レート�??
            var rateObj1 = nlapiLoadRecord('customrecord_djkk_reserved_exchange_rate',rateId1);
            // DJ_予�?為替レー�?
            var rate1 = rateObj1.getFieldValue('custrecord_djkk_reserved_exchange_rate');
            nlapiLogExecution('DEBUG', 'rate1',rate1);
            if (!rate1 || isNaN(parseFloat(rate1))) {
                nlapiLogExecution('ERROR', 'DJ_予�?為替レート�?�数値ではな�?', 'rate1 is ' + rate1);
                return;
            }

            if (rateId2) {
                var rateObj2 = nlapiLoadRecord('customrecord_djkk_reserved_exchange_rate',rateId2);
                // DJ_予�?為替レー�?
                var rate2 = rateObj2.getFieldValue('custrecord_djkk_reserved_exchange_rate');
                nlapiLogExecution('DEBUG', 'rate1',rate2);
                if (!rate2 || isNaN(parseFloat(rate2))) {
                    nlapiLogExecution('ERROR', 'DJ_予�?為替レート�?�数値ではな�?', 'rate2 is ' + rate2);
                    return;
                }
            }

            if (rateId3) {
                var rateObj3 = nlapiLoadRecord('customrecord_djkk_reserved_exchange_rate',rateId3);
                // DJ_予�?為替レー�?
                var rate3 = rateObj3.getFieldValue('custrecord_djkk_reserved_exchange_rate');
                nlapiLogExecution('DEBUG', 'rate1',rate3);
                if (!rate3 || isNaN(parseFloat(rate3))) {
                    nlapiLogExecution('ERROR', 'DJ_予�?為替レート�?�数値ではな�?', 'rate3 is ' + rate3);
                    return;
                }
            }

            // DJ_勘定科目
            var acc = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_acc');
            nlapiLogExecution('DEBUG', 'acc',acc);

            // DJ_�?建
            var yenAmount = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_yen');

            nlapiLogExecution('DEBUG', 'yenAmount',yenAmount);

            // 為替レー�?
            var defaultRate = currentRecord.getFieldValue('exchangerate');
            nlapiLogExecution('DEBUG', 'defaultRate',defaultRate);


            // 全部「支払�??
            var totalAmount = 0;


            totalAmount = currentRecord.getFieldValue('payment');

            nlapiLogExecution('DEBUG', 'totalAmount',totalAmount);



            var defaultAmount = defaultRate * totalAmount;
            nlapiLogExecution('DEBUG', 'defaultAmount',defaultAmount);

            var exchangeAmount1 = 0;
            var exchangeAmount2 = 0;
            var exchangeAmount3 = 0;

            if (usedBalance1 > 0) {

                exchangeAmount1 = rate1 * usedBalance1;
                nlapiLogExecution('DEBUG', 'exchangeAmount1',exchangeAmount1);
            }

            if (usedBalance2 > 0) {

                exchangeAmount2 = rate2 * usedBalance2;
                nlapiLogExecution('DEBUG', 'exchangeAmount2',exchangeAmount2);
            }

            if (usedBalance3 > 0) {

                exchangeAmount3 = rate3 * usedBalance3;
                nlapiLogExecution('DEBUG', 'exchangeAmount3',exchangeAmount3);
            }

            var exchangeAmount = exchangeAmount1 + exchangeAmount2 + exchangeAmount3;

            var diffAmount1 = exchangeAmount - defaultAmount;
            nlapiLogExecution('DEBUG', 'diffAmount1',diffAmount1);

            var creditAmount = standardLines.getLine(0).getCreditAmount();
            var creditAccountId;
            var debitAccountId;
            if (creditAmount) {
                creditAccountId = standardLines.getLine(0).getAccountId();
                debitAccountId = standardLines.getLine(1).getAccountId();
            } else {
                creditAccountId = standardLines.getLine(1).getAccountId();
                debitAccountId = standardLines.getLine(0).getAccountId();
            }
            nlapiLogExecution('DEBUG', 'reserved_exchange_rate','1');

            // 貸方
            var newLineC1 = customLines.addNewLine();
            newLineC1.setCreditAmount(Math.abs(diffAmount1));
            newLineC1.setAccountId(creditAccountId);

            // 借方
            var newLineD1 = customLines.addNewLine();
            newLineD1.setDebitAmount(Math.abs(diffAmount1));
            newLineD1.setAccountId(debitAccountId);
            nlapiLogExecution('DEBUG', 'reserved_exchange_rate','2');

            // 貸方
            var newLineC2 = customLines.addNewLine();
            newLineC2.setCreditAmount(Math.abs(diffAmount1));
            newLineC2.setAccountId(debitAccountId);

            // 借方
            var newLineD2 = customLines.addNewLine();
            newLineD2.setDebitAmount(Math.abs(diffAmount1));
            newLineD2.setAccountId(parseInt(acc));

            nlapiLogExecution('DEBUG', 'reserved_exchange_rate','3');

            if (yenAmount && !isNaN(parseFloat(yenAmount))) {

                var diffAmount2 = exchangeAmount - yenAmount;
                nlapiLogExecution('DEBUG', 'diffAmount2',diffAmount2);
                // 貸方
                var newLineC3 = customLines.addNewLine();
                newLineC3.setCreditAmount(Math.abs(diffAmount2));
                newLineC3.setAccountId(creditAccountId);

                // 借方
                var newLineD3 = customLines.addNewLine();
                newLineD3.setDebitAmount(Math.abs(diffAmount2));
                newLineD3.setAccountId(parseInt(acc));
            }
            nlapiLogExecution('DEBUG', 'reserved_exchange_rate','finished');


            // DJ_外貨支払データ作�??
            var dataCreateFlg = currentRecord.getFieldValue('custbody_dj_reserved_exchange_rate_f');
            nlapiLogExecution('DEBUG', 'dataCreateFlg',dataCreateFlg);

            // // 転�?
            // if (!dataCreateFlg) {
            //
            //     newJournalRecord.setValue({
            //         fieldId: 'approvalstatus',
            //         value: '2' // 転記�?�承�?
            //     });
            // }

        }


    } catch (e) {
        nlapiLogExecution('ERROR', e.name, e.message);
        nlapiLogExecution('ERROR', e.name, e.stack);
    }


}
