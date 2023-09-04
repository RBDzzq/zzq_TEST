/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/search", "N/error"], (search, error) => {

	function JP_TaxRecordPropertiesHandler(){
        this.name = 'JP_TaxRecordPropertiesHandler';
    }

	function getTaxAgencyCategory() {
		let categoryID;
        let filters = [
			{name: "isinactive", operator: search.Operator.IS, values: false},
			{name: "istaxagency", operator: search.Operator.IS, values: true},
		];

        let idColumn =  search.createColumn({name:"internalid", sort:search.Sort.ASC});
        let columns = [idColumn];

        let src = search.create({type: search.Type.VENDOR_CATEGORY, filters:filters, columns: columns});
		src.run().each((result) =>{
			categoryID = result.id;
	    });

		if(!categoryID) {
			throw error.create({
				name: "JP_TAX_REC_PROV_NO_TAX_AGENCY_CATEGORY",
				message: "No tax agency category was found in the account."
			});
		}

		return categoryID;
	}

	JP_TaxRecordPropertiesHandler.prototype.getProperties = ()=> {
		return {
			/* Vendor (Tax Agency) */
			"vendor" : {
				"companyname" : "デフォルト税務署",
				"category" : getTaxAgencyCategory(),
				"subsidiary" : 1	// Parent subsidiary
			},

			/* Tax Accounts */
			"taxaccounts" : [
				{name: "仮受消費税", description: "仮受消費税", taxaccounttype: "sale", jp_TaxType_TaxAccountType: "sale"},
				{name: "仮払消費税", description: "仮払消費税", taxaccounttype: "purchase", jp_TaxType_TaxAccountType: "purchase"},
				{name: "未払消費税", description: "未払消費税", taxaccounttype: "sale"}
			],

			/* Tax Type */
			"taxtype" : {
				"name" : "消費税",
				"description" : "Consumption Tax"
			},

			/* Tax Codes */
			"taxcodes" : [
				{itemid: "未定義", description: "未定義", rate: 0, subsidiaries: 1,
                    includechildren: true, availability: "BOTH", exempt: false, isdefault: false},
				{itemid: "消費税(2019/9まで)", description: "消費税(2019/9まで)",
                    rate: 8, subsidiaries: 1, includechildren: true, availability: "BOTH", exempt: false, isdefault: false},
				{itemid: "不課税", description: "不課税", rate: 0, subsidiaries: 1,
                    includechildren: true, availability: "BOTH", exempt: false, isdefault: false},
				{itemid: "免税", description: "免税", rate: 0, subsidiaries: 1,
                    includechildren: true, availability: "BOTH", exempt: true, isdefault: false},
				{itemid: "非課税", description: "非課税", rate: 0, subsidiaries: 1,
                    includechildren: true, availability: "BOTH", exempt: false, isdefault: false},
				{itemid: "消費税(標準税率)", description: "消費税(標準税率)", rate: 10,
                    subsidiaries: 1, includechildren: true, availability: "BOTH", exempt: false, isdefault: true},
				{itemid: "消費税(軽減税率)", description: "消費税(軽減税率)", rate: 8,
                    subsidiaries: 1, includechildren: true, availability: "BOTH", exempt: false, isdefault: false}
			],

			"taxsetup" : {
				//Enable Tax Lookup on Sales and Purchases
				"enabletaxlookup" : true,
				//Print Tax Code Summary on Sales Forms
				"printtaxcodesalesform" : true,
				//Only Use Tax Control Accounts on Tax Types
				"usetaxctrlacctfortaxtype" : true,
				//Foreign Trade
				"foreigntrade" : true,
				//Tax Reporting Cash Basis
				"cashbasisreporting" : false,
				//Display Tax Registration Number Field In Web Store
				"showtaxregno" : true
			}
		};
	};

    return JP_TaxRecordPropertiesHandler;
});
