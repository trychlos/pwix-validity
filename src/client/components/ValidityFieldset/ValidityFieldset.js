/*
 * pwix:validity/src/client/components/ValidityFieldset/ValidityFieldset.js
 *
 * Parms:
 * - startDate: the starting effect date (as a Date), or null
 * - endDate: the ending effect date (as a Date), or null
 */

import { DateJs } from 'meteor/pwix:date';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';

import './ValidityFieldset.html';

const logger = Logger.get();

Template.ValidityFieldset.onCreated( function(){
    const self = this;
    //logger.debug( 'onCreated', Template.currentData().index );

    self.PCK = {
        dates: new ReactiveDict()
    };

    // initialize the dict to be able to return it on demand
    self.autorun(() => {
        self.PCK.dates.set( 'validity-start', Template.currentData().startDate || null );
        self.PCK.dates.set( 'validity-end', Template.currentData().endDate || null );
        //logger.debug( Template.currentData(), self.PCK.dates.all());
    });
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
            if( DateJs.compare( def, this.startDate ) < 0 ){
                def = this.startDate;
            }
        }
        const parms = {
            name: 'validity-end',
            value: this.endDate,
            defaultValue: def,
            withHelp: true
        };
        //logger.debug( 'end parms', parms, this.index );
        return parms;
    },

    // parameters for DateInput on start date
    parmsStartDate(){
        let def = this.startDate;
        if( !def ){
            def = new Date();
            if( DateJs.compare( def, this.endDate ) > 0 ){
                def = this.endDate;
            }
        }
        const parms = {
            name: 'validity-start',
            value: this.startDate,
            defaultValue: def,
            withHelp: true
        };
        //logger.debug( 'start parms', parms, this.index );
        return parms;
    }
});

Template.ValidityFieldset.events({
    // date entered in DateInput component
    'date-input-data .ValidityFieldset'( event, instance, data ){
        //logger.debug( event, data );
        instance.PCK.dates.set( data.name, data.date );
        instance.$( '.ValidityFieldset' ).trigger( 'validity-fieldset-data', instance.PCK.dates.all());
    }
});

Template.ValidityFieldset.onDestroyed( function(){
    const self = this;
    //logger.debug( 'onDestroyed', Template.currentData().index );
});
