/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["N/record",
    "N/runtime",
    "../data/NQuery/JP_NSubsidiaryDAO",
    "../data/JP_CompanyDAO",
    "../data/JP_FolderDAO"
],
    (record, runtime, SubsidiaryDAO, CompanyDAO,
            FolderDAO) =>  {

    let folderDao;
	let IDS_STMT_FOLDER_LABEL = "Invoice Summaries";

	class InvoiceSummaryDirectoryManager {

        getFolder(subsidiary){
            let folderId = this.getIDSStatementFolder(subsidiary);

            folderDao = new FolderDAO();

            //verify if the folder exists and it is inside the "Invoice Summaries Folder"
            let folderPath = folderDao.getFolderPath(folderId);

            if(!folderId || (folderPath && folderPath.indexOf(IDS_STMT_FOLDER_LABEL) === -1)
                || (folderId && folderPath.indexOf(IDS_STMT_FOLDER_LABEL) === -1)){
                folderId = this.createIDSStatementFolder();
            }

            return folderId;
        };

        getIDSStatementFolder(subsidiary){
            let folderId = null;
            if(subsidiary && runtime.isFeatureInEffect({feature:'SUBSIDIARIES'})) {
                let nSubsidiaryDAO = new SubsidiaryDAO();
                nSubsidiaryDAO.getData(subsidiary);
                folderId = nSubsidiaryDAO.fields.invSummaryFolder.val;
            } else {
                let compDAO = new CompanyDAO();
                folderId = compDAO.getInvSummaryFolder();
            }

            return folderId;
        }

        createIDSStatementFolder(){
            let folder = folderDao.getFolderByNameAndParent(IDS_STMT_FOLDER_LABEL);
            let folderId;

            if(folder){
                folderId = folder.id;
            }
            else{
                folder = {};
                folder.name = IDS_STMT_FOLDER_LABEL;
                let createdFolder = record.create({type: record.Type.FOLDER});
                createdFolder.setValue({fieldId: "name", value: IDS_STMT_FOLDER_LABEL});
                folderId = createdFolder.save();
            }

            return folderId;
        }

    }

	return InvoiceSummaryDirectoryManager;
});
