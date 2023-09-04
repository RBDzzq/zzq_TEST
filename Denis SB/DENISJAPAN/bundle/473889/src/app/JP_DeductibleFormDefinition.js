/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 *  Contains the Deductable Tax Form definition
 */

define(['N/ui/serverWidget', '../lib/JP_TCTranslator'],
     (widget, translator) =>{

        class JP_DeductibleFormDefinition{

            constructor() {
                //define all the form field names so we change them in one place.
                this.formVariables = {
                    fldSubsidiary : 'custpage_jpdtcf_subsidiary',
                    fldCalcMethod : 'custpage_jpdtcf_calc_method',
                    fldFrom : 'custpage_jpdtcf_period_from',
                    fldTo : 'custpage_jpdtcf_period_to',
                    fldprintopt: 'custpage_jp_print_opt',
                    fldhtml_includes: 'custpage_jpdtcf_includes_html',
                    fldhtml1_1: 'custpage_jpdtcf_form1_1_html',
                    fldhtml1_2: 'custpage_jpdtcf_form1_2_html',
                    fldhtml2_1: 'custpage_jpdtcf_form2_1_html',
                    fldhtml2_2: 'custpage_jpdtcf_form2_2_html',
                    fldhtml_t1: 'custpage_jpdtcf_tax_form1_html',
                    fldhtml_t2: 'custpage_jpdtcf_tax_form2_html',
                    btnRefresh: 'custpage_jpdctf_refresh',
                    btnPrint:   'custpage_jpdctf_print',
                    formtab1:   'custpage_jp_form1_1',
                    formtab2:   'custpage_jp_form1_2',
                    formtab3:   'custpage_jp_form2_1',
                    formtab4:   'custpage_jp_form2_2',
                    formtab5:   'custpage_jp_tax_form1',
                    formtab6:   'custpage_jp_tax_form2'
                };
                const FORMTITLE = 'DEDUCTIBLE_FORM_TITLE';
                const SUBSIDIARYLBL = 'DEDUCTIBLE_LABEL_SUBSIDIARY';
                const SUBSIDIARYHLP = 'DEDUCTIBLE_HELP_SUBSIDIARY';
                const CALCMETHODLBL =  'DEDUCTIBLE_LABEL_CALC_METHOD';
                const CALCMETHODHLP = 'DEDUCTIBLE_HELP_CALC_METHOD';
                const TAXPERIODLBL = 'DEDUCTIBLE_LABEL_TAX_PERIOD';
                const TAXPERIODHLP = 'DEDUCTIBLE_HELP_TAX_PERIOD';
                const PERIODTOLBL = 'DEDUCTIBLE_LABEL_PERIOD_TO';
                const REFRESH = 'DEDUCTIBLE_BUTTON_REFRESH';
                const PRINT = 'DEDUCTIBLE_BUTTON_PRINT';
                const ITEMIZED = 'DEDUCTIBLE_VALUES_ITEMIZED';
                const PROPORTIONAL = 'DEDUCTIBLE_VALUES_PROPORTIONAL';

                const strings = new translator().getTexts([FORMTITLE,
                    SUBSIDIARYLBL, SUBSIDIARYHLP,
                    CALCMETHODLBL, CALCMETHODHLP,
                    TAXPERIODLBL, TAXPERIODHLP,
                    PERIODTOLBL, REFRESH, PRINT, ITEMIZED, PROPORTIONAL], true);

                this.formDefinition = {
                    formTitle : strings[FORMTITLE],
                    fieldSets : [{
                        fields :[
                            { //subsidiary drop down.
                                id: this.formVariables.fldSubsidiary,
                                label: strings[SUBSIDIARYLBL],
                                type: widget.FieldType.SELECT,
                                help: strings[SUBSIDIARYHLP],
                                displayType: widget.FieldDisplayType.NORMAL
                            },
                            { //calculation method
                                id : this.formVariables.fldCalcMethod,
                                label: strings[CALCMETHODLBL],
                                type: widget.FieldType.SELECT,
                                help: strings[CALCMETHODHLP],
                                displayType: widget.FieldDisplayType.NORMAL
                            },
                            { //period from drop down
                                id: this.formVariables.fldFrom,
                                label: strings[TAXPERIODLBL],
                                type: widget.FieldType.SELECT,
                                help: strings[TAXPERIODHLP],
                                displayType: widget.FieldDisplayType.NORMAL
                            },
                            { //period to drop down
                                id: this.formVariables.fldTo,
                                label: strings[PERIODTOLBL],
                                type: widget.FieldType.SELECT,
                                help: strings[TAXPERIODHLP], // Same FLH with tax_period field
                                displayType: widget.FieldDisplayType.NORMAL
                            },
                            {
                                //hidden field to store the print options for SI.
                                id: this.formVariables.fldprintopt,
                                label : "Print Options",
                                type: widget.FieldType.TEXT,
                                displayType: widget.FieldDisplayType.HIDDEN
                            },
                            //inline html fields
                            {
                                id: this.formVariables.fldhtml_includes,
                                label: ' ',
                                type: widget.FieldType.INLINEHTML,
                                formFile: 'japan_loc_deductible_tax_calc_form_includes.htm'
                            },
                            {
                                id: this.formVariables.fldhtml1_1,
                                label: ' ',
                                type: widget.FieldType.INLINEHTML,
                                container : this.formVariables.formtab1,
                                formFile: 'japan_loc_deductible_tax_calc_form_1.htm'
                            },
                            {
                                id: this.formVariables.fldhtml1_2,
                                label: ' ',
                                type: widget.FieldType.INLINEHTML,
                                container : this.formVariables.formtab2,
                                formFile: 'japan_loc_deductible_tax_calc_form_2.htm'
                            },
                            {
                                id: this.formVariables.fldhtml2_1,
                                label: ' ',
                                type: widget.FieldType.INLINEHTML,
                                container : this.formVariables.formtab3,
                                formFile: 'japan_loc_deductible_tax_calc_form_3.htm'
                            },
                            {
                                id: this.formVariables.fldhtml2_2,
                                label: ' ',
                                type: widget.FieldType.INLINEHTML,
                                container : this.formVariables.formtab4,
                                formFile: 'japan_loc_deductible_tax_calc_form_4.htm'
                            },
                            {
                                id: this.formVariables.fldhtml_t1,
                                label: ' ',
                                type: widget.FieldType.INLINEHTML,
                                container : this.formVariables.formtab5,
                                formFile: 'japan_loc_tax_form_1.htm'
                            },
                            {
                                id: this.formVariables.fldhtml_t2,
                                label: ' ',
                                type: widget.FieldType.INLINEHTML,
                                container : this.formVariables.formtab6,
                                formFile: 'japan_loc_tax_form_2.htm'
                            }
                        ]}
                    ],
                    buttons: [
                        {
                            id   : this.formVariables.btnRefresh,
                            label: strings[REFRESH],
                            functionName: 'refresh'
                        },
                        {
                            id    : this.formVariables.btnPrint,
                            label : strings[PRINT],
                            functionName: 'print'
                        }
                    ],
                    subtabs : [
                        {
                            id: this.formVariables.formtab5,
                            label: '第一表',
                        },
                        {
                            id: this.formVariables.formtab6,
                            label: '第二表'
                        },
                        {
                            id: this.formVariables.formtab1,
                            label: '付表１－１'
                        },
                        {
                            id: this.formVariables.formtab2,
                            label: '付表１－２',
                        },
                        {
                            id: this.formVariables.formtab3,
                            label: '付表２－１',
                        },
                        {
                            id: this.formVariables.formtab4,
                            label: '付表２－２',
                        }
                    ],
                    html_uuid: 'e4014ae3e03c465a80acfcaf496a64fc.txt',
                    clientScript : '../comp/cs/JP_DeductibleTaxFormCS.js',
                    calcMethods : [
                        { value: 1, text: strings[ITEMIZED]},
                        {value: 2, text: strings[PROPORTIONAL]}]
                }
            }

            getFormDefinition(){
                return this.formDefinition;
            }

            getFormVariables(){
                return this.formVariables;
            }
        }

         return JP_DeductibleFormDefinition;
    });
