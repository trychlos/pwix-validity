/*
 * pwix:validity/src/client/components/ValiditiesTabbed/ValiditiesTabbed.js
 *
 * Validities tabs manager: run the specified panel inside of our own tabbed component.
 * We manage here one tab per validity records, plus a 'availability' tab which shows available validity periods, plus an 'add' button.
 *
 * This top ValiditiesTabbed component have one tab per validity period, each of these validity tabs itself
 *  containing all the properties for the edited entity, and so (in the case of an organization for example), several
 *  organization tabs.
 * When needed, validity tabs periods can be identified through the tab identifier allocated and advertised by the Tabbed component.
 *
 * Parms:
 * - entity: the to-be-edited item entity, as a ReactiveVar, including a DYN.records array of ReactiveVar's - empty if new
 * - template: the to-be-included Blaze template name
 * - withValidities: whether we want deal with validity records, defaulting to true
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict; // up to nodejs v16.x

import { Bootbox } from 'meteor/pwix:bootbox';
import { DateJs } from 'meteor/pwix:date';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import '../validities_panel/validities_panel.js';
import '../validity_band/validity_band.js';
import '../validity_pane/validity_pane.js';
import '../validity_plus/validity_plus.js';
import '../ValidityFieldset/ValidityFieldset.js';

import './ValiditiesTabbed.html';

Template.ValiditiesTabbed.onCreated( function(){
    const self = this;
    //console.debug( this );

    self.PCK = {
        addons: [
            {
                tab_label: 'tab.holes',
                tab_panel: 'validities_panel'
            }
        ],

        // keep the passed-in entityRv
        entityRv: null,

        // the name of the fields which contain starting and ending effect dates
        startField: Validity.configure().effectStart,
        endField: Validity.configure().effectEnd,

        // each time the item changes, recomputes the current vality periods
        periods: new ReactiveVar( [], _.isEqual ),

        // each time, the validity periods change, recompute holes and tabs
        holes: new ReactiveVar( [], _.isEqual ),
        tabs: new ReactiveVar( [], ( a, b ) => { return self.PCK.compareTabs( a, b ); }),

        // whether this view in on a destroy way
        destroying: false,

        // build the list of tabs
        //  note that the list of tabs only depends of the validity periods - so we also keep the last periods array
        prevPeriods: [],
        buildTabs( entity ){
            //console.debug( 'buildTabs', entity, 'length', entity.DYN.records.length );
            let tabs = [];
            let dataContext = Template.currentData();
            const closest = Validity.closest( entity ).record;
            const atdate = Validity.atDate( entity );

            for( let i=0 ; i<entity.DYN.records.length ; ++i ){
                const record = entity.DYN.records[i].get();
                let itemClasses = [];
                if( Validity.cmpRecords( record, closest ) === 0 ){
                    itemClasses.push( 'validity-closest' );
                }
                if( atdate && Validity.cmpRecords( record, atdate ) === 0 ){
                    itemClasses.push( 'validity-atdate' );
                }
                tabs.push({
                    navLabel: self.PCK.itemLabel( record, i ),
                    navItemClasses: itemClasses.join( ' ' ),
                    paneTemplate: 'validity_pane',
                    paneData: {
                        ...dataContext,
                        index: i
                    }
                });
            }
            self.PCK.addons.every(( it ) => {
                tabs.push({
                    navLabel: pwixI18n.label( I18N, it.tab_label ),
                    paneTemplate: it.tab_panel,
                    paneData: {
                        ...dataContext,
                        holes: self.PCK.holes,
                        newPeriodCb: self.PCK.onNewPeriod
                    }
                });
                return true;
            });
            tabs.push({
                navTemplate: 'validity_plus',
                navData: {
                    ...dataContext,
                    classes: 'nav-link',
                    holes: self.PCK.holes,
                    newPeriodCb: self.PCK.onNewPeriod
                }
            });
            //console.debug( 'tabs', tabs );
            return tabs;
        },

        // tabs array is a reactive var
        //  in order to only 'set' when it changes, compare the new value with the old one - and actually compare
        compareTabs( a, b ){
            const equals = _.isEqual( self.PCK.prevPeriods, self.PCK.periods.get());
            if( !equals ){
                self.PCK.prevPeriods = _.cloneDeep( self.PCK.periods.get());
            }
            return equals;
        },

        // provides the translated label associated with this tab
        itemLabel( it, index ){
            let res = '';
            if( !DateJs.isValid( it[self.PCK.startField] ) && !DateJs.isValid( it[self.PCK.endField] )){
                res = pwixI18n.label( I18N, 'tab.full' );
            } else if( DateJs.isValid( it[self.PCK.startField] )){
                res = pwixI18n.label( I18N, 'tab.from', DateJs.toString( it[self.PCK.startField] ));
            } else {
                res = pwixI18n.label( I18N, 'tab.to', DateJs.toString( it[self.PCK.endField] ));
            }
            // add a dropdown menu for all periods
            return ''
                +'<div class="d-flex justify-content-between align-items-center validity-item-label">'
                +res
                +'<div class="dropdown">'
                +'  <a class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"></a>'
                +'  <ul class="dropdown-menu">'
                + self.PCK.tabDropdown( it, index )
                +'  </ul>'
                +'</div>';
        },

        // merge with previous period
        //  this means we keep the displayed data, removing the previous period data, keeping only its starting date
        mergeLeft( index ){
            const entityRv = self.PCK.entityRv;
            check( entityRv, ReactiveVar );
            let entity = entityRv.get();
            const removed = entity.DYN.records.splice( index-1, 1 );
            //console.debug( 'removing', removed );
            entity.DYN.records[index-1].get()[this.startField] = removed[0].get()[this.startField];
            entityRv.set( entity );
            self.PCK.tabbedActivate( index-1 );
        },

        // merge with next period
        //  this means we keep the displayed data, removing the next period data, keeping only its ending date
        mergeRight( index ){
            const entityRv = self.PCK.entityRv;
            check( entityRv, ReactiveVar );
            let entity = entityRv.get();
            const removed = entity.DYN.records.splice( index+1, 1 );
            //console.debug( 'removing', removed );
            entity.DYN.records[index].get()[this.endField] = removed[0].get()[this.endField];
            entityRv.set( entity );
            self.PCK.tabbedActivate( index );
        },

        // show informations about the record
        miInfo( index ){
            const entity = self.PCK.entityRv.get();
            const obj = entity.DYN.records[index].get();
            Modal.run({
                mdTitle: pwixI18n.label( I18N, 'tab.mi_title' ),
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
            const entityRv = self.PCK.entityRv;
            check( entityRv, ReactiveVar );
            let entity = entityRv.get();
            const res = Validity.newRecord( entity, period, { start: self.PCK.startField, end: self.PCK.endField });
            entity.DYN.records = res.records;
            entityRv.set( entity );
            self.PCK.tabbedActivate( res.index );
        },

        // remove the identified period
        removePeriod( index ){
            const entityRv = self.PCK.entityRv;
            check( entityRv, ReactiveVar );
            let entity = entityRv.get();
            entity.DYN.records.splice( index, 1 );
            const nextActive = ( index >= entity.DYN.records.length ) ? entity.DYN.records.length-1 : index;
            entityRv.set( entity );
            self.PCK.tabbedActivate( nextActive );
        },

        // build a dropdown menu depending of the current item
        tabDropdown( it, index ){
            const length = Template.currentData().entity.get().DYN.records.length;
            let res = '';
            if( length > 1 ){
                res += '<li><a class="dropdown-item js-remove" href="#">'+pwixI18n.label( I18N, 'tab.remove' )+'</a></li>'
                if( index > 0 ){
                    res += '<li><a class="dropdown-item js-mergeleft" href="#">'+pwixI18n.label( I18N, 'tab.mergeleft' )+'</a></li>'
                }
                if( index < length-1 ){
                    res += '<li><a class="dropdown-item js-mergeright" href="#">'+pwixI18n.label( I18N, 'tab.mergeright' )+'</a></li>'
                }
            }
            res += '<li><a class="dropdown-item js-miinfos '+( it._id ? '' : 'disabled' )+'" href="#">'+pwixI18n.label( I18N, 'tab.mi_info' )+'</a></li>'
            return res;
        },

        tabbedActivate( index ){
            self.PCK.tabbbedTrigger( 'tabbed-do-activate', { index: index });
        },

        // trigger an event to our coreTabbedTemplate
        tabbbedTrigger( event, data ){
            const tabbed = self.$( '.ValiditiesTabbed > .tabbed-template' ).data( 'tabbed-id' );
            self.$( '.ValiditiesTabbed > .tabbed-template' ).trigger( event, {
                ...data,
                tabbedId: tabbed
            });
        }
    };

    // track the validity periods from the 'entity.DYN.records' array of ReactiveVar's
    self.autorun(() => {
        let periods = [];
        const entityRv = Template.currentData().entity;
        check( entityRv, ReactiveVar );
        self.PCK.entityRv = entityRv;
        //console.debug( entityRv );
        entityRv.get().DYN.records.forEach(( it ) => {
            periods.push({ start: it.get()[self.PCK.startField], end: it.get()[self.PCK.endField] });
        });
        self.PCK.periods.set( periods );
    });

    // track the validity holes from the 'entity.DYN.records' array
    self.autorun(() => {
        let validities = [];
        self.PCK.periods.get().forEach(( it ) => {
            validities.push({ start: it.start, end: it.end });
        });
        const holes = Validity.holesByRecords( validities, {
            start: 'start',
            end: 'end'
        });
        self.PCK.holes.set( holes );
    });

    // track periods
    self.autorun(() => {
        //console.debug( 'periods', self.PCK.periods.get());
    });

    // track holes
    self.autorun(() => {
        //console.debug( 'holes', self.PCK.holes.get());
    });

    // track edited to dynamically rebuild tabs
    self.autorun(() => {
        self.PCK.tabs.set( self.PCK.buildTabs( Template.currentData().entity.get()));
    });
});

Template.ValiditiesTabbed.onRendered( function(){
    const self = this;

    // set events target here if we run inside of a modal
    const $modal = self.$( '.ValiditiesTabbed' ).closest( '.modal-content' );
    if( $modal && $modal.length ){
        Modal.set({ target: self.$( '.ValiditiesTabbed' ) });
    }

    // publish the edited reactive var (once)
    self.$( '.ValiditiesTabbed' ).trigger( 'validity-edited-rv', { edited: Template.currentData().entity });

    // setup default active tab to the closest record
    const res = Validity.closest( Template.currentData().entity.get());
    self.PCK.tabbedActivate( res.index );
});

Template.ValiditiesTabbed.helpers({
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
            periods: Template.instance().PCK.holes.get()
        };
    },

    // defines the list of tabs to be displayed
    parmsTabbed(){
        return {
            name: this.name || 'validities_tabbed',
            tabs: Template.instance().PCK.tabs.get(),
            navPosition: 'bottom'
        }
    }
});

Template.ValiditiesTabbed.events({
    'click .nav-link .js-mergeleft'( event, instance ){
        //console.debug( event );
        const index = instance.$( event.currentTarget ).closest( 'button.nav-link' ).data( 'tabbed-index' );
        Bootbox.confirm({
            title: pwixI18n.label( I18N, 'panel.title_mergeleft' ),
            message: pwixI18n.label( I18N, 'panel.confirm_mergeleft' )
        }, function( ret ){
            if( ret ){
                instance.PCK.mergeLeft( index );
            }
        });
    },

    'click .nav-link .js-mergeright'( event, instance ){
        //console.debug( event );
        const index = instance.$( event.currentTarget ).closest( 'button.nav-link' ).data( 'tabbed-index' );
        Bootbox.confirm({
            title: pwixI18n.label( I18N, 'panel.title_mergeright' ),
            message: pwixI18n.label( I18N, 'panel.confirm_mergeright' )
        }, function( ret ){
            if( ret ){
                instance.PCK.mergeRight( index );
            }
        });
    },

    'click .nav-link .js-miinfos'( event, instance ){
        //console.debug( event );
        const index = instance.$( event.currentTarget ).closest( 'button.nav-link' ).data( 'tabbed-index' );
        instance.PCK.miInfo( index );
    },

    'click .nav-link .js-remove'( event, instance ){
        //console.debug( event );
        const index = instance.$( event.currentTarget ).closest( 'button.nav-link' ).data( 'tabbed-index' );
        Bootbox.confirm({
            title: pwixI18n.label( I18N, 'panel.title_remove' ),
            message: pwixI18n.label( I18N, 'panel.confirm_remove' )
        }, function( ret ){
            if( ret ){
                instance.PCK.removePeriod( index );
            }
        });
    }
});
