/*
 * pwix:validity/src/common/js/fieldset.js
 */

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';

Validity.recordsFieldDef = function(){
    return [
        {
            name: 'entity',
            type: String,
            dt_visible: false,
            help_line: pwixI18n.label( I18N, 'help.entity_line' )
        },
        {
            name: Validity.configure().effectStart,
            type: Date,
            optional: true,
            dt_visible: false,
            dt_className: 'dt-center',
            dt_template: Meteor.isClient && Template.dtValidityDate,
            form_check: Validity.checks.effectStart,
            form_type: Forms.FieldType.C.OPTIONAL,
            help_line: pwixI18n.label( I18N, 'help.start_line' )
        },
        {
            name: Validity.configure().effectEnd,
            type: Date,
            optional: true,
            dt_visible: false,
            dt_className: 'dt-center',
            dt_template: Meteor.isClient && Template.dtValidityDate,
            form_check: Validity.checks.effectEnd,
            form_type: Forms.FieldType.C.OPTIONAL,
            help_line: pwixI18n.label( I18N, 'help.end_line' )
        }
    ];
};
