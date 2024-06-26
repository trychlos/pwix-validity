/*
 * /imports/client/components/date_input/date_input.js
 *
 * A component for date input and visual validation by the user:
 * - have an input field with a date picker
 * - have a validation text on the right, so that the user may visually check his date
 *
 * Parms:
 * - name: optional name
 * - value: the intial date (if any)
 * - defaultValue: the default value when selecting a date, defaulting to date of day
 * - input_format: the desired input format, defaulting to '%Y-%m-%d'
 * - placeholder: the desired placeholder, no default
 * - help_format: the desired help format, defaulting to '%e %b %Y'
 * - withHelp: whether we make use of help format, defaulting to true
 * - withBootstrapClasses: whether the caller makes use of Bootstrap classes to indicate validity status (increasing width), defaulting to false
 * - withCheckIndicator: whether the caller makes use of the coreFieldCheckIndicator CoreApp component to indicate validity status (adding an element), defaulting to false
 *
 * Triggers a 'date-input-data' event with the date as a Date (or null if invalid).
 */

import { CoreApp } from 'meteor/pwix:core-app';
import { ReactiveVar } from 'meteor/reactive-var';
import { Random } from 'meteor/random';

import './date_input.html';

Template.date_input.onCreated( function(){
    const self = this;

    self.APP = {
        id: 'id-' + Random.id(),
        name: Template.currentData().name || 'date-input',
        input_format: Template.currentData().input_format || '%F',
        help_format: Template.currentData().help_format || '%e %b %Y',
        placeholder: Template.currentData().placeholder || '',
        jqInput: null,
        initialized: new ReactiveVar( false ),

        // update the help text and send the data event
        help(){
            if( self.view.isRendered ){
                const str = self.$( '.c-date-input input' ).val();
                const d = Validity.Date.sanitize( str );
                const help = d ? Validity.Date.toString( d, { format: self.APP.help_format }) : '&nbsp;';
                self.$( '.c-date-input p.help' ).html( help );
                self.$( '.c-date-input' ).trigger( 'date-input-data', { name: self.APP.name, date: d });
            }
        }
    };
    // because a value of a hash cannot be computed based on another value of this same hash at initialization time
    self.APP.jqInput = Validity.Date.strftime2jquery( self.APP.input_format );
});

Template.date_input.onRendered( function(){
    const self = this;

    // initialize the datepicker DOM element
    const selector = '.c-date-input#'+self.APP.id+' input';
    const defaultValue = Template.currentData().defaultValue || null;
    CoreApp.DOM.waitFor( selector )
        .then(( element ) => {
            self.$( selector ).datepicker({
                dateFormat: self.APP.jqInput,
                defaultDate: defaultValue,
                todayHighlight: true,
                onClose: function( strdate, dp ){
                    const parsed = $.datepicker.parseDate( self.APP.jqInput, strdate );
                    //console.log( 'strdate', strdate, 'parsed', parsed );    // date is the entered date as a string in 'yyyy-mm-dd' format, parsed is a Date
                    //element.dispatchEvent( new Event( 'input', { bubbles: true, cancelable: true }));
                    self.$( selector ).trigger( 'input' );
                    // prevent the focus to go the header cross close button
                    //element.focus();
                    return false;
                }
            });
            self.APP.initialized.set( true );
        });

    // setup the initial value
    self.autorun(() => {
        if( self.APP.initialized.get()){
            self.$( selector ).datepicker( 'setDate', Template.currentData().value );
            self.APP.help();
        }
    });
});

Template.date_input.helpers({
    // the classes of the input field
    dClass(){
        return this.withBootstrapClasses === true ? 'ca-wdate-coched' : 'ca-wdate';
    },

    // the placeholder
    dPlaceholder(){
        return Template.instance().APP.placeholder;
    },

    // the help text
    dHelp(){
        Template.instance().APP.help();
    },

    // whether the caller wants a help text
    hasHelp(){
        return this.withHelp !== false;
    },

    // component random identifier
    id(){
        return Template.instance().APP.id;
    },

    // parms for coreFieldCheckIndicator
    parmsCheckIndicator(){
        return {};
    }
});

Template.date_input.events({
    // open the datepicker when clicking the icon
    'click .js-dp'( event, instance ){
        const $dp = instance.$( event.currentTarget ).closest( '.input-svg-at-end' ).find( 'input' );
        if( $dp.datepicker( 'widget' ).is( ':visible' )){
            $dp.datepicker( 'hide' );
        } else {
            $dp.datepicker( 'show' );
        }
        return false;
    },

    // update the help text depending of the input
    'input .js-date'( event, instance ){
        instance.APP.help();
    }
});
