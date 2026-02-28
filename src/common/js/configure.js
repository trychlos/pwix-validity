/*
 * pwix:validity/src/common/js/configure.js
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

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
        // check that keys exist
        let built_conf = {};
        Object.keys( o ).forEach(( it ) => {
            if( Object.keys( Validity._defaults ).includes( it )){
                built_conf[it] = o[it];
            } else {
                logger.warn( 'configure() ignore unmanaged key \''+it+'\'' );
            }
        });
        if( Object.keys( built_conf ).length ){
            _conf = _.merge( Validity._defaults, _conf, built_conf );
            Validity._conf.set( _conf );
            logger.verbose({ verbosity: _conf.verbosity, against: Validity.C.Verbose.CONFIGURE }, 'configure() with', built_conf );
        }
    }
    // also acts as a getter
    return Validity._conf.get();
}

_conf = _.merge( {}, Validity._defaults );
Validity._conf.set( _conf );

// make sure effectStart and effectEnd field names are set
Tracker.autorun(() => {
    const effectStart = Validity.configure().effectStart;
    if( !effectStart || !_.isString( effectStart )){
        logger.error( 'expects effectStart be a non empty string, got', effectStart );
    }
    const effectEnd = Validity.configure().effectEnd;
    if( !effectEnd || !_.isString( effectEnd )){
        logger.error( 'expects effectEnd be a non empty string, got', effectEnd );
    }
});
