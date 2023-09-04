/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
	"./JP_TaxRecordsPropertiesHandler",
	"../data/JP_NexusDAO",
	"../data/JP_VendorDAO",
	"../data/JP_AccountDAO",
	"../data/JP_TaxCodeDAO",
	"../data/JP_TaxTypeDAO",
	"N/config"],
	(TaxRecordsPropertiesHandler, NexusDAO, VendorDAO, AccountDAO, TaxCodeDAO, TaxTypeDAO, config) => {

	let properties;

	function JP_TaxRecordProvisioningManager(){
        this.name = 'JP_TaxRecordProvisioningManager';
        properties = new TaxRecordsPropertiesHandler().getProperties();
    }

	JP_TaxRecordProvisioningManager.prototype.provision = ()=>{
		let nexusID = provisionNexus();
        let taxAccountsDetails = provisionTaxAccounts(nexusID);
        let taxTypeID = provisionTaxType(taxAccountsDetails.jp_TaxType_TaxAccountType);
        let vendorID = provisionVendor();

        let taxCodesParams = {
			vendor: vendorID,
			taxType: taxTypeID,
			purchaseTaxAccount: taxAccountsDetails.jp_TaxType_TaxAccountType.purchase,
			salesTaxAccount: taxAccountsDetails.jp_TaxType_TaxAccountType.sale
		};
        let taxCodesDetails = provisionTaxCodes(taxCodesParams);

        let jpSetupParams = {
				defaultTaxCode: taxCodesDetails.defaultTaxCode,
				preferredTaxAgency: vendorID
		};
		setupJapanTax(jpSetupParams);

        let createdRecords = {
			"nexus": nexusID,
			"taxAcct": taxAccountsDetails.taxAccountIDs, //array of tax accounts
			"taxtype": taxTypeID,
			"vendor": vendorID,
			"salestaxitem": taxCodesDetails.taxCodeIDs //array of tax codes
		};

		log.debug("Created Records", JSON.stringify(createdRecords));

		return createdRecords;
    };


	/******* Setup Japanese Tax *******/
	function setupJapanTax(params) {
        let taxpref = config.load({type: "taxpreferences"});

		//TAX CODE LISTS INCLUDE
		taxpref.setValue({
		    fieldId: 'taxcodelistincludejp',
		    value: 'TAXITEMS'
		});

		//DEFAULT TAX CODE
		taxpref.setValue({
		    fieldId: 'taxcode4jp',
		    value: params.defaultTaxCode
		});

		//PREFERRED TAX AGENCY
		taxpref.setSublistValue({
		    sublistId: 'nexusestaxjp',
		    fieldId: 'taxagency',
		    line: 0,
		    value: params.preferredTaxAgency
		});

		//ENABLE TAX LOOKUP ON SALES AND PURCHASES
		taxpref.setValue({
		    fieldId: 'enabletaxlookupjp',
		    value: properties.taxsetup.enabletaxlookup
		});

		//PRINT TAX CODE SUMMARY ON SALES FORMS
		taxpref.setValue({
		    fieldId: 'showtaxcodesummaryjp',
		    value: properties.taxsetup.printtaxcodesalesform
		});

		//ONLY USE TAX CONTROL ACCOUNTS ON TAX TYPES
		taxpref.setValue({
		    fieldId: 'usetaxctrlacctfortaxtypejp',
		    value: properties.taxsetup.usetaxctrlacctfortaxtype
		});

		//FOREIGN TRADE
		taxpref.setValue({
		    fieldId: 'chargeoutofdistrictjp',
		    value: properties.taxsetup.foreigntrade
		});

		// TAX REPORTING CASH BASIS
		taxpref.setValue({
		    fieldId: 'cashbasisreportingjp',
		    value: properties.taxsetup.cashbasisreporting
		});

		// DISPLAY TAX REGISTRATION NUMBER FIELD IN WEB STORE
		taxpref.setValue({
		    fieldId: 'showtaxregnojp',
		    value: properties.taxsetup.showtaxregno
		});

		taxpref.save();
	}

	/******* Tax Codes Provisioning *******/
	function provisionTaxCodes(taxCodesGeneratedData) {
        let taxCodesDetails = {};
        let taxCodesProperties = properties.taxcodes;
        let taxCodeIDs = [];
        let defaultTaxCode;

		for(let i = 0; i < taxCodesProperties.length; i++) {
            let taxCodeProp = taxCodesProperties[i];
            let taxCodeParams = {};

			// setting of generated related-records for tax code creation
			for(let key in taxCodesGeneratedData){
				taxCodeParams[key] = taxCodesGeneratedData[key];
			}

			// setting of values from properties module
			for(let property in taxCodeProp){
				taxCodeParams[property] = taxCodeProp[property];
			}

			taxCodeParams.recordRenaming = true;

			let recDAO = new TaxCodeDAO();
			let taxCodeID = recDAO.createTaxCode(taxCodeParams);

			taxCodeIDs.push(taxCodeID);
			if(taxCodeProp.isdefault) defaultTaxCode = taxCodeID;
		}

		taxCodesDetails.taxCodeIDs = taxCodeIDs;
		taxCodesDetails.defaultTaxCode = defaultTaxCode;
		return taxCodesDetails;
	}

	/******* Tax Type Provisioning *******/
	function provisionTaxType(taxAccountTypes) {
		let recDao = new TaxTypeDAO();
		let taxTypeParams = {};

		// setting of generated related-records for tax code creation
		for(let key in properties.taxtype){
			taxTypeParams[key] = properties.taxtype[key];
		}
		taxTypeParams.taxAccountTypes = taxAccountTypes;

		return recDao.createTaxType(taxTypeParams);
	}

	/******* Tax Accounts Provisioning *******/
	function provisionTaxAccounts(nexusID) {
		let taxAccountsDetails = {};
        let taxAccountsProperties = properties.taxaccounts;
        let taxAccountIDs = [];
        let jp_TaxType_TaxAccountType = {};

		for(let i = 0; i < taxAccountsProperties.length; i++) {
            let taxAccount = taxAccountsProperties[i];
            let recDAO = new AccountDAO();

            let taxAccountParams = taxAccount;
			taxAccountParams.nexusID = nexusID;
			taxAccountParams.recordRenaming = true;
            let taxAccountID = recDAO.createTaxAccount(taxAccountParams);
			taxAccountIDs.push(taxAccountID);

			if (taxAccount.jp_TaxType_TaxAccountType) {
                let jpAccountType = taxAccount.jp_TaxType_TaxAccountType;
				jp_TaxType_TaxAccountType[jpAccountType] = taxAccountID;
			}
		}
		taxAccountsDetails.taxAccountIDs = taxAccountIDs;
		taxAccountsDetails.jp_TaxType_TaxAccountType = jp_TaxType_TaxAccountType;
		return taxAccountsDetails;
	}

	/******* Nexus Provisioning *******/
	function provisionNexus(){
        let nxDao = new NexusDAO();
        let nexusRec = nxDao.retrieveNexusByCountry("JP");
        let nexusID;

		if (nexusRec) {
			nexusID = nexusRec.id
		} else {
			nexusID = nxDao.createNexus();
		}
		return nexusID;
	}

	/******* Vendor Provisioning *******/
	function provisionVendor() {
        let recDAO = new VendorDAO();
        let vendorParams = properties.vendor;
		vendorParams.recordRenaming = true;
		return recDAO.createVendor(vendorParams);
	}

    return JP_TaxRecordProvisioningManager;
});
