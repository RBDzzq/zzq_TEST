/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['./JP_Renderer', './JP_DeductibleFormDefinition', '../data/JP_FileDAO', 'N/file'],

 (Renderer, FormDefinition, FileDAO, file) => {

    let XML_PDF_HEADER = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>\n";

    let FOOTER = "\n</body>\n</pdf>";

    let PRINT_TEMPLATES = [
        'japan_loc_tax_form_1.xml',
        'japan_loc_tax_form_2.xml',
        'japan_loc_deductible_tax_calc_form_1.xml',
        'japan_loc_deductible_tax_calc_form_2.xml',
        'japan_loc_deductible_tax_calc_form_3.xml',
        'japan_loc_deductible_tax_calc_form_4.xml'
    ];

    let NON_LEGACY_TEMPLATES = [
        PRINT_TEMPLATES[0],
        PRINT_TEMPLATES[1],
        PRINT_TEMPLATES[2],
        PRINT_TEMPLATES[4]
    ];

    let TEMPLATE_IMAGES = [
        'diagonal.jpg',
        'japan_tax_form_2_table_3_data_cells.jpg',
        'japan_tax_form_2_ref_num_boxes.jpg',
        'japan_tax_form_box_dotted.jpg',
        'japan_tax_form_mid_sec_data_cells.jpg',
        'dottedcircle.png',
        'circlewithtext.png',
        'single_square.jpg',
        'japan_tax_13_cell.jpg',
        'japan_tax_six_boxes.jpg'
    ];

    function JP_TaxFormPDFRenderer(){
        this.name = 'JP_TaxFormPDFRenderer';
    }

    /**
     * Generates a PDF file for tax form given the field mappings
     * This will combine the printable templates and use N/render to render the contents against the fieldValues
     *
     * @param params.fieldValues {Object} key-value pair of element id-to-value and images' URL used as background
     *
     * @returns {String} Base64 representation of the file
     */
    JP_TaxFormPDFRenderer.prototype.generatePDFForTaxForm = (params)=>{
        let formDefinition = new FormDefinition();
        let uuid = formDefinition.formDefinition.html_uuid;
        let fileDAO = new FileDAO();
        let filesInAssetsDir = fileDAO.getFilesInFolder(uuid);
        let renderer = new Renderer();
        let numPages = params.hasOwnProperty('fieldValues') ? params.fieldValues.numPages : '';
        return renderer.createPdfFile({
            xmlContents: renderer.renderTemplateWithDataSourcesAsString({
                templateContent: getTemplateContent({uuid:uuid, filesInAssetsDir:filesInAssetsDir, numPages:numPages}),
                dataSources: [
                    {
                        format: 'object',
                        alias: 'data',
                        data: params.fieldValues
                    },
                    {
                        format: 'object',
                        alias: 'assets',
                        data: getImagesUrl({filesInAssetsDir:filesInAssetsDir})
                    }
                ]
            })
        }).getContents()
    };

    /**
     * Get the template to be used for rendering Japan Deductible Tax Form
     *
     * @param params.uuid {String} UUID of assets folder containing the templates
     * @param params.filesInAssetsDir {Object} List of files located on a specific folder
     *
     */
    function getTemplateContent(params){
        try{
            let filesInAssetsDir = params.filesInAssetsDir;
            let uuid = params.uuid;
            let fileDAO = new FileDAO();
            let styleHeaderContents = fileDAO.getFileObj({uuid: uuid,
                filename: 'japan_loc_deductible_tax_calc_form_header.xml'}).getContents();

            if(params.numPages === 4){
                PRINT_TEMPLATES = NON_LEGACY_TEMPLATES;
            }

            let templateContentsArr = PRINT_TEMPLATES.filter(function(printTemplate){
                return filesInAssetsDir[printTemplate];
            }).map(function(pTemplate){
                return file.load({id: filesInAssetsDir[pTemplate].id}).getContents();
            });
            return [XML_PDF_HEADER, styleHeaderContents, '<body class="calc-form-container">',
                templateContentsArr.join('<pbr pagenumber="1" />'), FOOTER].join('')
        } catch(ex){
            log.error({
                title: 'JP_TaxFormPDFRenderer#getTemplateContent',
                details: JSON.stringify(ex)
            });
            ex.errorCode = 'TEMPLATE_MERGING_ERROR';
            throw ex;
        }

    }

    /**
     * Get URL for background images for the PDF print templates
     *
     * @param params.filesInAssetsDir {Object} List of files located on a specific folder
     *
     */
    function getImagesUrl(params){
        try{
            let filesInAssetsDir = params.filesInAssetsDir;
            let imagesUrlObj = {};
            TEMPLATE_IMAGES.forEach((image) => {
                imagesUrlObj[image] = (filesInAssetsDir[image].url).replace(/&/g,'&#38;');
            });
            return imagesUrlObj;
        } catch(ex){
            log.error({
                title: 'JP_TaxFormPDFRenderer#getImagesUrl',
                details: JSON.stringify(ex)
            });
            ex.errorCode = 'IMAGE_URL_RETRIEVAL_ERROR';
            throw ex;
        }
    }

    return JP_TaxFormPDFRenderer;

});
