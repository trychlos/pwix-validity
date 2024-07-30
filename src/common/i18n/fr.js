/*
 * pwix:validity/src/common/i18n/fr.js
 */

Validity.i18n = {
    ...Validity.i18n,
    ...{
        fr: {
            band: {
                free_from: 'Disponible depuis le %s',
                free_fromto: 'Disponible du %s au %s',
                free_to: 'Disponible jusqu\'au %s',
                used_from: 'Utilisée depuis le %s',
                used_fromto: 'Utilisée du %s au %s',
                used_fromto_infinite: 'Utilisée de l\'infini à l\'infini',
                used_to: 'Utilisée jusqu\'au %s'
            },
            check: {
                end_incompatible: 'La date de fin est incompatible avec les autres périodes de validité',
                invalid_date: 'La date n\'est pas valide',
                invalid_period: 'Les dates de début et de fin ne font pas un intervalle valide',
                start_incompatible: 'La date de début est incompatible avec les autres périodes de validité'
            },
            help: {
                end_line: 'La date de fin de la période de validité (jusqu\'à l\'infini si nulle)',
                entity_line: 'L\'identifiant de l\'entité',
                start_line: 'La date de début de la période de validité (depuis l\'infini si nulle)'
            },
            panel: {
                confirm_mergeleft: 'Fusionner avec la période précédente signifie conserver ces données affichées, tout en consolidant les périodes de validité.<br />Etes-vous sûr ?',
                confirm_mergeright: 'Fusionner avec la période suivante signifie conserver ces données affichées, tout en consolidant les périodes de validité.<br />Etes-vous sûr ?',
                confirm_remove: 'Vous êtes sur le point de supprimer une période de validité.<br />Etes-vous sûr ?',
                end_legend: 'Valide jusqu\'au',
                from: 'Depuis le %s',
                fromto: 'Du %s au %s',
                infinite: 'infini',
                start_legend: 'Valide depuis le',
                text_empty: 'Aucune période de validité n\'est actuellement disponible.<br />'
                    +'Vous pouvez en définir une nouvelle en réduisant une ou plusieurs périodes de validité actuellement enregistrée(s).',
                text_one: 'Les périodes suivantes ne sont couvertes par aucun des enregistrements actuels.<br />'
                    +'Si ce n\'est pas ce que vous souhaitez, vous devriez étendre certaines périodes de validité.',
                title_mergeleft: 'Fusionner avec la période précédente',
                title_mergeright: 'Fusionner avec la période suivante',
                title_remove: 'Supprimer une période',
                to: 'Jusqu\'au %s'
            },
            plus: {
                from: 'Depuis le %s',
                fromto: 'Du %s au %s',
                upto: 'Jusqu\'au %s'
            },
            select: {
                def_label: 'Sélectionnez la période de validité souhaitée',
                from: 'Depuis le %s',
                full: 'Période complète',
                fromto: 'Du %s au %s',
                to: 'Jusqu\'au %s'
            },
            tab: {
                from: 'Depuis le %s',
                full: 'Période complète',
                holes: 'Disponibilités',
                mergeleft: 'Fusionner avec la période précédente',
                mergeright: 'Fusionner avec la période suivante',
                mi_info: 'Informations sur l\'enregistrement',
                mi_title: 'Informations',
                remove: 'Supprimer la période',
                to: 'Jusqu\'au %s'
            }
        }
    }
};
