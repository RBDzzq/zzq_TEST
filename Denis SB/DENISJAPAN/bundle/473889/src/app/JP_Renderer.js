/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['N/render', 'N/file'],

 (render, file) => {

    let PDF = 'pdf';

    function JP_Renderer(){
        this.name = 'JP_Renderer'
    }

    /**
     * Using n/render#xmlToPdf, create a pdfFile. The file will not be saved in the FileCabinet though. This will
     * return an instance of file.File
     *
     * @param params.filename {String}
     * @param params.xmlContents {String}
     * @param params.folderId {Id}
     * @param params
     *
     * @returns {file.File}
     */
    JP_Renderer.prototype.createPdfFile = (params)=> {
        try {
            let pdfFile = render.xmlToPdf({xmlString: params.xmlContents});
            if(params.filename) {
                let fileName = [params.filename, PDF].join(".");
                pdfFile.name = fileName;
                if (params.folderId) {
                    pdfFile.folder = params.folderId;
                }
            }

            return pdfFile;
        } catch (ex) {
            log.error({title: 'JP_Renderer#createPdfFile', details: JSON.stringify(ex)});
            ex.errorCode = 'RENDERING_XML_TO_PDF';
            throw ex;
        }
    };

    /**
     * Using N/render#renderAsString dataSources (passed as paramaters) for data mapping, render the template.
     *
     * Sample usage:
     *
     * renderer.renderTemplateWithDataSourcesAsString({
                templateContent: '${data.x}',
                dataSources: [{
                    format: 'object',
                    alias: 'data',
                    data: {x: 'Hello'}
                }]
            })
     *
     * @param params.templateContent {String}
     * @param params.dataSources {Array} array of DataSource {format, alias, data}
     *
     * @returns {String} rendered string
     */
    JP_Renderer.prototype.renderTemplateWithDataSourcesAsString = (params)=>{
        try {
            let renderer = render.create();
            renderer.templateContent = params.templateContent;

            params.dataSources.forEach(function(ds){
                switch (ds.format) {
                    case 'object':
                        renderer.addCustomDataSource({
                            format: render.DataSource.OBJECT,
                            alias: ds.alias,
                            data: ds.data
                        });
                        break;
                    case 'json':
                        renderer.addCustomDataSource({
                            format: render.DataSource.JSON,
                            alias: ds.alias,
                            data: ds.data
                        });
                        break;
                    default:
                        break;
                }
            });
            return renderer.renderAsString();
        } catch (ex) {
            log.error({ title: 'JP_Renderer#renderTemplateWithDataSourcesAsString',
                details: JSON.stringify(ex)});
            ex.errorCode = 'RENDER_AS_STRING';
            throw ex;
        }

    };

    return JP_Renderer;

});
