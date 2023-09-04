/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 *
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['../../app/JP_TaxRecordsProvisioningManager'], (Manager)=>{

    function execute(scriptContext){
    	let mngr = new Manager();
    	mngr.provision();
    }

    return {
        execute: execute
    };

});
