/*
 * pwix:validity/src/client/components/validity_pane/validity_pane.js
 *
 * A pane which encapsulates the caller data pane(s) so that we are able to catch the validity periods changes.
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - index: the index of the edited record
 */

import './validity_pane.html';

Template.validity_pane.onCreated( function(){
    const self = this;

    self.TABBED = {
        tabId: null
    };

    // tracking the data context consistency
    self.autorun(() => {
        //console.debug( 'length', Template.currentData().entity.get().DYN.records.length, 'index', Template.currentData().index );
    });

    // track the tab identifier (a validity period)
    self.autorun(() => {
        self.TABBED.tabId = Template.currentData().tabbedTabId;
        //console.debug( 'tabId', Template.currentData().tabbedTabId, 'index', Template.currentData().index );
    });

    // just stop anything when on the destroy way
    self.autorun(() => {
        const destroying = !Template.currentData() || Template.currentData().index >= Template.currentData().entity.get().DYN.records.length;
        if( 0 && destroying && self.view.isRendered ){
            console.debug( 'destroying', destroying, this );
            console.debug( 'removing pane from the DOM' );
            $( '#tabbed-p-'+self.TABBED.tabId ).children().remove();
        }
    });
});

Template.validity_pane.helpers({
    // the to-be-rendered template for this validity period
    template(){
        return this && this.index < this.entity.get().DYN.records.length ? this.template : null;
    }
});

Template.validity_pane.onDestroyed( function(){
    //console.debug( 'onDestroyed', this.TABBED.tabId );
});
