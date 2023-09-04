/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['../app/JP_ISGenerationFormComponentContainer'], (ComponentContainer)=> {

    function JP_ISSearchFormComponentCreator(){
        this.name = 'JP_ISSearchFormComponentCreator';
    }

    JP_ISSearchFormComponentCreator.prototype.getComponents = (reqValues)=>{
    	let components = {
    			formTitle: "",
    			fieldSets: []
    	};

    	let componentContainer = new ComponentContainer(reqValues);
    	components.formTitle = componentContainer.getSearchFormTitle();
    	components.fieldSets = componentContainer.getFilterFieldSets();
        components.buttons = [componentContainer.getViewOutstandingJobsButton()];
    	components.submitButton = componentContainer.getSearchFormSubmitButton();
    	components.clientScript = componentContainer.getClientScript();
    	return components;

    };

    return JP_ISSearchFormComponentCreator;
});
