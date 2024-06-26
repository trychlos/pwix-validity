/*
 * pwix:validity/src/common/js/i18n.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import '../i18n/en.js';
pwixI18n.namespace( I18N, 'en', Validity.i18n.en );

import '../i18n/fr.js';
pwixI18n.namespace( I18N, 'fr', Validity.i18n.fr );

/**
 * @locus Anywhere
 * @returns {String} the i18n namespace of this package
 */
Validity.i18n.namespace = function(){
    return I18N;
}
