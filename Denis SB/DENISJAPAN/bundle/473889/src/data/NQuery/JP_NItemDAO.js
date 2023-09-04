/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    'N/query',
    '../../lib/JP_QueryIterator'
    ],

    (query, QueryIterator) => {

        const ITEMID = 'itemid';
        const DISPLAYNAME = 'displayname';
        const ID = 'id';

        class NItemDAO{
            constructor(){
                this.name = 'JP_NItemDAO';
                this.fields = {
                    "itemid": ITEMID,
                    "displayname": DISPLAYNAME,
                    "id": ID
                };
                this.recordType = 'item';
            }

            /**
             * Retrieve Item Internal ID, Item Number and Display Name
             *
             * @param itemIds int[] list of item internal IDs
             * @returns {obj} ID-Name pairs of Items
             */
            getItemDisplayNames(itemIds){

                let itemQuery = query.create({type: this.recordType});
                let fieldVals = [ID, ITEMID, DISPLAYNAME];

                let itemIdCondition = itemQuery.createCondition({
                    fieldId: ID,
                    operator: query.Operator.ANY_OF,
                    values: itemIds
                });
                itemQuery.condition = itemIdCondition;

                itemQuery.columns = [];
                for(const field of fieldVals){
                    itemQuery.columns.push(itemQuery.createColumn({
                        fieldId: field,
                    }));
                }

                let iterator = new QueryIterator(itemQuery);
                let itemObj = {};
                let item = null;
                while((item = iterator.next())){
                    let name = item[DISPLAYNAME] ? item[ITEMID]+" "+item[DISPLAYNAME] : item[ITEMID]
                    itemObj[item[ID]] = name;
                }
                return itemObj;
            }

        }

        return NItemDAO;
    });
