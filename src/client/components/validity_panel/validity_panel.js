/*
 * /imports/organization/contents/validity_panel/validity_panel.js
 *
 * Validities panel.
 *
 * Parms:
 * - holes: a ReactiveVar which holds the array of available validity periods
 * - newPeriodCb: a function to be called on item selection
 *      argument will be the selected free validity period
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import './validity_panel.html';

Template.validity_panel.helpers({

    // set the period array as the data
    btnData( p ){
        return JSON.stringify( p );
    },

    // button is never disabled ?
    btnDisabled( p ){
        return '';
    },

    // title button
    btnTitle( p ){
        let res = '';
        if( !Validity.Date.isValid( p.start )){
            res =pwixI18n.label( I18N, 'panel.to', Validity.Date.toString( p.end ));
        } else if( !Validity.Date.isValid( p.end )){
            res = pwixI18n.label( I18N, 'panel.from', Validity.Date.toString( p.start ));
        } else {
            res = pwixI18n.label( I18N, 'panel.fromto', Validity.Date.toString( p.start ), Validity.Date.toString( p.end ));
        }
        return res;
    },

    // have holes ?
    haveHoles(){
        return Boolean( this.holes.get().length > 0 );
    },

    // starting date
    holeFrom( p ){
        return pwixI18n.label( I18N, 'panel.from', Validity.Date.isValid( p.start ) ? Validity.Date.toString( p.start ) : pwixI18n.label( I18N, 'panel.infinite' ));
    },

    // ending date
    holeTo( p ){
        return pwixI18n.label( I18N, 'panel.to', Validity.Date.isValid( p.end ) ? Validity.Date.toString( p.end ) : pwixI18n.label( I18N, 'panel.infinite' ));
    },

    // holes
    holes(){
        //console.debug( this.periods );
        return this.holes.get();
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // parms for validities_plus button
    parmsValidities( p ){
        return {
            newPeriodCb: this.newPeriodCb || null,
            classes: 'btn btn-sm btn-outline-secondary',
            period: p
        };
    }
});
