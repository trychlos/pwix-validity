/*
 * pwix:validity/src/common/js/configure.js
 */

import _ from 'lodash';

import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

let _conf = {};

Validity._conf = new ReactiveVar( _conf );

Validity._defaults = {
    effectEnd: 'effectEnd',
    effectStart: 'effectStart',
    verbosity: Validity.C.Verbose.CONFIGURE
};

/**
 * @summary Get/set the package configuration
 *  Should be called *in same terms* both by the client and the server.
 * @param {Object} o configuration options
 * @returns {Object} the package configuration
 */
Validity.configure = function( o ){
    if( o && _.isObject( o )){
        _.merge( _conf, Validity._defaults, o );
        Validity._conf.set( _conf );
        // be verbose if asked for
        if( _conf.verbosity & Validity.C.Verbose.CONFIGURE ){
            console.log( 'pwix:validity configure() with', o );
        }
    }
    // also acts as a getter
    return Validity._conf.get();
}

_.merge( _conf, Validity._defaults );
Validity._conf.set( _conf );

// make sure effectStart and effectEnd field names are set
Tracker.autorun(() => {
    const effectStart = Validity.configure().effectStart;
    if( !effectStart || !_.isString( effectStart )){
        console.error( 'pwix:validity expects effectStart be a non empty string, got', effectStart );
    }
    const effectEnd = Validity.configure().effectEnd;
    if( !effectEnd || !_.isString( effectEnd )){
        console.error( 'pwix:validity expects effectEnd be a non empty string, got', effectEnd );
    }
});
