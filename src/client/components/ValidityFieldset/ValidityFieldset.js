/*
 * /imports/client/components/ValidityFieldset/ValidityFieldset.js
 *
 * Parms:
 * - startDate: the starting effect date (as a Date), or null
 * - endDate: the ending effect date (as a Date), or null
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';

import './ValidityFieldset.html';

Template.ValidityFieldset.onCreated( function(){
    const self = this;

    self.PCK = {
        dates: new ReactiveDict()
    };
});

Template.ValidityFieldset.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // parameters for DateInput on end date
    parmsEndDate(){
        let def = this.endDate;
        if( !def ){
            def = new Date();
            if( Validity.Date.compare( def, this.startDate ) < 0 ){
                def = this.startDate;
            }
        }
        return {
            name: 'validity-end',
            value: this.endDate,
            defaultValue: def
        };
    },

    // parameters for DateInput on start date
    parmsStartDate(){
        let def = this.startDate;
        if( !def ){
            def = new Date();
            if( Validity.Date.compare( def, this.endDate ) > 0 ){
                def = this.endDate;
            }
        }
        return {
            name: 'validity-start',
            value: this.startDate,
            defaultValue: def
        };
    }
});

Template.ValidityFieldset.events({
    // date entered in DateInput component
    'date-input-data .ValidityFieldset'( event, instance, data ){
        //console.debug( event.type, data );
        instance.PCK.dates.set( data.name, data.date );
        instance.$( '.ValidityFieldset' ).trigger( 'validity-fieldset-data', instance.PCK.dates.all());
    }
});
