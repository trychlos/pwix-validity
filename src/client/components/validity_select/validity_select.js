/*
 * /imports/client/components/validity_select/validity_select.js
 *
 * Propose to the user to change the current validity period.
 * Default is the closest.
 *
 * Parms:
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
 */

import { DateJs } from 'meteor/pwix:date';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import './validity_select.html';

Template.validity_select.onCreated( function(){
    const self = this;

    self.APP = {
        // the current selected organization group
        group: new ReactiveVar( null ),
        // the list of validity periods as a hash id: label
        periods: new ReactiveVar( {} ),

        startField: Template.currentData().start || 'effectStart',
        endField: Template.currentData().end || 'effectEnd',
    };

    // be up to date about current group
    self.autorun(() => {
        self.APP.group.set( Meteor.APP.OrganizationContext.currentGroup());
    });

    // build the validity periods labels
    self.autorun(() => {
        const group = self.APP.group.get();
        let list = {};
        if( group ){
            const closest = Meteor.APP.OrganizationContext.currentClosest();
            group.items.every(( it ) => {
                let label = '';
                if( DateJs.isValid( it[self.APP.startField] )){
                    if( DateJs.isValid( it[self.APP.endField] )){
                        label = pwixI18n.label( I18N, 'validities.select.fromto', DateJs.toString( it[self.APP.startField] ), DateJs.toString( it[self.APP.endField] ));
                    } else {
                        label = pwixI18n.label( I18N, 'validities.select.from', DateJs.toString( it[self.APP.startField] ));
                    }
                } else if( DateJs.isValid( it[self.APP.endField] )){
                    label = pwixI18n.label( I18N, 'validities.select.to', DateJs.toString( it[self.APP.endField] ));
                } else {
                    label = pwixI18n.label( I18N, 'validities.select.full' );
                }
                list[it._id] = {
                    label: label,
                    closest: it._id === closest._id
                };
                return true;
            });
        }
        self.APP.periods.set( list );
    });
});

Template.validity_select.helpers({
    // is there a current selected validity period ?
    hasCurrent(){
        const group = Template.instance().APP.group.get();
        return group && group.items.length === 1;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // computed label
    itLabel( it ){
        const periods = Template.instance().APP.periods.get();
        return Object.keys( periods ).includes( it ) ? periods[it].label : '';
    },

    // whether this option defaults to be selected ? (if closest)
    itSelected( it ){
        const periods = Template.instance().APP.periods.get();
        return Object.keys( periods ).includes( it ) && periods[it].closest === true ? 'selected' : '';
    },

    // list of validity periods
    itemsList(){
        return Object.keys( Template.instance().APP.periods.get());
    },

    // the whole select element is disabled if we don't have any current group,
    //  or the group has only one validity period
    selectDisabled(){
        const group = Template.instance().APP.group.get();
        const enabled = group && group.items.length > 1;
        return enabled ? '' : 'disabled';
    }
});

Template.validity_select.events({
    // set the current validity
    'change .c-validity-select'( event, instance ){
        const selected = instance.$( '.c-validity-select select option:selected' ).val();
        instance.$( '.c-validity-select' ).trigger( 'validity-select', { selected: selected });
    },

    // when the organization change, invalidates the validities list
    'validities-invalidate .c-validity-select'( event, instance ){
        instance.APP.group.set( null );
        instance.APP.periods.set( {} );
    }
});
