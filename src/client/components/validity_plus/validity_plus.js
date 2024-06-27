/*
 * /imports/organization/contents/validity_plus/validity_plus.js
 *
 * Validities 'plus' button'.
 *
 * Parms:
 * - classes: the classes to be added to be the button
 *      e.g. 'nav-link', or 'btn btn-sm', or...
 * - holes: if set (to a ReactiveVar), the button will open a dropdown menu
 * - period: if set, the data which will be attached to the click event on the button
 *      'period' and 'holes' should not be set together
 * - newPeriodCb: a function to be called on item selection
 *      argument will be the selection free validity period
 */

import { DateJs } from 'meteor/pwix:date';
import { pwixI18n } from 'meteor/pwix:i18n';

import './validity_plus.html';

Template.validity_plus.helpers({
    // whether the button is enabled or disabled
    btnDisabled(){
        return this.period || ( this.holes && this.holes.get().length > 0 ) ? '' : 'disabled';
    },

    // open the dropdown menu when enabled
    btnToggle(){
        return this.holes && this.holes.get().length > 0 ? 'dropdown' : '';
    },

    // when have a 'period' parm, attach it to the button
    dataPeriod(){
        return this.period ? JSON.stringify( this.period ) : '';
    },

    // whether we have any free validity period ?
    haveHoles(){
        return Boolean( this.holes && this.holes.get().length > 0 );
    },

    // list all free validity periods
    holes(){
        return this.holes.get() || [];
    },

    // set the period array as the item
    itemData( p ){
        return JSON.stringify( p );
    },

    // label each free validity period
    //  a validity period cannot be from infinite to infinite
    itemLabel( p ){
        let res = '';
        if( !DateJs.isValid( p.start )){
            res =pwixI18n.label( I18N, 'validities.plus.upto', DateJs.toString( p.end ));
        } else if( !DateJs.isValid( p.end )){
            res = pwixI18n.label( I18N, 'validities.plus.from', DateJs.toString( p.start ));
        } else {
            res = pwixI18n.label( I18N, 'validities.plus.fromto', DateJs.toString( p.start ), DateJs.toString( p.end ));
        }
        return res;
    }
});

Template.validity_plus.events({
    'click a.dropdown-item'( event, instance ){
        // data() returns a javascript object (not a json) with dates as strings
        //  while attr() returns the previously set JSON
        const period = instance.$( event.currentTarget ).data( 'validity-plus' );
        if( this.newPeriodCb ){
            this.newPeriodCb( period );
            //return false; // let the menu be closed
        } else {
            console.warn( 'no defined callback', period );
        }
    },

    'click button#validity-plus-btn'( event, instance ){
        if( this.period ){
            if( this.newPeriodCb ){
                this.newPeriodCb( this.period );
                return false;
            } else {
                console.warn( 'no defined callback', this.period );
            }
        }
    }
});
