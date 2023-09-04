/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["require", "N/error","../app/JP_ISGenerationFormBuilder"],
		(require, error, JP_FormBuilder) => {

	let cCreator;

    class JP_ISGenerationFormMediator{

        constructor(c) {
            if (!c) {
                throw error.create({
                    name : "MISSING_CONSTRUCTOR_PARAMETER",
                    message : "JP_ISGenerationFormMediator constructor parameter is missing.",
                    notifyOff:false
                });
            }

            cCreator = c;
        }

        loadPage(reqValues){
            let componentCreator = new (this.getComponentCreator())();
            let formComponents = componentCreator.getComponents(reqValues);

            let formBuilder = new JP_FormBuilder();
            return formBuilder.buildForm(formComponents);
        };

        getComponentCreator(){
            let componentCreator = null;
            require(["../app/"+cCreator], function (c){
                componentCreator = c;
            });

            return componentCreator;
        }
    }

    return JP_ISGenerationFormMediator;

});
