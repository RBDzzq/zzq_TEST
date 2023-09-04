/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['../app/JP_ISDrilldownComponentContainer'], (ComponentContainer) => {


    function JP_ISDrilldownComponentCreator(){
        this.name = 'JP_ISDrilldownComponentCreator';
    }


    /**
     * Get form components
     *
     * @param {Object} reqValues
     * @returns {Object}
     */
    JP_ISDrilldownComponentCreator.prototype.getComponents = (reqValues) => {
    	let components = {
    			formTitle: "",
    			sublists: []
    	};

    	let componentContainer = new ComponentContainer(reqValues);
    	components.formTitle = componentContainer.getSearchFormTitle();
    	components.sublists = [componentContainer.getResultSublist()];
    	return components;
    }


    return JP_ISDrilldownComponentCreator;

});
