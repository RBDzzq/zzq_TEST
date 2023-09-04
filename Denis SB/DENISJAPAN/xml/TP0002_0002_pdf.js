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

        // �e���v���[�g���擾����
        var reportFile = file.load({
            id : '�e���v���[�g/PDF�e���v���[�g/�O��������PDF_2023724_1416412.ftl'
        });
        var reportTemplate = reportFile.getContents();

        // �f�[�^PDF���쐬����
        var pdfRender = render.create();
        pdfRender.templateContent = reportTemplate;

        // �f�[�^��ݒ肷��
        var headerDic = {};
        pdfRender.addCustomDataSource({
            format : render.DataSource.OBJECT,
            alias : "headerDic",
            data : headerDic
        });

        // �e���v���[�g���쐬����
        var pdfTemplete = pdfRender.renderAsString();

        var pdfFile = render.xmlToPdf({
            xmlString : pdfTemplete
        });

        // PDF���o�͂���
        context.response.writeFile(pdfFile, true);
    }

    return {
        onRequest : onRequest
    };
});
