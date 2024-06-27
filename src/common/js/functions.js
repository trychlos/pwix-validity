/*
 * pwix:validity/src/common/js/functions.js
 *
 * Taxonomy:
 *  - entity: the object domain for which we are going to manage validity periods
 *  - record: the document which maintains the datas for a single validity period
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import { DateJs } from 'meteor/pwix:date';
import { pwixI18n } from 'meteor/pwix:i18n';

/*
 * @summary check an item vs a group of items to see if they are compatible
 * @param {Array} array the entity items array
 * @param {Object} item the item to be tested, with fields { id, start, end }
 * @param {Object} opts options
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
 * @returns {Boolean} true if both are compatible
 */
Validity._check_against = function( array, item, opts={} ){
    const startField = opts.start || 'effectStart';
    const endField = opts.end || 'effectEnd';

    let ok = true;

    //console.debug( 'item', item.start, item.end );
    array.every(( it ) => {
        //console.debug( 'it', it[startField], it[endField],
        //    'is_same_period', this._is_same_period( [ item.start, item.end ], [ it[startField], it[endField] ] ),
        //    'overlap', this._intervals_overlap( [ item.start, item.end ], [ it[startField], it[endField] ] ));
        if( !this._is_same_period( [ item.start, item.end ], [ it[startField], it[endField] ] )){
            const overlap = this._intervals_overlap( [ item.start, item.end ], [ it[startField], it[endField] ] );
            ok &&= ( overlap === -1 );
        }
        return ok;
    });

    return ok;
};

/*
 * @summary compare two values
 * @param {Any} a, may be undefined
 * @param {Any} b, may be undefined
 * @param {Object} opts options with following keys:
 *  - type: a data type, defaulting to a scalar (string or number) one
 * @returns -1 if a strictly lesser than b,
 *  +1 if a strictly greater than b
 *  0 if a equal b.
 */
Validity._compare_typed_values = function( a, b, opts ){
    if( _.isNil( a )){
        if( _.isNil( b )){
            return 0;
        }
        return -1;
    } else if( _.isNil( b )){
        return 1;
    } else {
        if( !opts.type || opts.type === 'Scalar' ){
            return a < b ? -1 : ( a > b ? 1 : 0 );
        }
        if( opts.type === 'Array' ){
            return a.length < b.length ? -1 : ( a.length > b.length ? +1 : 0 );
        }
        if( opts.type === 'Date' ){
            return DateJs.compare( a, b );
        }
    }
};

/*
 * @summary compute the intersection of two intervals
 * @param {Array} a an array of two dates, one or both may being null/unset/invalid
 * @param {Array} b same
 * @returns {Array} an array of two dates which are the intersection of a and b, each date may being null
 */
Validity._intervals_overlap = function( a, b ){
    const startDate1 = DateJs.sanitize( a[0] ) || new Date( DateJs.infinite.start ); // Represents the beginning of time
    const endDate1 = DateJs.sanitize( a[1] ) || new Date( DateJs.infinite.end );   // Represents the end of time
    const startDate2 = DateJs.sanitize( b[0] ) || new Date( DateJs.infinite.start );
    const endDate2 = DateJs.sanitize( b[1] ) || new Date( DateJs.infinite.end );

    let latestStartDate = new Date( Math.max( startDate1, startDate2 ));
    let earliestEndDate = new Date( Math.min( endDate1, endDate2 ));

    if( latestStartDate <= earliestEndDate ){
        if(  DateJs.isInfinite( latestStartDate )){
            latestStartDate = null;
        }
        if(  DateJs.isInfinite( earliestEndDate )){
            earliestEndDate = null;
        }
        return [ latestStartDate, earliestEndDate ];
    } else {
        return -1;  // No intersection
    }
};

/*
 * @param {Array} a an array of two dates, one or both may be null/unset/undefined
 * @param {Array} b an array of two dates, one or both may be null/unset/undefined
 * @returns {Boolean} true if the periods are the same
 */
Validity._is_same_period = function( a, b, opts ){
    const startDate1 = DateJs.sanitizeToMs( a[0], DateJs.infinite.start ); // Represents the beginning of time
    const endDate1 = DateJs.sanitizeToMs( a[1], DateJs.infinite.end );   // Represents the end of time
    const startDate2 = DateJs.sanitizeToMs( b[0], DateJs.infinite.start );
    const endDate2 = DateJs.sanitizeToMs( b[1], DateJs.infinite.end );
    const same = startDate1 === startDate2 && endDate1 === endDate2;
    //console.debug( 'same_period', a, b, startDate1, endDate1, startDate2, endDate2, same );
    return same;
};

/**
 * @summary Compare the specified field among all validity records and returns the analyze
 *  this let us have a different display when a field (e.g. a label) has changed between two periods
 *  and simultaneously provide a default display
 * @param {Object} group the item group as an object { id, items }
 * @param {String} field the name of the field to analyze
 * @param {Object} opts an options object with following keys:
 *  - closest: if set, the closest validity record
 *  - type: if set, expected data type, defaulting to string
 * @returns {Object} the result as an object with following keys:
 *  -
 */
Validity.analyze = function( group, field, opts={} ){
    //console.debug( 'group', group, 'field', field, 'opt', opts );
    let value = null;
    let count = 0;
    let unset = 0;
    let empty = 0;
    let first = false;  // have found a first set and not empty value
    let diff = false;   // have found at least two distinct set and not empty values
    let byId = {};
    group.items.every(( it ) => {
        count += 1;
        if( Object.keys( it ).includes( field )){
            if( it[field] ){
                if( !first ){
                    value = ( opts.type === 'Array' ) ? it[field][0] : it[field];
                    first = true;
                //} else if( it[field] !== value ){
                } else if( this._compare_typed_values( it[field], value, opts ) !== 0 ){
                    diff = true;
                }
            } else {
                empty += 1;
            }
            byId[ it._id ] = it[field];
        } else {
            unset += 1;
            byId[ it._id ] = undefined;
        }
        return true;
    });
    // if we have found a single set and not empty value, that's fine
    //  else we want return the value of the closest element
    if( diff ){
        if( opts.closest ){
            value = opts.closest[field];
        } else {
            const closest = this.closest( group.items );
            value = closest[field];
        }
    }
    // return all informations found for this field
    return {
        field: field,
        count: count,
        unset: unset,
        empty: empty,
        first: first,
        diff: diff,
        value: value,
        byId: byId
    };
};

/**
 * @locus Anywhere
 * @param {Array} array the array of available validity records for the entity
 * @param {Object} opts options
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
 *  - date: the searched validity date, as a Date object, defaulting to current date
 * @returns {Object} the record whose validity period includes the specified date, or null if none
 *  This method is so more strict than closest().
 */
Validity.atDate = function( array, opts={} ){
    const startField = opts.start || 'effectStart';
    const endField = opts.end || 'effectEnd';
    const date = opts.date || new Date();
    const dateTime = date.getTime();    // the target date as epoch

    // first sort the provided array by ascending start effect date
    array.sort(( a, b ) => { return DateJs.compare( a[startField], b[startField ] ); });

    // then explore the array until finding a start effect date after the searched date
    //  and take the previous one
    let greater = -1;
    for( let i=0 ; i<array.length ; ++i ){
        const record = array[i];
        if( record[startField] ){
            const stime = record[startField].getTime();
            if( stime > dateTime ){
                greater = i;
                break;
            }
        }
    }

    // at the end, either we have found a record which comes after, or not
    let record = null;
    if( greater === -1 ){
        if( array.length ){
            record = array[ array.length-1 ];
        }
    } else if( greater > 0 ){
        record = array[ greater-1 ];
    }
    // if the first record is already greater than the date, then no found record

    // we are sure that the start date is lesser than our date - but we must verify that the end date is at least equal
    if( record && record[endField] ){
        const stime = record[endField].getTime();
        if( stime <= dateTime ){
            record = null;
        }
    }

    //console.debug( 'array', array, 'greater', greater, 'record', record );
    return record;
};

/**
 * @locus Anywhere
 * @summary Check whether the candidate ending effect date would be valid regarding the whole entity items
 *  It may notably be invalid if inside of an already allocated validity period.
 * @param {Array} array the array of available validity records for the entity
 * @param {Object} item the item which holds the candidate effect date
 * @param {Object} opts options
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
 * @returns {String} an error message or null
 */
Validity.checkEnd = function( array, item, opts={} ){
    const startField = opts.start || 'effectStart';
    const endField = opts.end || 'effectEnd';
    let res = null;

    if( item[endField] && !DateJs.isValid( item[endField] )){
        console.warn( 'invalid date item[endField]', item[endField] );
        res = pwixI18n.label( I18N, 'check.invalid_date' );

    } else if( this.isValidPeriod( item[startField], item[endField] )){
            const ok = this._check_against( array, { start: item[startField], end: item[endField] }, opts );
            res = ok ? null : pwixI18n.label( I18N, 'check.end_incompatible');
    } else {
        res = pwixI18n.label( I18N, 'check.invalid_period' );
    }

    return res;
};

/**
 * @locus Anywhere
 * @summary Check whether the candidate starting effect date would be valid regarding the whole entity items
 *  It may notably be invalid if inside of an already allocated validity period.
 * @param {Array} array the array of available validity records for the entity
 * @param {Object} item the item which holds the candidate effect date
 * @param {Object} opts options
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
 * @returns {String} an error message or null
 */
Validity.checkStart = function( array, item, opts={} ){
    const startField = opts.start || 'effectStart';
    const endField = opts.end || 'effectEnd';
    let res = null;

    if( item[startField] && !DateJs.isValid( item[startField] )){
        console.error( 'invalid date item[startField]', item[startField] );
        res = pwixI18n.label( I18N, 'check.invalid_date' );

    } else if( this.isValidPeriod( item[startField], item[endField] )){
        const ok = this._check_against( array, { start: item[startField], end: item[endField] }, opts );
        res = ok ? null : pwixI18n.label( I18N, 'check.start_incompatible');
    } else {
        res = pwixI18n.label( I18N, 'check.invalid_period' );
    }

    return res;
};

/**
 * @locus Anywhere
 * @param {Object} entity the current entity published document, i.e. with its DYN.records array
 * @param {Object} opts options
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
 *  - date: the searched validity date, as a Date object, defaulting to current date
 * @returns {Object} with following keys:
 *  - record: the record whose validity period is the closest of the specified date (and, ideally, includes it)
 *  - index: the corresponding index in the sorted array
 */
Validity.closest = function( entity, opts={} ){
    let array = entity.DYN.records;
    assert( _.isArray( array ), 'expect DYN.records be an array' );

    const startField = opts.start || 'effectStart';
    const endField = opts.end || 'effectEnd';
    const date = opts.date || new Date();
    const dateTime = date.getTime();    // the target date as epoch

    // first sort the provided array by ascending start effect date
    array.sort(( a, b ) => { return DateJs.compare( a[startField], b[startField ] ); });

    // then explore the array until finding a start effect date after the searched date
    //  and take the previous one
    let greater = -1;
    for( let i=0 ; i<array.length ; ++i ){
        const record = array[i];
        if( record[startField] ){
            const stime = record[startField].getTime();
            if( stime > dateTime ){
                greater = i;
                break;
            }
        }
    }
    // at the end, either we have found a record which comes after, or not
    let found = -1;
    if( greater === -1 ){
        if( array.length ){
            found = array.length - 1;
        }
    } else if( greater > 0 ){
        found = greater - 1;
    } else {
        found = 0;
    }
    // at last
    return {
        record: array[found],
        index: found
    };
};

/*
 * @summary Group records by entity
 * @param {Array} array the array to be grouped (e.g. directly fetched from the database)
 * @param {Object} opts options
 *  - entity: the name of the field which identifies an item, whatever be the validity, defaulting to 'entity'
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 * @returns {Array} an array of objects with following keys:
 *  - entity: the item identifier
 *  - items: the array of validity records for this entity item, sorted by ascending start effect date
 *
 * Note: this structure is needed as we want keep the ability to add some other keys to each item object.
 */
/*
Validity.group = function( array, opts={} ){
    const itemid = opts.entity || 'entity';
    const startField = opts.start || 'effectStart';

    // build a hash indexed by entity identifiers with all the records as a value array
    let hash = {};
    array.every(( it ) => {
        if( Object.keys( hash ).includes( it[itemid] )){
            hash[ it[itemid] ].push( it );
        } else {
            hash[ it[itemid] ] = [ it ];
        }
        return true;
    });

    // sort each item array by ascending start effect date
    Object.keys( hash ).every(( id ) => {
        hash[id].sort(( a, b ) => { return DateJs.compare( a[startField], b[startField ] ); });
        return true;
    });

    // last return the formatted result
    let result = [];
    Object.keys( hash ).every(( id ) => {
        let o = {};
        o[itemid] = id;
        o.items = hash[id];
        result.push( o );
        return true;
    });

    return result;
};
*/

/**
 * @summary Find holes, i.e. period of times which are not in a validity period
 * @param {Array} array an array of objects which may contain start and end effect dates
 * @param {Object} opts options
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
 * @returns {Array} an array, maybe empty, of objects with following keys:
 *  - start: the starting uncovered date, may be unset for infinite
 *  - end: the ending uncovered date, may be unset for infinite
 */
Validity.holes = function( array, opts={} ){
    const startField = opts.start || 'effectStart';
    const endField = opts.end || 'effectEnd';

    let holes = [];

    // first sort the provided array by ascending start effect date
    array.sort(( a, b ) => { return DateJs.compare( a[startField], b[startField ] ); });

    //  last item should have effectEnd unset
    let lastEnd = null;

    for( let i=0 ; i<array.length ; ++i ){
        const it = array[i];
        // if we have a start date, then found a hole if last end date was lesser than start-1
        if( it[startField] ){
            let startBefore = DateJs.compute( it[startField], -1 );
            if( !lastEnd || DateJs.toString( lastEnd ) < DateJs.toString( startBefore )){
                let o = {};
                o.end = startBefore;
                if( lastEnd ){
                    o.start = DateJs.compute( lastEnd, +1 );
                }
                holes.push( o );
            }
        }
        // if we have an end date, just keep it
        if( it[endField] ){
            lastEnd = it[endField];
        }
        // but at the end
        if( i === array.length-1 ){
            if( it[endField] ){
                let o = {};
                o.start = DateJs.compute( it[endField], +1 );
                holes.push( o );
            }
        }
    }

    return holes;
};

/**
 * @summary Check for a valid period
 * @param {Date|String} start the starting date of the period
 * @param {Date|String} end the ending date of the period
 * @returns {Boolean} whether the period is valid
 */
Validity.isValidPeriod = function( start, end ){
    const startValue = DateJs.sanitize( start ) || new Date( DateJs.infinite.start );
    const endValue = DateJs.sanitize( end ) ||  new Date( DateJs.infinite.end );
    return startValue <= endValue;
};

/**
 * @summary Build a new record for a new period
 * @param {Object} entity the current entity published document, i.e. with its DYN.records array
 * @param {Object} period the new validity period (currently free), as a { start, end } object
 * @param {Object} opts options
 *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
 *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
 * @returns {Object} with following keys:
 *  - records: the new entity records array, including the new one, in the order of ascending effect start date
 *  - index: the index of the new record in the returned array
 */
Validity.newRecord = function( entity, period, opts={} ){
    let array = entity.DYN.records;
    assert( _.isArray( array ), 'expect DYN.records be an array' );

    const startField = opts.start || 'effectStart';
    const endField = opts.end || 'effectEnd';
    let res = null;
    //console.debug( 'period', period, DateJs.isValid( period.start ), DateJs.isValid( period.end ));

    // search for the previous record (or the next one if first)
    let found = -1;
    if( !DateJs.isValid( period.start )){
        found = 0;
    } else {
        for( let i=0 ; i<array.length ; ++i ){
            const it = array[i];
            if( DateJs.compare( period.start, it[startField] ) === +1 ){
                found = i-1;
                break;
            }
        }
    }
    if( found === -1 ){
        found = array.length - 1;
    }
    if( found >= 0 ){
        res = [ ...array ];
        let record = _.cloneDeep( array[found] );
        // Mongo identifier
        delete record._id;
        // collection-timestampable attributes
        delete record.createdAt;
        delete record.createdBy;
        delete record.updatedAt;
        delete record.updatedBy;
        // this validity atributes
        record[startField] = DateJs.sanitize( period.start );
        record[endField] = DateJs.sanitize( period.end );
        record.NEWRECORD = true;
        res.push( record );
        res.sort(( a, b ) => { return DateJs.compare( a[startField], b[startField ] ); });
    } else {
        console.warn( 'unable to find a reference record', period, array, opts );
    }
    // search where has been sorted this new record
    let index = -1;
    for( let i=0 ; i<res.length ; ++i ){
        if( res[i].NEWRECORD === true ){
            index = i;
            delete res[i].NEWRECORD;
            break;
        }
    }
    // at last
    return {
        records: res,
        index: index
    };
};

    /*
    ***
    ***
    ***
    ***
    ***
    ***
    ***
    */

    // just a shortcut to our Date object
    //Date: DateJs,

    /*
     * @summary Compare the validity of two records, saying how they compare
     *  Actually only comparing the starting date of the validity records
     * @param {Object} a an item
     * @param {Object} b another item
     * @param {Object} opts options
     *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
     * @returns {Integer} -1 if a begins before b
     *                    +1 if a begins after b
     *                     0 if a and b begins at the same date
     */
    /*
    x_cmpValidities( a, b, opts={} ){
        const startField = opts.start || 'effectStart';
        const res = this.Date.compare( a[startField], b[startField ] );
        //console.debug( a, b, res );
        return res;
    },
    */

    /*
     * @summary Dump starting and ending effect dates from a record or an array of records
     * @locus Anywhere
     * @param {Object|Array} o the object or array to be dumped
     * @param {Object} opts options
     *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
     *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
     */
    /*
    x_dump( o, opts={} ){
        const startField = opts.start || 'effectStart';
        const endField = opts.end || 'effectEnd';

        const ar = Array.isArray( o ) ? o : [ o ];
        for( let i=0 ; i<ar.length ; ++i ){
            console.debug( 'i', i, 'effectStart', ar[i][startField] );
            console.debug( 'i', i, 'effectEnd', ar[i][endField] );
        }
    },
    */

    /*
     * @summary Filter an array of records, returning the element which is valid at the specified date
     * @locus Anywhere
     * @param {Array} array the array to be filtered
     * @param {Object} opts options
     *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
     *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
     *  - date: the searched validity UTC date, as a Date object, defaulting to DateJs.UTC()
     * @returns {Object} the current record at the date
     */
    /*
    x_filter( array, opts={} ){
        const startField = opts.start || 'effectStart';
        const endField = opts.end || 'effectEnd';
        const date = opts.date || this.Date.UTC();
        const dateTime = date.getTime();

        let result = null;

        array.every(( it ) => {
            const current = Meteor.APP.Validity.testCurrent( it );
            if( current === 0 ){
                result = it;
            }
            return result === null;
        });

        return result;
    },
    */

    /*
     * @locus Anywhere
     * @param {Object} record the element to be tested
     * @param {Object} opts options
     *  - start: the name of the field which contains the start date of the validity, defaulting to 'effectStart'
     *  - end: the name of the field which contains the end date of the validity, defaulting to 'effectEnd'
     *  - date: the searched validity UTC date, as a Date object, defaulting to DateJs.UTC()
     * @returns {Integer} -1 if the record is in the past of the specified date
     *                     0 if the specified date in inside of the record
     *                    +1 if the record is in the future of the specified date
     */
    /*
    x_testCurrent( record, opts={} ){
        const startField = opts.start || 'effectStart';
        const endField = opts.end || 'effectEnd';
        const date = opts.date || this.Date.UTC();
        const dateTime = date.getTime();

        const hasStart = this.Date.isValid( record[startField] );
        const hasEnd = this.Date.isValid( record[endField] );
        let res = null;
        let cmp;

        if( _.isNull( res )){
            if( hasEnd ){
                cmp = ( this.Date.compare( record[endField], date ));
                // if date after the end of validity, then the record is in the past of the specified date
                if( cmp === -1 ){
                    res = -1;
                }
            }
        }
        if( _.isNull( res )){
            if( hasStart ){
                cmp = ( this.Date.compare( date, record[startField] ));
                // if date before the start of validity, then the record is in the future of the specified date
                //console.debug( date, record[startField], cmp );
                if( cmp === -1 ){
                    res = +1;
                }
            }
        }
        if( _.isNull( res )){
            res = 0;
        }

        return res;
    }
        */
