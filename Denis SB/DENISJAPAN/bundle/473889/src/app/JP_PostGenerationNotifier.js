/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NModuleScope SameAccount
 * @NApiVersion 2.1
 */

define(["N/record",
	"N/url",
	"../lib/JP_TCTranslator",
	"../lib/JP_StringUtility",
	"N/email"],
    (record, url, translator, StringUtility, email) => {

    function PostGenerationNotifier() {}

    PostGenerationNotifier.prototype.notifyCreator =  (owner, fileAttributes) => {
    	let IS_SUBJECT = "IDS_GEN_COMPLETE";
        let IS_MESSAGE = "IDS_GEN_COMPLETE_MESSAGE";
        let texts = new translator().getTexts([IS_SUBJECT, IS_MESSAGE], true);

        let templateSubject = texts[IS_SUBJECT];
        let template = texts[IS_MESSAGE];
        let host = url.resolveDomain({hostType:url.HostType.APPLICATION});
        let fileLinks = "";

        fileAttributes.forEach(function(fileAttrib){
             fileLinks += '<a href=\'https://'+host + fileAttrib.url+ '\'>'+fileAttrib.file+'</a><br />';
        });

        let parameters = {LINKS: fileLinks};
        let stringUtil = new StringUtility(template);
        let message = stringUtil.replaceParameters(parameters);

        email.send({
            author: owner,
            recipients: [owner],
            subject: templateSubject,
            body: message,
        });

        return true;
    };

    return PostGenerationNotifier;
});
