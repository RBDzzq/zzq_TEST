/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["./JP_BaseDAO", "./JP_FolderDAO", "N/search", 'N/file', 'N/error'],

(BaseDAO, JP_FolderDAO, search, file, error) => {

	function FileDAO(){
            BaseDAO.call(this);
            this.fields = {};
            this.searchId = '';
            this.recordType = "file";
        }

        util.extend(FileDAO.prototype, BaseDAO.prototype);

    FileDAO.prototype.getStatementTemplates=function() {
            let folderDAO = new JP_FolderDAO();
            let folder = folderDAO.getFolderByNameAndParent("Invoice Summary Templates");
            let columns = [{name:'internalid'}, {name:'name'}];
            let filters = [{name:'folder', operator:search.Operator.IS, values: folder.id}];

            let fileSearch = this.createSearch();
            fileSearch.filters = filters;
            fileSearch.columns = columns;

            let files = [];
            let iterator = this.getResultsIterator(fileSearch);
            while (iterator.hasNext()){
                let result = iterator.next();
                files.push({
                    id : result.id,
                    name : result.getValue({name:'name'})
                });
            }

            return files;
        };

        /**
         * @param  {String} params.uuid
         * @param  {String} params.filename
         * @return {String} path of the filename
         */
        FileDAO.prototype.getFileObj=function(params){

            let folderId = this.getUUIDFolderId(params.uuid);

            this.columns = [];
            this.filters = [
                ['folder', search.Operator.IS, folderId], 'and',
                ['name', search.Operator.IS, params.filename]
            ];
            let fileNameSearch = this.createSearch();

            let searchResult = fileNameSearch.run().getRange({
                start: 0,
                end: 2
            });

            if (searchResult.length > 1) {
                log.error('More than one file with the same filename has been found.');
                return {};
            }
            else if (searchResult.length === 0){
                log.error('No file with the same filename has been found.');
                return {};
            }
            else {
                return file.load({
                    id: searchResult[0].id
                });
            }
        };

        /**
         * Gets the folder id of a supplied uuid file
         * @param uuid {String} the uuid file we want to search.
         * @return id {numeric} the folder id where the uuid file is located.
         */
        FileDAO.prototype.getUUIDFolderId=function(uuid){
            let uuidMatchedArr = [];

            this.columns = ['name', 'folder'];
            this.filters = ['name', search.Operator.IS, uuid];
            let fileSearch = this.createSearch();
            let iterator = this.getResultsIterator(fileSearch);
            while (iterator.hasNext()) {
                let result = iterator.next();
                uuidMatchedArr.push(result);
            }

            if (uuidMatchedArr.length === 0) {
                throw error.create({
                    name: 'NO_DIR_FOUND',
                    message: 'Directory not found'
                });
            }
            else if (uuidMatchedArr.length > 1) {
                throw error.create({
                    name: 'DIR_NOT_UNIQUE',
                    message: 'Matching directory not unique.'
                });
            }

            return uuidMatchedArr[0].getValue({name: 'folder'});
        };

        /**
         * gets all the files within the folder where the uuid is located
         * @param uuid {String} attr of file obj that should be returned
         * @return {Object} Mapping of the filename id pair.
         *
         */
        FileDAO.prototype.getFilesInFolder=function(uuid){
            let folderId = this.getUUIDFolderId(uuid);
            let results = {};

            if(folderId){
                this.columns = ['name', 'url'];
                this.filters = [
                    ['folder', search.Operator.IS,  folderId], 'and',
                    ['name',  search.Operator.ISNOT, uuid ] ];

                this.createSearch().run()
                    .each((fileObj)=>{
                        results[fileObj.getValue('name')] = { id: fileObj.id, url: fileObj.getValue({name:'url'}) };
                        return true;
                    });
            }
            return results;
        };

        /**
         * @param attr {String} attr of file obj that should be returned
         * @param params.filename
         * @param params.uuid
         */
        FileDAO.prototype.getFileAttr=function(attr, params){
            let sharedModuleFileObj
            try {
                sharedModuleFileObj = this.getFileObj(params);
                if (!sharedModuleFileObj) {
                    throw error.create({
                        name: 'SHARED_MODULE_NOT_FOUND',
                        message: 'Shared module file is not in File Cabinet'
                    });
                }
            } catch (loadEx) {
                throw error.create({
                    name: 'LOAD_FILE_ERROR',
                    message: 'Could not load file'
                });
            }
            return sharedModuleFileObj[attr];
        };

        /**
         * Get the API path give uuid and filename
         * Perform search first on the UUID and load it as a file object.
         * Derive the full path of the API file by using the UUID file's path
         *
         * @param params.filename
         * @param params.uuid
         * @param params
         */
        FileDAO.prototype.getApiFullPath=function(params){
            let uuidFullPath = this.getFileAttr('path', {filename: params.uuid, uuid: params.uuid});
            return uuidFullPath.replace('.bin', '').replace(params.uuid, params.filename);
        };

        /**
         * Get the full path of EP's Localization API
         * @returns {String} the full path of EP Localization Api
         */
        FileDAO.prototype.getEpApiFullPath=function(){
            let EP_API_UUID = '9b7c40f5-d1e0-415d-a8f7-2a853f761075';
            let EP_API_FILENAME = '12194_LocalizationApi.js';
            return this.getApiFullPath({filename: EP_API_FILENAME, uuid: EP_API_UUID});
        };

        /**
         * @param params.filename
         * @param params.uuid
         * @param params
         */
        FileDAO.prototype.getFileId=function(params){
            return this.getFileAttr('id', params);
        };

        /**
         * Search the file cabinet for path of specified file
         *
         * @param {String} name
         * @returns {Object}
         */
        FileDAO.prototype.getFilePath=function(name) {

            let fileResult;
            this.columns = [];
            this.filters = ['name', search.Operator.IS, name];
            let fileSearch = this.createSearch();

            fileSearch.run().each((result)=>{
                let fileObj = file.load({
                    id: result.id
                });

                fileResult = {
                    id: result.id,
                    path: fileObj.path
                };
            });

            return fileResult;
        };

    return FileDAO;

});
