/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/translation"], (translation)=>{

        class JP_TCTranslation{
            constructor() {
                this.collectionName = 'custcollection_jploc_strings';
                this.defaultAlias = 'texts';
            }

            getTexts(keys, asProp, locale, alias){
                let myAlias = (alias) ? alias : this.defaultAlias;

                let args = {
                    alias: myAlias,
                    collection: this.collectionName,
                    keys: keys
                };

                if(!!locale){
                    args.locales = [locale];
                }

                let localizedStrings = translation.load({
                    collections: [args]
                });

                if(asProp){
                    let texts = {};
                    keys.forEach(function(key){
                        texts[key] = localizedStrings[myAlias][key]();
                    });

                    localizedStrings = texts;
                }

                return localizedStrings;
            };
        }

        return JP_TCTranslation;
    });
