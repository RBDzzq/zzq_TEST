/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget'],
    (serverWidget) => {

        class JP_FormBuilder{
            /**
             * Using serverWidget, this function creates a new form object using the
             * properties supplied by formDefinition object.
             * @param {Object} formDefinition may contain the following properties
             * @param {string} formDefinition.title form's title
             * @param {string} formDefinition.clientScript client script associated with this form
             * @param {Object} formDefinition.submitButton submit button of this form
             * @param {string} formDefinition.submitButton.id submit button's id
             * @param {string} formDefinition.submitButton.label submit button's label
             * @param {Array}  formDefinition.buttons additional buttons
             * @param {Array}  formDefinition.fieldGroups this form's field groups
             * @param {Array}  formDefinition.fieldSets this form's fields
             * @param {Array}  formDefinition.sublists this form's sublists
             * @param {Array}  formDefinition.subtabs this form's subtab
             *
             * @returns {Object} form object
             */
            buildForm(formComponents){
                let form = serverWidget.createForm({
                    title: formComponents.formTitle
                });

                this.addSubtabs(form, formComponents);
                this.addFieldSets(form, formComponents);
                this.addButtons(form, formComponents);
                this.addSubmitButton(form, formComponents);
                this.addSublists(form, formComponents);
                this.setScript(form, formComponents);

                return form;
            }

             addFieldSets(form, formComponents) {
                let fieldSets = formComponents.fieldSets;

                if(fieldSets){
                    for (let i = 0; i < fieldSets.length; i++) {
                        let set = fieldSets[i];
                        let fieldGroup = set.fieldGroup;
                        let fields = set.fields;

                        if(fieldGroup) form.addFieldGroup(fieldGroup);

                        this.addFields(form, fields);
                    }
                }
            }

            addFields(form, fields){
                for (let i = 0; i < fields.length; i++) {
                    let field = fields[i];
                    log.debug({title: "adding fld", details: JSON.stringify(fields[i])});
                    let f = form.addField(field);
                    if (field.help) f.setHelpText({help: field.help});
                    if (field.isMandatory) f.isMandatory = field.isMandatory;
                    if (field.displayType) f.updateDisplayType({displayType : field.displayType});
                    if (field.options) this.addFieldOptions(f, field.options);
                    if (field.defaultValue) f.defaultValue = field.defaultValue;
                    if (field.layoutType) f.updateLayoutType({layoutType : field.layoutType});
                    if (field.breakType) f.updateBreakType({breakType : field.breakType});
                }
            }

            addSubmitButton(form, formComponents) {
                let submitButton = formComponents.submitButton;
                if(submitButton){
                    form.addSubmitButton(submitButton);
                }
            }

            addFieldOptions(f, options) {
                for (let i = 0; i < options.length; i++) {
                    f.addSelectOption(options[i]);
                }
            }

            addButtons(f, formComponents) {
                let buttons = formComponents.buttons;
                if(buttons){
                    for (let i = 0; i < buttons.length; i++) {
                        let but = buttons[i];
                        f.addButton(but)
                    }
                }

            }

            addSublists(f, formComponents) {
                let sublists = formComponents.sublists;
                if(sublists){
                    for (let i = 0; i < sublists.length; i++) {
                        let slist = sublists[i];
                        this.addSublist(f, slist);
                    }
                }
            }

            addSublist(f, sublist) {
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

            setScript(f, formComponents) {
                if(formComponents.clientScript) f.clientScriptModulePath = formComponents.clientScript;
            }

            addSubtabs(form, formComponents){
                let subtabs = formComponents.subtabs;
                if(subtabs && form){
                    for(let i=0; i<subtabs.length; i++){
                        form.addSubtab(subtabs[i]);
                    }
                }
            }

        }

        return JP_FormBuilder;
    });
