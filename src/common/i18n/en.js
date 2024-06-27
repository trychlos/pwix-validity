/*
 * pwix:validity/src/common/i18n/en.js
 */

Validity.i18n = {
    ...Validity.i18n,
    ...{
        en: {
            band: {
                free_from: 'Free from %s',
                free_fromto: 'Free from %s until %s',
                free_to: 'Free until %s',
                used_from: 'Used from %s',
                used_fromto: 'Used from %s until %s',
                used_fromto_infinite: 'Used from infinite to infinite',
                used_to: 'Used until %s'
            },
            check: {
                end_incompatible: 'Ending date is incompatible with other validity periods',
                invalid_date: 'Date is not valid',
                invalid_period: 'Starting and ending dates do not make a valid interval',
                start_incompatible: 'Starting date is incompatible with other validity periods'
            },
            help: {
                end_line: 'The ending date of the validity period (to infinite if nul)',
                entity_line: 'The entity identifier',
                start_line: 'The starting date of the validity period (from infinite if nul)'
            },
            panel: {
                confirm_mergeleft: 'Merging with previous period means keeping these current data, consolidating the validity periods. Are you sure ?',
                confirm_mergeright: 'Merging with next period means keeping these current data, consolidating the validity periods. Are you sure ?',
                confirm_remove: 'You are about to remove the validity period. Are you sure ?',
                end_legend: 'Valid until',
                from: 'From %s',
                fromto: 'From %s to %s',
                infinite: 'infinite',
                start_legend: 'Valid from',
                text_empty: 'There is currently not any available validity period.<br />'
                    +'You can try to define a new one by decreasing some registered validity period(s).',
                text_one: 'The following periods are not covered by any validity record.<br />'
                    +'If this is not what you want, you have to increase some validity periods.',
                to: 'To %s'
            },
            plus: {
                from: 'From %s',
                fromto: 'From %s to %s',
                upto: 'Up to %s'
            },
            select: {
                def_label: 'Select the applying validity period',
                from: 'From %s',
                full: 'Full time',
                fromto: 'From %s to %s',
                to: 'Up to %s'
            },
            tab: {
                from: 'From %s',
                full: 'Full validity',
                holes: 'Availabilities',
                mergeleft: 'Merge with previous period',
                mergeright: 'Merge with next period',
                mi_info: 'Record informations',
                mi_title: 'Informations',
                remove: 'Remove the period',
                to: 'To %s'
            }
        }
    }
};
