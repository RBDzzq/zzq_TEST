/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/render'], function(file, render) {

    

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        // テンプレートを取得する
        var reportFile = file.load({
            id : 'テンプレート/PDFテンプレート/前金請求書PDF_2023724_1416412.ftl'
        });
        var reportTemplate = reportFile.getContents();

        // データPDFを作成する
        var pdfRender = render.create();
        pdfRender.templateContent = reportTemplate;

        // データを設定する
        var headerDic = {};
        pdfRender.addCustomDataSource({
            format : render.DataSource.OBJECT,
            alias : "headerDic",
            data : headerDic
        });

        // テンプレートを作成する
        var pdfTemplete = pdfRender.renderAsString();

        var pdfFile = render.xmlToPdf({
            xmlString : pdfTemplete
        });

        // PDFを出力する
        context.response.writeFile(pdfFile, true);
    }

    return {
        onRequest : onRequest
    };
});
