/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['N/runtime',
        'N/ui/serverWidget',
        '../app/JP_DeductibleFormDefinition',
        '../lib/JP_FormBuilder',
        '../lib/JP_SearchIterator',
        '../data/JP_SubsidiaryDAO',
        '../data/JP_TaxPeriodDAO',
        '../data/JP_FileDAO',
        '../data/JP_CompanyDAO',
        'N/file',
        'N/search'
    ], (runtime, widget, JP_FormDefinition,
               JPformBuilder, SearchIterator, subsidiaryDAO, JPTaxPeriodDAO,
               JPFileDAO, compDAO, file, search) =>{

        const country = 'JP';
        let formDef, formVars, formDefinition

        class JP_DeductibleTaxCalcUI{
            buildUI(){
                formDef = new JP_FormDefinition();
                formDefinition = formDef.getFormDefinition();
                formVars = formDef.getFormVariables();

                this.uiPreProcess();
                let myform = new JPformBuilder().buildForm(formDefinition);
                this.uiPostProcess(myform);

                return myform;
            };

            uiPreProcess() {

                if (!runtime.isFeatureInEffect({feature: 'SUBSIDIARIES'})) {
                    //remove the subsidiary field.
                    const len = formDefinition.fieldSets[0].fields.length;
                    formDefinition.fieldSets[0].fields = formDefinition.fieldSets[0].fields.splice(1, len);
                }
            }

            uiPostProcess(form){
                //populate subsidiary dropdown.
                //check first of the subsidiary field is present.
                let fldSubsidiary = form.getField({id: formVars.fldSubsidiary});
                let fldprntopt;

                if(!!fldSubsidiary){
                    let userSub = runtime.getCurrentUser().subsidiary;
                    let userRole = runtime.getCurrentUser().role;
                    let isAdmin = userRole === 3;
                    let allowedSubsidiaries = {};

                    if(!isAdmin){
                        let roleSearch = search.create({
                            type: search.Type.ROLE,
                            filters: ['internalid', search.Operator.IS, userRole],
                            columns: [
                                {name:'subsidiaries'},
                                {name:'subsidiaryoption'}
                            ]
                        });
                        const iterator = new SearchIterator(roleSearch);
                        while(iterator.hasNext()){
                            const result = iterator.next();
                            const subsidiary = result.getValue({name:'subsidiaries'});
                            const subsidiaryOption = result.getValue({name:'subsidiaryoption'});
                            if(subsidiaryOption === 'OWN'){
                                allowedSubsidiaries[userSub] = true;
                            }
                            else if(subsidiary && !allowedSubsidiaries[subsidiary]){
                                allowedSubsidiaries[subsidiary] = true;
                            }
                        }
                    }

                    const subsidiaries = new subsidiaryDAO().getSubsidiaryByCountry(country);
                    let hasSubsidiaryOptions = false;

                    subsidiaries.forEach((subsidiaryObj)=>{
                        let selected = (userSub.toString() === subsidiaryObj.id);
                        if(isAdmin || allowedSubsidiaries[subsidiaryObj.id]){
                            fldSubsidiary.addSelectOption({
                                value: subsidiaryObj.id,
                                text: subsidiaryObj.name,
                                isSelected : selected
                            });
                            hasSubsidiaryOptions = true;
                        }
                    });

                    if(!hasSubsidiaryOptions){
                        form.getButton({id: formVars.btnRefresh}).isDisabled = true;
                        form.getButton({id: formVars.btnPrint}).isDisabled = true;
                    }

                }
                else{
                    const printopt = new compDAO().getPrintOptions();
                    fldprntopt = form.getField({id: formVars.fldprintopt});
                    fldprntopt.defaultValue = printopt;
                }

                //populate the calculation method dropdown.
                const fldCalMethod = form.getField({id: formVars.fldCalcMethod});

                formDefinition.calcMethods.forEach((item)=>{
                    fldCalMethod.addSelectOption(item);
                });

                //populate the tax period fields.
                const taxPeriods = new JPTaxPeriodDAO().getTaxPeriod();
                const fromFld = form.getField({id: formVars.fldFrom});
                const toFld = form.getField({id: formVars.fldTo});

                taxPeriods.forEach((period)=>{
                    fromFld.addSelectOption(period);
                    toFld.addSelectOption(period);
                });

                //now render the forms in each tab.
                const fileIds = new JPFileDAO().getFilesInFolder(formDefinition.html_uuid);

                formDefinition.fieldSets[0].fields.forEach((field)=>{
                    if(field.formFile && fileIds[field.formFile]){
                        const template = file.load(fileIds[field.formFile].id).getContents();
                        const inlineHtmlField = form.getField({id: field.id});
                        inlineHtmlField.defaultValue = template;
                        inlineHtmlField.updateBreakType({breakType : widget.FieldBreakType.STARTROW});
                    }
                });

                //update the layout of the fields.
                formDefinition.fieldSets[0].fields.forEach((fld)=>{
                    form.getField({id:fld.id}).updateLayoutType({layoutType: widget.FieldLayoutType.OUTSIDEABOVE});
                });
            }
        }

        return JP_DeductibleTaxCalcUI;
    });
