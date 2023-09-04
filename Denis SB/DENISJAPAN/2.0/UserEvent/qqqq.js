function close_remaining(id, trantype) {
    document.location = '/app/accounting/transactions/vendauthmanager.nl?type=closeremaining&trantype=' + trantype + '&id=' + id;
}
function cancel_approve_order(id, optype) {
    document.location = '/app/accounting/transactions/vendauthmanager.nl?type=' + optype + '&id=' + id + '&whence=';
}
function Syncsearchidrecmachcustbody_suitel10n_jp_ids_rec(fieldspec, linenum, onlySlaveSelect, mach, addlparams, callbacks) {
}
function Listsearchidrecmachcustbody_suitel10n_jp_ids_rec(fld, multi, addlparams) {
    var displayField = getFormElementViaFormName('recmachcustbody_suitel10n_jp_ids_rec_main_form', 'searchid');
    if (displayField != null) {
        if (typeof (displayField.isvalid) == 'undefined') {
            displayField.isvalid = true;
        }
        if (!displayField.isvalid) {
            displayField.isvalid = true;
            NS.form.setValid(true);
            displayField.value = '';
        }
    }
    NLPopupSelect_displayLoadingDiv('recmachcustbody_suitel10n_jp_ids_rec_searchid', false);
    var valueField = getFormElementViaFormName('recmachcustbody_suitel10n_jp_ids_rec_main_form', 'searchid');
    var serverUrl = '/app/accounting/transactions/vendauth.nl?nexus=1&warnnexuschange=F&at=T&cf=124&q=searchid&id=' + trim(getFormElementViaFormName('main_form', 'id').value) + '&l=T&t=recmachcustbody_suitel10n_jp_ids_rec_main:searchid&machine=recmachcustbody_suitel10n_jp_ids_rec' + (multi ? '&multi=T' : '') + '' + (addlparams ? '&' + addlparams : '') + '';
    document.getElementById('server_commands').src = serverUrl;
}
function SyncTransaction_BILLINGSTATUS(fieldspec, linenum, onlySlaveSelect, mach, addlparams, callbacks) {
}

var cancelReturnObj = document.getElementById("cancelreturn");
if (cancelReturnObj) {
    cancelReturnObj.click();
}