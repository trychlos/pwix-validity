/*
 * /imports/client/components/ValidityTabbed/ValidityTabbed.js
 *
 * Validities tabs manager: run the specified panel inside of our own tabbed component.
 * We manage here one tab per validity records, plus a 'availability' tab which shows available validity periods, plus an 'add' button.
 *
 * This top ValidityTabbed component have one tab per validity period, each of these validity tabs itself
 *  containing all the properties for the edited entity, and so (in the case of an organization for example), several
 *  organization tabs.
 * When needed, validity tabs periods can be identified through the tab identifier allocated and advertized by the coreTabbedTemplate component.
 *
 * Parms:
 * - group: the item group, as an object { entity, items } - null when new
 * - template: the to-be-included Blaze template name
 * - startField: name of the field which contains the starting effect date, defaulting to 'effectStart'
 * - endField: name of the field which contains the ending effect date, defaulting to 'effectEnd'
 * - withValidities: whether we want deal with validity records, defaulting to true
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict; // up to nodejs v16.x

import { Bootbox } from 'meteor/pwix:bootbox';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

//import '/imports/client/components/date_input/date_input.js';
//import '/imports/client/components/validities_band/validities_band.js';
//import '/imports/client/components/validities_fieldset/validities_fieldset.js';
//import '/imports/client/components/validities_panel/validities_panel.js';
//import '/imports/client/components/validities_plus/validities_plus.js';

import './ValidityTabbed.html';

Template.ValidityTabbed.onCreated( function(){
    const self = this;

    self.APP = {
        addons: [
            {
                tab_label: 'validities.tab.holes',
                tab_panel: 'validities_panel'
            }
        ],

        // the name of the fields which contain starting and ending effect dates
        startField: null,
        endField: null,

        // the currently edited items
        //  a copy of the original from group, plus maybe added new validity periods - and at least one item if new
        edited: new ReactiveVar( null ),

        // each time 'edited' changes, recomputes the current vality periods
        periods: new ReactiveVar( [], _.isEqual ),

        // each time, the validity periods change, recompute holes and tabs
        holes: new ReactiveVar( [], _.isEqual ),
        tabs: new ReactiveVar( [], ( a, b ) => { return self.APP.compareTabs( a, b ); }),

        // build the list of tabs
        //  note that the list of tabs only depends on the validity periods - so we also keep the last periods array
        prevPeriods: [],
        buildTabs( edited ){
            let tabs = [];
            for( let i=0 ; i<edited.length ; ++i ){
                tabs.push({
                    navLabel: self.APP.itemLabel( edited[i], i ),
                    paneTemplate: Template.currentData().template,
                    paneData: {
                        ...Template.currentData(),
                        edited: self.APP.edited,
                        item: edited[i]
                    }
                });
            }
            self.APP.addons.every(( it ) => {
                tabs.push({
                    navLabel: pwixI18n.label( I18N, it.tab_label ),
                    paneTemplate: it.tab_panel,
                    paneData: {
                        ...Template.currentData(),
                        holes: self.APP.holes,
                        newPeriodCb: self.APP.onNewPeriod
                    }
                });
                return true;
            });
            tabs.push({
                navTemplate: 'validities_plus',
                navData: {
                    classes: 'nav-link',
                    holes: self.APP.holes,
                    newPeriodCb: self.APP.onNewPeriod
                }
            });
            //console.debug( 'tabs', tabs );
            return tabs;
        },

        // tabs array is a reactive var
        //  in order to only 'set' when it changes, compare the new value with the old one - and actually compare
        compareTabs( a, b ){
            const equals = _.isEqual( self.APP.prevPeriods, self.APP.periods.get());
            if( !equals ){
                self.APP.prevPeriods = _.cloneDeep( self.APP.periods.get());
            }
            return equals;
        },

        // provides the translated label associated with this tab
        itemLabel( it, index ){
            let res = '';
            const appDate = Meteor.APP.Date;
            const thisAPP = self.APP;
            if( !appDate.isValid( it[thisAPP.startField] ) && !appDate.isValid( it[thisAPP.endField] )){
                res = pwixI18n.label( I18N, 'validities.tab.full' );
            } else if( appDate.isValid( it[thisAPP.startField] )){
                res = pwixI18n.label( I18N, 'validities.tab.from', appDate.toString( it[thisAPP.startField] ));
            } else {
                res = pwixI18n.label( I18N, 'validities.tab.to', appDate.toString( it[thisAPP.endField] ));
            }
            // add a dropdown menu for all periods
            return ''
                +'<div class="d-flex justify-content-between align-items-center">'
                +res
                +'<div class="dropdown">'
                +'  <a class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"></a>'
                +'  <ul class="dropdown-menu">'
                + thisAPP.tabDropdown( it, index )
                +'  </ul>'
                +'</div>';
        },

        // merge with previous period
        //  this means we keep the displayed data, removing the previous period data, keeping only its starting date
        mergeLeft( index ){
            let edited = self.APP.edited.get();
            const removed = edited.splice( index-1, 1 );
            edited[index-1][this.startField] = removed[0][this.startField];
            self.APP.edited.set( edited );
            self.APP.tabbedActivate( index-1 );
        },

        // merge with next period
        //  this means we keep the displayed data, removing the next period data, keeping only its ending date
        mergeRight( index ){
            let edited = self.APP.edited.get();
            const removed = edited.splice( index+1, 1 );
            edited[index][this.endField] = removed[0][this.endField];
            self.APP.edited.set( edited );
            self.APP.tabbedActivate( index );
        },

        // show informations about the record
        miInfo( index ){
            const edited = self.APP.edited.get();
            const obj = edited[index];
            Modal.run({
                mdTitle: pwixI18n.label( I18N, 'validities.tab.mi_title' ),
                mdBody: 'miPanel',
                mdButtons: [ Modal.C.Button.CLOSE ],
                name: obj.label,
                object: obj
            });
        },

        // user asks to define a new validity period by clicking somewhere on a '+' button
        //  argument is the chosen free validity period as an object { start, end }
        onNewPeriod( period ){
            // build and order a new record
            const res = Meteor.APP.Validity.newRecord( self.APP.edited.get(), period, { start: self.APP.startField, end: self.APP.endField });
            self.APP.edited.set( res.array );
            self.APP.tabbedActivate( res.index );
        },

        // remove the identified period
        removePeriod( index ){
            let edited = self.APP.edited.get();
            edited.splice( index, 1 );
            const nextActive = ( index >= edited.length ) ? edited.length-1 : index;
            self.APP.edited.set( edited );
            self.APP.tabbedActivate( nextActive );
        },

        // build a dropdown menu depending of the current item
        //  we are already sure that we have more than one
        tabDropdown( it, index ){
            const length = self.APP.edited.get().length;
            let res = '';
            if( length > 1 ){
                res += '<li><a class="dropdown-item js-remove" href="#">'+pwixI18n.label( I18N, 'validities.tab.remove' )+'</a></li>'
                if( index > 0 ){
                    res += '<li><a class="dropdown-item js-mergeleft" href="#">'+pwixI18n.label( I18N, 'validities.tab.mergeleft' )+'</a></li>'
                }
                if( index < length-1 ){
                    res += '<li><a class="dropdown-item js-mergeright" href="#">'+pwixI18n.label( I18N, 'validities.tab.mergeright' )+'</a></li>'
                }
            }
            res += '<li><a class="dropdown-item js-miinfos '+( it._id ? '' : 'disabled' )+'" href="#">'+pwixI18n.label( I18N, 'validities.tab.mi_info' )+'</a></li>'
            return res;
        },

        tabbedActivate( index ){
            self.APP.tabbbedTrigger( 'tabbed-do-activate', { index: index });
        },

        // trigger an event to our coreTabbedTemplate
        tabbbedTrigger( event, data ){
            const tabbed = self.$( '.c-validities-tabbed > .ca-tabbed-template' ).data( 'tabbed-id' );
            self.$( '.c-validities-tabbed > .ca-tabbed-template' ).trigger( event, {
                ...data,
                tabbedId: tabbed
            });
        }
    };

    // get the provided items group to be edited
    // nb: if the caller doesn't manage validities, it is expected to pass the to-be-edited item directly in the 'group'
    const group = Template.currentData().group;
    const withValidities = Boolean( Template.currentData().withValidities !== false );
    //let edited = _.cloneDeep( group ? ( withValidities ? group.items : [ group ] ) : [{}] );
    // pwi 2024- 1-20 cancel the above cloneDeep
    let edited = group ? ( withValidities ? group.items : [ group ] ) : [{}] ;
    self.APP.edited.set( edited );

    // get starting and ending effect field names
    self.APP.startField = Template.currentData().startField || 'effectStart';
    self.APP.endField = Template.currentData().endField || 'effectEnd';

    // track the validity periods from the 'edited' array
    self.autorun(() => {
        let periods = [];
        self.APP.edited.get().every(( it ) => {
            periods.push({ start: it[self.APP.startField], end: it[self.APP.endField] });
            return true;
        });
        self.APP.periods.set( periods );
    });

    // track the validity holes from the 'edited' array
    self.autorun(() => {
        let validities = [];
        self.APP.periods.get().every(( it ) => {
            validities.push({ start: it.start, end: it.end });
            return true;
        });
        const holes = Meteor.APP.Validity.holes( validities, {
            start: 'start',
            end: 'end'
        });
        self.APP.holes.set( holes );
    });

    // track edited records
    self.autorun(() => {
        console.debug( 'edited', self.APP.edited.get());
    });

    // track periods
    self.autorun(() => {
        console.debug( 'periods', self.APP.periods.get());
    });

    // track holes
    self.autorun(() => {
        console.debug( 'holes', self.APP.holes.get());
    });

    // track edited to dynamically rebuild tabs
    self.autorun(() => {
        const edited = self.APP.edited.get();
        self.APP.tabs.set( self.APP.buildTabs( edited ));
    });
});

Template.ValidityTabbed.onRendered( function(){
    const self = this;

    // set events target here if we run inside of a modal
    const $modal = self.$( '.c-validities-tabbed' ).closest( '.modal-content' );
    if( $modal && $modal.length ){
        Modal.set({ target: self.$( '.c-validities-tabbed' ) });
    }

    // publish the edited reactive var (once)
    self.$( '.c-validities-tabbed' ).trigger( 'iz-edited-rv', { edited: self.APP.edited });

    // setup default active tab to the closest record
    const res = Meteor.APP.Validity.closest( self.APP.edited.get());
    self.APP.tabbedActivate( res.index );

});

Template.ValidityTabbed.helpers({
    // whether we manage validities
    haveValidities(){
        return _.isBoolean( this.withValidities ) ? this.withValidities : true;
    },

    // data if we just have an item
    itemData(){
        return this;
    },

    // template if we just have an item
    itemTemplate(){
        return this.template;
    },

    // data context to be passed to the validities band
    parmsBand(){
        return {
            periods: Template.instance().APP.holes.get()
        };
    },

    // defines the list of tabs to be displayed
    parmsTabbed(){
        return {
            tabs: Template.instance().APP.tabs.get(),
            navPosition: 'bottom'
        }
    }
});

Template.ValidityTabbed.events({
    'click .nav-link .js-mergeleft'( event, instance ){
        //console.debug( event );
        const index = instance.$( event.currentTarget ).closest( 'button.nav-link' ).data( 'tabbed-index' );
        Bootbox.confirm( pwixI18n.label( I18N, 'validities.panel.confirm_mergeleft' ), function( ret ){
            if( ret ){
                instance.APP.mergeLeft( index );
            }
        });
    },

    'click .nav-link .js-mergeright'( event, instance ){
        //console.debug( event );
        const index = instance.$( event.currentTarget ).closest( 'button.nav-link' ).data( 'tabbed-index' );
        Bootbox.confirm( pwixI18n.label( I18N, 'validities.panel.confirm_mergeright' ), function( ret ){
            if( ret ){
                instance.APP.mergeRight( index );
            }
        });
    },

    'click .nav-link .js-miinfos'( event, instance ){
        //console.debug( event );
        const index = instance.$( event.currentTarget ).closest( 'button.nav-link' ).data( 'tabbed-index' );
        instance.APP.miInfo( index );
    },

    'click .nav-link .js-remove'( event, instance ){
        //console.debug( event );
        const index = instance.$( event.currentTarget ).closest( 'button.nav-link' ).data( 'tabbed-index' );
        Bootbox.confirm( pwixI18n.label( I18N, 'validities.panel.confirm_remove' ), function( ret ){
            if( ret ){
                instance.APP.removePeriod( index );
            }
        });
    }
});
