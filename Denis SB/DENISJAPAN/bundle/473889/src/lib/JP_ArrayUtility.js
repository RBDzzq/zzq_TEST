/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([], ()=> {

    class ArrayUtility {

        isArrayASubset(parent, subset){
            let y, x;
            for(y=0; y<subset.length; y++){

                for(x=0; x<parent.length; x++){
                    if(subset[y] === parent[x]){
                        break;
                    }
                }

                if (x === parent.length) return false;
            }

            return true;
        }

        /**
         * flatten and get the parent and children id given the customer hierarchy array
         *
         * @param {Object} Object of customer hierarchical structure.
         * @returns {Array} Array of customer ids
         */
        flattenArrayHierarchy(hierarchy){
            let customers = [];
            if(hierarchy){
                let customersList = hierarchy;
                let parentIds = Object.keys(customersList);
                customers = parentIds;

                parentIds.forEach((idx) =>{
                    if(customersList[idx].children){
                        let childCustomers = Object.keys(customersList[idx].children);
                        customers = customers.concat(childCustomers);
                    }

                });
            }

            return customers;
        }
    }

    return ArrayUtility;
});
