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
            dt_tabular: false,
            help_line: pwixI18n.label( I18N, 'help.entity_line' )
        },
        {
            name: 'effectStart',
            type: Date,
            optional: true,
            dt_tabular: false,
            form_check: Validity.checks.effectStart,
            form_status: Forms.FieldType.C.OPTIONAL,
            help_line: pwixI18n.label( I18N, 'help.start_line' )
        },
        {
            name: 'effectEnd',
            type: Date,
            optional: true,
            dt_tabular: false,
            form_check: Validity.checks.effectEnd,
            form_status: Forms.FieldType.C.OPTIONAL,
            help_line: pwixI18n.label( I18N, 'help.end_line' )
        }
    ];
};
