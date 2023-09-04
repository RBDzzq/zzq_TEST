/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([], ()=> {

	let str;

	class StringUtility {

        constructor(s) {
            str = s;
        }

        replaceParameters(parameters) {
            for (let i in parameters) {
                let re = new RegExp("\\{" + i + "\\}", "g");
                str = str.replace(re, parameters[i]);
            }

            return str;
        };


        /**
         * Generate an HTML link given key-value pairs of parameters
         *
         * @param {Object} parameters Link parameters
         * @returns {String}
         */
        generateHTMLLink(parameters) {

            let linkBuilder = ['<a href="', parameters.url, '"'];

            if (parameters.hasOwnProperty('target')) {
                linkBuilder.push(' target="', parameters.target, '"');
            }

            if (parameters.hasOwnProperty('title')) {
                linkBuilder.push(' title="', parameters.title, '"');
            }

            if (parameters.hasOwnProperty('class')) {
                linkBuilder.push(' class="', parameters.class, '"');
            }

            if (parameters.hasOwnProperty('details')) {
                linkBuilder.push(' data-details="', parameters.details, '"');
            }

            linkBuilder.push('>', str, '</a>');
            return linkBuilder.join('');

        };

        /**
         * Adds separator for string number (eg. comma)
         *
         * @param {String} num String number that will include separator
         * @param {String} separator
         * @returns {String}
         */
        stringNumwithSeparator(num, separator) {
            let parts = num.toString().split(".");
            if(!separator){
                separator = ',';
            }
            return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator) + (parts[1] ? "." + parts[1] : "");
        };

        /**
         *
         * Sorts an array of string objects in DFS
         *
         * @param strObjArr {Array} String objects with id, name and parent properties
         * @param rootNode {Object} Contains the root node id and name
         * @returns {Array} Sorted array of strings
         */
        sortStringsDFS(strObjArr, rootNode) {

            let sortedStrings = [];
            let nodes = [rootNode.id];
            let currNode = 0;
            let stringNames = [rootNode.name];
            let index = 0;

            while(strObjArr.length > 0){

                // Leaf node reached, move back to previous node to traverse next child
                if(index > strObjArr.length-1){
                    nodes.pop();
                    currNode--;
                    stringNames.pop();
                    index = 0;
                }

                // A child node is encountered, traverse its children
                let currStr = strObjArr[index];
                if(currStr.parent === nodes[currNode]){

                    nodes.push(currStr.id);
                    currNode++;
                    stringNames.push(currStr.name);

                    let strObj = strObjArr.splice(index,1)[0];
                    strObj['path'] = stringNames.join(' : ');
                    sortedStrings.push(strObj);

                    index = 0;

                }else{
                    index++;
                }
            }

            return sortedStrings;

        };

        /**
         *
         * Generates the path to a string from the root
         *
         * @param strObj {Object} Contains the strings' name and parent information
         * @param strId {string} Element to generate the path for
         * @returns {string}
         */
        getStringPathFromRoot(strObj, strId) {
            let path = [];
            let currStr = strId;
            while(strObj.hasOwnProperty(currStr) && strObj[currStr].parent){
                path.unshift(strObj[currStr].name);
                currStr = strObj[currStr].parent;
            }
            if(strObj.hasOwnProperty(currStr)){
                path.unshift(strObj[currStr].name);
            }
            return path.join(' : ');
        };

	}

	return StringUtility;
});
