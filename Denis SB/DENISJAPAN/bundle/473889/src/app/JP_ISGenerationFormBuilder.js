/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget'],
    (serverWidget) => {

    function JP_ISGenerationFormBuilder(){
        this.name = 'JP_ISGenerationFormBuilder.js';
    }


    JP_ISGenerationFormBuilder.prototype.buildForm = function(formComponents){
    	let form = serverWidget.createForm({
            title: formComponents.formTitle
        });

    	if (formComponents.fieldSets) addFieldSets(form, formComponents.fieldSets);
    	if (formComponents.buttons) addButtons(form, formComponents.buttons);
    	if (formComponents.submitButton) addSubmitButton(form, formComponents.submitButton);
    	if (formComponents.sublists) addSublists(form, formComponents.sublists);
    	if (formComponents.clientScript) setScript(form, formComponents.clientScript);

    	return form;
    };

    function addFieldSets(form, fieldSets) {
    	for (let i = 0; i < fieldSets.length; i++) {
            let set = fieldSets[i];
            let fieldGroup = set.fieldGroup;
            let fields = set.fields;

    		form.addFieldGroup(fieldGroup);
    		addFields(form, fields);
    	}
    }

    function addFields(form, fields){
    	for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            let f = form.addField(field);
    		if (field.help) f.setHelpText({help: field.help});
    		if (field.isMandatory) f.isMandatory = field.isMandatory;
    		if (field.displayType) f.updateDisplayType({displayType : field.displayType});
    		if (field.options) addFieldOptions(f, field.options);
    		if (field.defaultValue) f.defaultValue = field.defaultValue;
    		if (field.layoutType) f.updateLayoutType({layoutType : field.layoutType});
    		if (field.breakType) f.updateBreakType({breakType : field.breakType});
    	}
    }

    function addSubmitButton(form, submitButton) {
        form.addSubmitButton(submitButton);
    }

    function addFieldOptions(f, options) {
    	for (let i = 0; i < options.length; i++) {
    		f.addSelectOption(options[i]);
    	}
    }

    function addButtons(f, buttons) {
    	for (let i = 0; i < buttons.length; i++) {
            let but = buttons[i];
    		f.addButton(but)
    	}
    }

    function addSublists(f, sublists) {
    	for (let i = 0; i < sublists.length; i++) {
            let slist = sublists[i];
    		addSublist(f, slist);
    	}
    }

    function addSublist(f, sublist) {
        let sublistObj = f.addSublist(sublist);
        let sublistFields = sublist.sublistFields;
        let sublistValues = sublist.sublistValues;

    	for (let i = 0; i < sublistFields.length; i++) {
            let field = sublistFields[i];
    		sublistObj.addField(field);
    	}

    	for (let j = 0; j < sublistValues.length; j++) {
            let value = sublistValues[j];
    		sublistObj.setSublistValue(value);
    	}
    }

    function setScript(f, script) {
		f.clientScriptModulePath = script;
	}

    return JP_ISGenerationFormBuilder;

});
