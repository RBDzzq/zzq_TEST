/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Jun 2023     ZZQ
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String} type Operation types: create, edit, delete, xedit approve, reject, cancel (SO, ER, Time Bill, PO & RMA only) pack, ship
 * (IF) markcomplete (Call, Task) reassign (Case) editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {
    try {
        nlapiLogExecution('debug', 'start', type);
        if (type != 'delete') {
            var loadRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
            nlapiLogExecution('debug', 'loadRecord', loadRecord);
            var count = loadRecord.getLineItemCount('item');
            var sub = loadRecord.getFieldValue('subsidiary');
            nlapiLogExecution('debug', 'count', count);
            if (sub == SUB_NBKK || sub == SUB_ULKK) {
                for (var i = 1; i < count + 1; i++) {
                    loadRecord.selectLineItem('item', i);
                    price = setlinepriceFromCust(loadRecord,loadRecord.getCurrentLineItemValue('item', 'quantity'), loadRecord.getCurrentLineItemValue('item', 'item'));
                    nlapiLogExecution('debug', 'price', price);
                    if (!isEmpty(price)) {
                        loadRecord.setCurrentLineItemValue('item', 'custcol_djkk_original_price', price);
                    } else {
                        loadRecord.setCurrentLineItemValue('item', 'custcol_djkk_original_price', '');
                    }
                    loadRecord.commitLineItem('item');
                }
            }
            nlapiSubmitRecord(loadRecord, false, true);
        }
    } catch (e) {
        nlapiLogExecution('error', 'error', e);
    }
}
// 食品価格表取得
function setlinepriceFromCust(loadRecord,itemNum, itemId) {
    // console.log(nlapiGetRecordType())
    var cust = loadRecord.getFieldValue('entity');
    var delivery = loadRecord.getFieldValue('custbody_djkk_delivery_destination');
    var currency = loadRecord.getFieldValue('currency');
    // console.log('cust'+' '+cust)

    var fi = new Array();
    fi.push(["custrecord_djkk_pl_price_currency_fd", "anyof", nlapiGetFieldValue('currency')]);
    fi.push("AND");
    fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pl_startdate_fd", "onorbefore", nlapiGetFieldValue('trandate')]);
    fi.push("AND");
    fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pl_enddate_calculationfd", "onorafter", nlapiGetFieldValue('trandate')]);
    fi.push("AND");
    fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pldt_itemcode_fd", "anyof", itemId]);

    var _priceId = null;
    // 食品場合納品先の価格表コード取得不要
    // if(!isEmpty(delivery)){
    // _priceId = nlapiLookupField('customrecord_djkk_delivery_destination', delivery, 'custrecord_djkk_price_code_fd')
    // }
    if (!isEmpty(cust) && isEmpty(_priceId)) {
        _priceId = nlapiLookupField('customer', cust, 'custentity_djkk_pl_code_fd');
    }

    if (!isEmpty(_priceId)) {
        fi.push("AND");
        fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pldt_pl_fd", "anyof", _priceId]);
    } else {
        return null;
    }

    var customrecord_djkk_price_listSearch = nlapiSearchRecord("customrecord_djkk_price_list_fd", null, [fi], [new nlobjSearchColumn("custrecord_djkk_pldt_cod_price_fd", "CUSTRECORD_DJKK_PLDT_PL_FD", null), new nlobjSearchColumn("custrecord_djkk_pldt_quantity_fd", "CUSTRECORD_DJKK_PLDT_PL_FD", null).setSort(true), new nlobjSearchColumn("custrecord_djkk_pl_enddate_fd", "CUSTRECORD_DJKK_PLDT_PL_FD", null),
            new nlobjSearchColumn("custrecord_djkk_pldt_saleprice_fd", "CUSTRECORD_DJKK_PLDT_PL_FD", null)

    ]);

    if (!isEmpty(customrecord_djkk_price_listSearch)) {

        for (var i = 0; i < customrecord_djkk_price_listSearch.length; i++) {
            if (!isEmpty(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity_fd", "CUSTRECORD_DJKK_PLDT_PL_FD"))) {
                if (Number(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity_fd", "CUSTRECORD_DJKK_PLDT_PL_FD")) <= Number(itemNum)) {
                    return customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_cod_price_fd", "CUSTRECORD_DJKK_PLDT_PL_FD");
                }
            }
        }

        return customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice_fd", "CUSTRECORD_DJKK_PLDT_PL_FD")

    } else {
        return null;
    }

}