/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([], ()=> {

    function JP_TaxFormjQueryUtil(){
        this.name = 'JP_TaxFormUI';
    }

    /**
     * Get the sum of input elements and set the result to the specified element ids
     * @param params
     * @param params.prefix - prefix used for ids. Set to blank string if not applicable
     * @param params.inputs - cell numbers of the elements to add (e.g., 10a,10b,10c,11a)
     * @param params.outputs - cell of where the sum should be put
     *
     *
     */
    JP_TaxFormjQueryUtil.prototype.sumElementsAndSetValues = (params) => {
        let inputElementsToAdd = [];
        util.each(params.inputs, function(inp){
            inputElementsToAdd.push(params.prefix + inp);
        });
        let sum = sumInputElements({elemIds: inputElementsToAdd});
        let outputElements = [];
        util.each(params.outputs, function(out){
            outputElements.push(params.prefix + out);
        });
        setValuesToInputElements({value: sum, elems: outputElements});
    };

    /**
     * Get the difference of input elements and set the result to the specified element ids
     *
     * @param {Object} params
     * @param {String} params.prefix - prefix used for ids. Set to blank string if not applicable
     * @param {Array} params.inputs - cell numbers of the elements to add (e.g., 10a,10b,10c,11a)
     * @param {Array} params.outputs - cell of where the difference should be put
     *
     */
    JP_TaxFormjQueryUtil.prototype.subtractElementsAndSetValues = (params) => {
        let inputElementsToSubtract = [];
        util.each(params.inputs, function(inp){
            inputElementsToSubtract.push(params.prefix + inp);
        });
        let difference = subtractInputElements({elemIds: inputElementsToSubtract});
        let outputElements = [];
        util.each(params.outputs, function(out){
            outputElements.push(params.prefix + out);
        });
        setValuesToInputElements({value: difference, elems: outputElements});
    }

    /**
     * Using jQuery, set the value to the element having the id parameter

     * @param params.id - id (without #) of the element to set value to
     * @param params.value - the value
     * @param {Boolean=} raw  - indicates if raw or Math.floor
     */
    JP_TaxFormjQueryUtil.prototype.setValue = (params, raw)=>{
        jQuery('#'+params.id).val(params.raw ? params.value : Math.floor(params.value));
    };

    /**
     * Perform jQuery function on elements matching the selector
     *
     * Sample: $('#someid').show() -> JP_TaxFormjQueryUtil.prototype.operate({selector: '#someid', operation: 'show'})
     * $('#someid').addClass('someClass') -> JP_TaxFormjQueryUtil.prototype.operate({selector: '#someid', operation: 'addClass', params: ['someClass']})
     * @param params.selector - the selector
     * @param params.operation - the operation (e.g., show, hide, addClass, val)
     * @param params.params - params to to the applied function
     */
    JP_TaxFormjQueryUtil.prototype.operate = (params)=>{
        if(jQuery(params.selector)[params.operation]){
            return jQuery(params.selector)[params.operation].apply(jQuery(params.selector), params.params);
        }
    };

    /**
     * This is a shortcut for setting the same value for multiple fields.
     *
     * @param params
     * @param params.value - the value
     * @param params.elems - the elementIds (without #) where to put the values to
     */
    function setValuesToInputElements(params){
        util.each(params.elems, (inputId)=>{
            jQuery('#'+inputId).val(params.value);
        })
    }
    /**
     * This function is for getting the sum of values of given element ids.
     * @param params {Object}
     * @param params.elemIds {Array} - element ids without #
     * @param params.raw {Boolean} - indicates if raw or Math.floor
     *
     * @return res of params.elemIds values, raw or Math.floor(sum)
     */
    function sumInputElements(params){
        let res = 0;
        util.each(params.elemIds, (id) =>{
            res += parseFloat(getInputElementVal({id: id}));
        });
        return params.raw ? res : Math.floor(res);
    }
    JP_TaxFormjQueryUtil.prototype.sumInputElements = sumInputElements;

    /**
     * This function is for subtracting the values of given element ids
     *
     * @param {Object} params
     * @param {Array} params.elemIds - element ids without #
     * @param {Boolean} params.raw - indicates if raw or Math.floor
     * @returns {Number} result of subtraction
     */
    function subtractInputElements(params) {
        let res = null;
        util.each(params.elemIds, (id)=>{
            res = (res === null) ? parseFloat(getInputElementVal({id: id})) :
                res-parseFloat(getInputElementVal({id: id}));
        });
        return params.raw ? res : Math.floor(res);
    }
    JP_TaxFormjQueryUtil.prototype.subtractInputElements = subtractInputElements;

    /**
     * Get the input element's value
     *
     * @param params.id - element id without #
     * @param params.def - default value
     * @returns {string | number | string[] | jQuery | *}
     */
    function getInputElementVal(params){
        return jQuery('#'+params.id).val() || (params.def || 0);
    }
    JP_TaxFormjQueryUtil.prototype.getInputElementVal = getInputElementVal;


    return JP_TaxFormjQueryUtil;

});
