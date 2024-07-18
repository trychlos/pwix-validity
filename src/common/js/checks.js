/*
 * pwix:validity/src/common/js/checks.js
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import { ReactiveVar } from 'meteor/reactive-var';
import { TM } from 'meteor/pwix:typed-message';

Validity.checks = {
    // entity is a ReactiveVar which contains the edited entity document and its validity records
    _assert_data_content( caller, data ){
        assert.ok( data, caller+' data is required' );
        assert.ok( data.entity && data.entity instanceof ReactiveVar, caller+' data.entity is expected to be set as a ReactiveVar, got '+data.entity );
        const entity = data.entity.get();
        assert.ok( entity.DYN && _.isObject( entity.DYN ), caller+' data.entity.DYN is expected to be set as a Object, got '+entity.DYN );
        assert.ok( entity.DYN.records && _.isArray( entity.DYN.records ), caller+' data.entity.DYN.records is expected to be set as an Array, got '+entity.DYN.records );
        entity.DYN.records.forEach(( it ) => {
            assert.ok( it && it instanceof ReactiveVar, caller+' each record is expected to be a ReactiveVar, got '+it );
        });
        assert.ok( _.isNumber( data.index ) && data.index >= 0, caller+' data.index is expected to be a positive or zero integer, got '+data.index );
    },

    // if date is set, it must be valid - it is expected in yyyy-mm-dd format
    //  data comes from the edition panel, passed-in through the Forms.Checker instance
    async effectEnd( value, data, opts={} ){
        Validity.checks._assert_data_content( 'Validity.checks.effectEnd()', data );
        let item = data.entity.get().DYN.records[data.index].get();
        return Promise.resolve( null )
            .then(() => {
                if( opts.update !== false ){
                    const endField = Validity.configure().effectEnd;
                    item[endField] = value ? new Date( value ) : null;
                    data.entity.get().DYN.records[data.index].set( item );
                }
                const msg = Validity.checkEnd( data.entity.get().DYN.records, item );
                return msg ? new TM.TypedMessage({
                    level: TM.MessageLevel.C.ERROR,
                    message: msg
                }) : null;
            });
    },

    async effectStart( value, data, opts={} ){
        Validity.checks._assert_data_content( 'Validity.checks.effectStart()', data );
        let item = data.entity.get().DYN.records[data.index].get();
        return Promise.resolve( null )
            .then(() => {
                if( opts.update !== false ){
                    const startField = Validity.configure().effectStart;
                    item[startField] = value ? new Date( value ) : null;
                    data.entity.get().DYN.records[data.index].set( item );
                }
                const msg = Validity.checkStart( data.entity.get().DYN.records, item );
                return msg ? new TM.TypedMessage({
                    level: TM.MessageLevel.C.ERROR,
                    message: msg
                }) : null;
            });
    }
};
