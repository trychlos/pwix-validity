/*
 * pwix:validity/src/client/components/dtValidityDate/dtValidityDate.js
 *
 * This template can be used to display a date in a tabular display.
 * 
 * Parms:
 * - date: the date to be displayed as a Date object
 */

import { DateJs } from 'meteor/pwix:date';

import './dtValidityDate.html';

Template.dtValidityDate.helpers({
    // the date to be displayed
    display(){
        return DateJs.toString( this.date );
    }
});
