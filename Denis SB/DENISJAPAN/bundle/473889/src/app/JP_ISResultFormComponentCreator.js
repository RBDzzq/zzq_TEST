/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["../app/JP_ISGenerationFormComponentContainer",
		"N/ui/serverWidget"],
		(ComponentContainer, serverWidget) => {

    function JP_ISResultFormComponentCreator(){
        this.name = 'JP_ISResultFormComponentCreator';
    }

    JP_ISResultFormComponentCreator.prototype.getComponents = (reqValues)=>{
    	let components = {
    			formTitle: "",
    			fieldSets: [],
    			buttons: [],
    			submitButton: null
    	};

    	let componentContainer = new ComponentContainer(reqValues);
    	components.formTitle = componentContainer.getSearchFormTitle();

    	let filterFieldSets = componentContainer.getFilterFieldSets();
    	hideFieldSet(filterFieldSets);
    	let documentFieldSet = componentContainer.getDocumentFieldSet();

    	components.fieldSets = filterFieldSets.concat([documentFieldSet]);
    	components.buttons = [componentContainer.getReturnToSearchButton()];
    	components.sublists = [componentContainer.getCustomerResultSublist()];
    	components.submitButton = componentContainer.getGenerateISSubmitButton();
    	components.clientScript = componentContainer.getClientScript();
    	return components;
    };

    function hideFieldSet(fieldSets){
        for (let i = 0; i < fieldSets.length; i++) {
            for (let j = 0; j < fieldSets[i].fields.length; j++) {
                fieldSets[i].fields[j].displayType = serverWidget.FieldDisplayType.HIDDEN;
            }
        }
    }

    return JP_ISResultFormComponentCreator;
});
