/*
 * pwix:validity/src/common/js/trace.js
 */

_verbose = function( level ){
    if( Validity.configure().verbosity & level ){
        let args = [ ...arguments ];
        args.shift();
        console.debug( ...args );
    }
};

_trace = function( functionName ){
    _verbose( Validity.C.Verbose.FUNCTIONS, ...arguments );
};
