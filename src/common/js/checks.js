/*
 * pwix:validity/src/common/js/checks.js
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import { ReactiveVar } from 'meteor/reactive-var';
import { TM } from 'meteor/pwix:typed-message';

Validity.checks = {
    // item is a ReactiveVar which contains the edited document
    _assert_data_itemrv( caller, data ){
        assert.ok( data, caller+' data required' );
        assert.ok( data.item, caller+' data.item required' );
        assert.ok( data.item instanceof ReactiveVar, caller+' data.item expected to be a ReactiveVar' );
    },

    // if date is set, it must be valid - it is expected in yyyy-mm-dd format
    //  data comes from the edition panel, passed-in through the Forms.Checker instance
    async effectEnd( value, data, opts={} ){
        Validity.checks._assert_data_itemrv( 'Validity.checks.effectEnd()', data );
        const item = data.item.get();
        return Promise.resolve( null )
            .then(() => {
                if( opts.update !== false ){
                    item.effectEnd = value ? new Date( value ) : null;
                    data.item.set( item );
                }
                const msg = Validity.checkEnd( data.entity.get().DYN.records, data.item.get());
                return msg ? new TM.TypedMessage({
                    level: TM.MessageType.C.ERROR,
                    message: msg
                }) : null;
            });
    },

    async effectStart( value, data, opts={} ){
        Validity.checks._assert_data_itemrv( 'Validity.checks.effectStart()', data );
        const item = data.item.get();
        return Promise.resolve( null )
            .then(() => {
                if( opts.update !== false ){
                    item.effectStart = value ? new Date( value ) : null;
                    data.item.set( item );
                }
                const msg = Validity.checkStart( data.entity.get().DYN.records, data.item.get());
                return msg ? new TM.TypedMessage({
                    level: TM.MessageType.C.ERROR,
                    message: msg
                }) : null;
            });
    }
};
