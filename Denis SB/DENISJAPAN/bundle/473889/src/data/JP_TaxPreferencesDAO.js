/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(['N/config',  'N/record'],

    (config, record) => {

        let taxPrefInfo;
        class JP_TaxPreferencesDAO{

            constructor() {
                this.settings = {
                    roundingLevel : 'taxroundingleveljp',
                    entityOverride : 'overrideroundingcustjp',
                    rounding: 'taxroundingjp'  //values are DOWN, UP, and OFF
                };
                //using lookup table instead of switch statements.
                this.roundingLookup = {
                    "DOWN" : Math.floor,
                    "UP" : Math.ceil,
                    "OFF" : Math.round
                };

                //the customer tax rounding field.
                this.taxrounding = 'taxrounding';
            }
            getCompValue(id){
                if(!taxPrefInfo){
                    taxPrefInfo = config.load({
                        type: 'taxpreferences'
                    });
                }

                return taxPrefInfo.getValue({fieldId: id});
            };

            /**
             * Returns the rounding method based on the settings.
             *
             * @param customerId integer, customer id whose setting we want to get.
             * @return function Javascript rounding function (floor, ceil, or round)
             */
            getRoundingMethod(entityId, entityType, su){
                log.debug('getTaxPreferenceInEffect for entity ' + entityId);
                let entityRoundingPreference;

                if (entityType === record.Type.VENDOR){
                    entityRoundingPreference = this.getVendorRoundingPreference(entityId);
                }else{
                    entityRoundingPreference = this.getCustomerRoundingPreference(entityId);
                }

                //do note that rounding setting cannot be set to null or blank,
                //for newly created customers it autopopulates to round off, there's no blank selection in the dropdown
                let roundMethod = ( this.getCompValue(this.settings.entityOverride)  ) ?
                    entityRoundingPreference :
                    this.getCompValue(this.settings.rounding);

                log.debug('roundMethod', roundMethod);
                return (su) ? roundMethod : this.roundingLookup[roundMethod];
            }

            getCustomerRoundingPreference(customerId){
                //Note: we are using record.load because for some unknown reason the 'taxrounding' field is not
                //searchable both using N/search and N/query, so we have no choice but to load the record.
                let custRec = record.load({
                    type : record.Type.CUSTOMER,
                    id: customerId
                });

                return custRec.getValue({fieldId: this.taxrounding});
            }

            getVendorRoundingPreference(vendorId){
                let vendorRec = record.load({
                    type : record.Type.VENDOR,
                    id: vendorId
                });

                return vendorRec.getValue({fieldId: this.taxrounding});
            }
        }

        return JP_TaxPreferencesDAO;
    });
