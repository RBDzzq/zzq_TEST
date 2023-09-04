/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["./JP_BaseDAO", "../lib/JP_StringUtility", "N/search"],

    (BaseDAO, StringUtility, search) =>{

        function FolderDAO(){
                BaseDAO.call(this);
                this.fields = {};
                this.searchId = '';
                this.recordType = search.Type.FOLDER;
                this.accountFolders = null;
                this.DEFAULT_INVSUM_FOLDER = "Invoice Summaries";
            }

            util.extend(FolderDAO.prototype, BaseDAO.prototype);

        FolderDAO.prototype.getFolderByNameAndParent=function(folderName, parent) {
                let columns = [{name:'internalid'}];
                let filters = [{name:'name', operator:search.Operator.IS, values: folderName}];

                if (parent) {
                    filters.push({name:'parent', operator:search.Operator.IS, values: parent})
                }else{
                    filters.push({name:'parent', operator:search.Operator.ISEMPTY, values: null})
                }

                let entitySearch = this.createSearch();
                entitySearch.filters = filters;
                entitySearch.columns = columns;

                let folderObj;
                let iterator = this.getResultsIterator(entitySearch);
                if (iterator.hasNext()){
                    let result = iterator.next();
                    folderObj = {};
                    folderObj.id = result.id;
                }

                return folderObj;
            };

        FolderDAO.prototype.getInstances=function(folderName) {
                let columns = [{name:'internalid'}];
                let filters = [{name:'name', operator:search.Operator.IS, values: folderName}];

                let folderSearch = this.createSearch();
                folderSearch.filters = filters;
                folderSearch.columns = columns;

                let folderInstances = [];
                let iterator = this.getResultsIterator(folderSearch);
                while (iterator.hasNext()){
                    let result = iterator.next();
                    folderInstances.push(result.id);
                }
                return folderInstances;
            };

        FolderDAO.prototype.getFolderPath=function(folderId) {

                if(!this.accountFolders){
                    this.accountFolders = {};
                    let columns = [{name:'name'},{name:'parent'}];
                    let folderSearch = this.createSearch();
                    folderSearch.columns = columns;
                    let iterator = this.getResultsIterator(folderSearch);
                    while(iterator.hasNext()){
                        let result = iterator.next();
                        this.accountFolders[result.id] = {name:result.getValue('name'),parent:result.getValue('parent')};
                    }
                }

                return new StringUtility().getStringPathFromRoot(this.accountFolders, folderId);
            };

            /**
             * Determine if a given path to a folder exists in the File Cabinet
             * @param folderPath Slash-delimited folder path
             * @param targetFolder Target folder should exist in the path
             * @returns int Folder internalid
             */
            FolderDAO.prototype.doesExist=function(folderPath, targetFolder) {

                if(!folderPath || !targetFolder){
                    return null;
                }

                let folderComponents = folderPath.split('/');
                if(folderComponents.indexOf(targetFolder) === -1){
                    return null;
                }

                // Get folder id of top-most parent
                let rootId = null;
                let parentFolderName = folderComponents.shift();
                let parentFolderSearch = this.createSearch();
                parentFolderSearch.filters = [
                    {name:'name', operator:search.Operator.IS, values:parentFolderName},
                    {name:'istoplevel', operator:search.Operator.IS, values:true}
                ];
                let parentIter = this.getResultsIterator(parentFolderSearch);
                if(parentIter.hasNext()){
                    rootId = parentIter.next().id;
                }else{
                    return null;
                }

                // Get all sub-folders of parent
                let folderSearch = this.createSearch();
                folderSearch.filters = [{name:'predecessor', operator:search.Operator.ANYOF, values:[rootId]}];
                folderSearch.columns = [{name:'name'},{name:'parent'}];

                let subFolderObj = {};
                let folderIter = this.getResultsIterator(folderSearch);
                while(folderIter.hasNext()){
                    let result = folderIter.next();
                    subFolderObj[result.getValue('name') + '_' + result.getValue('parent')] = result.id;
                }

                // Trace path to leaf folder
                let currentFolder = rootId;
                for(let folder in folderComponents){
                    let newParent = subFolderObj[folderComponents[folder]+'_'+currentFolder];
                    if(newParent){
                        currentFolder = newParent;
                    }else{
                        return null;
                    }
                }

                return currentFolder;
            };

        FolderDAO.prototype.getFolderTree=function(folderId, folderName) {

                let filters = [{name:'predecessor', operator:search.Operator.ANYOF, values:[folderId]}];
                let columns = [{name:'name'},{name:'parent'}];

                let folderSearch = this.createSearch();
                folderSearch.filters = filters;
                folderSearch.columns = columns;

                let folderObjArr = [];
                let iterator = this.getResultsIterator(folderSearch);
                while(iterator.hasNext()){
                    let result = iterator.next();
                    if(result.id !== folderId){
                        let folderObj = {id:result.id,name:result.getValue('name'),parent:result.getValue('parent')};
                        folderObjArr.push(folderObj);
                    }
                }

                let rootFolder = {id:folderId,name:folderName,path:folderName};
                let foldersSortedByLevel = [rootFolder];
                let sortedFolders = new StringUtility().sortStringsDFS(folderObjArr, rootFolder);
                return foldersSortedByLevel.concat(sortedFolders);
            }

        return FolderDAO;

    });
