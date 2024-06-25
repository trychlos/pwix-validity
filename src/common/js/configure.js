/*
 * pwix:validity/src/common/js/configure.js
 */

import _ from 'lodash';

import { ReactiveVar } from 'meteor/reactive-var';

let _conf = {};

Validity._conf = new ReactiveVar( _conf );

Validity._defaults = {
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
