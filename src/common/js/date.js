/*
 * pwix:validity/src/common/js/date.js
 */

import _ from 'lodash';
import strftime from 'strftime';

Validity.Date = {

    // default formats used by this
    format: {
        strftime: '%Y-%m-%d',
    },

    // infinite constants
    infinite: {
        end: 8640000000000000,
        start: -8640000000000000
    },

    /**
     * @summary Dates comparison
     * @locus Anywhere
     * @param {Date|String} a a date, infinite if not valid
     * @param {Date|String} b another date, infinite if not valid
     * @returns {Integer} -1 if a < b, +1 if a > b, 0 if a = b
     */
    compare( a, b ){
        const aa = this.sanitize( a ) || new Date( this.infinite.start );
        const bb = this.sanitize( b ) ||  new Date( this.infinite.start );
        const aastr = this.toString( aa );
        const bbstr = this.toString( bb );
        return aastr < bbstr ? -1 : ( aastr === bbstr ? 0 : +1 );
    },

    /**
     * @locus Anywhere
     * @param {Date|String} date the input date
     * @param {Integer} days the count of days to add
     * @returns {Date} date+days
     */
    compute( date, days ){
        let datesan = this.sanitize( date );
        if( datesan ){
            const timems = datesan.getTime() + ( days * this.dayms );
            datesan.setTime( timems );
        }
        return datesan;
    },

    /**
     * @summary Test for an infinity date
     * @param {Date|String} date
     * @returns {Boolean} whether the infinite
     */
    isInfinite( date ){
        const t = new Date( date ).getTime()
        return t === this.infinite.start || t === this.infinite.end;
    },

    /**
     * @summary Test for a valid date string
     * @param {Date|String} date
     * @returns {Boolean} whether the string represents a valid date according to us
     */
    isValid( date ){
        let d = null;
        if( date instanceof Date ){
            d = new Date( date );
        } else if( _.isString( date )){
            const parts = date.split( '-' );
            if( parts.length !== 3 ){
                d = new Date( date );
                return this.isValid( d );
            }
            if( Number( parts[2] < 1 )){
                return false;
            }
            d = new Date( date );
        }
        return Boolean( d ? !isNaN( d.getTime()) : false );
    },

    /**
     * @summary Sanitize a date
     * @param {Date|String} date a date, maybe null, unset or undefined
     * @returns {Date|null} either a valid Date object, or null
     */
    sanitize( date ){
        let d = null;
        if( date ){
            if( _.isString( date )){
                d = new Date( date );
            } else if( date instanceof Date ){
                d = new Date( date );
            } else {
                console.warn( 'neither a Date nor a string', date );
            }
        }
        if( d ){
            if( !this.isValid( d )){
                d = null;
            }
        }
        return d;
    },

    /**
     * @summary Sanitize a date, returning a miliseconds timestamp since Epoch
     * @param {Date|String} date a date, maybe null, unset or undefined
     * @param {Integer} defaultValue if the provided date is not valid
     * @returns {Integer} the milliseconds count since epoch
     */
    sanitizeToMs( date, defaultValue ){
        return ( this.sanitize( date ) || new Date( defaultValue )).getTime();
    },

    /**
     * @summary Format conversion
     * @param {String} format the date strftime format (which is our coding standard)
     * @returns {String} the jQuery format to be used notably in a datepicker
     */
    strftime2jquery( format ){

        // jQuery formats without any equivalent in strftime
        //  o - day of the year (no leading zeros)
        //  m - month of year (no leading zero)
        //  ! - Windows ticks (100ns since 01/01/0001)

        let str = format
            .replace( /%A/g, 'DD' )         // full weekday name
            .replace( /%a/g, 'D')           // abbreviated weekday name
            .replace( /%B/g, 'MM')          // full month name
            .replace( /%b/g, 'M')           // abbreviated month name
                // %C: AD century (year / 100), padded to 2 digits
                // %c: equivalent to %a %b %d %X %Y %Z in en_US (based on locale)
            .replace( /%D/g, 'mm/dd/y' )    // equivalent to %m/%d/%y in en_US (based on locale)
            .replace( /%d/g, 'dd' )         // day of the month, padded to 2 digits (01-31)
            .replace( /%e/g, 'd' )          // day of the month, padded with a leading space for single digit values (1-31)
            .replace( /%F/g, 'yy-mm-dd' )   // equivalent to %Y-%m-%d in en_US (based on locale)
                // %H: the hour (24-hour clock), padded to 2 digits (00-23)
                // %h: the same as %b (abbreviated month name)
                // %I: the hour (12-hour clock), padded to 2 digits (01-12)
            .replace( /%j/g, 'oo' )         // day of the year, padded to 3 digits (001-366)
                // %k: the hour (24-hour clock), padded with a leading space for single digit values (0-23)
                // %L: the milliseconds, padded to 3 digits [Ruby extension]
                // %l: the hour (12-hour clock), padded with a leading space for single digit values (1-12)
                // %M: the minute, padded to 2 digits (00-59)
            .replace( /%m/g, 'mm' )         // the month, padded to 2 digits (01-12)
                // %n: newline character
                // %o: day of the month as an ordinal (without padding), e.g. 1st, 2nd, 3rd, 4th, ...
                // %P: "am" or "pm" in lowercase (Ruby extension, based on locale)
                // %p: "AM" or "PM" (based on locale)
                // %R: equivalent to %H:%M in en_US (based on locale)
                // %r: equivalent to %I:%M:%S %p in en_US (based on locale)
                // %S: the second, padded to 2 digits (00-60)
            .replace( /%s/g, '@' )          // the number of seconds since the Epoch, UTC
                // %T: equivalent to %H:%M:%S in en_US (based on locale)
                // %t: tab character
                // %U: week number of the year, Sunday as the first day of the week, padded to 2 digits (00-53)
                // %u: the weekday, Monday as the first day of the week (1-7)
                // %v: equivalent to %e-%b-%Y in en_US (based on locale)
                // %W: week number of the year, Monday as the first day of the week, padded to 2 digits (00-53)
                // %w: the weekday, Sunday as the first day of the week (0-6)
                // %X: equivalent to %T or %r in en_US (based on locale)
                // %x: equivalent to %D in en_US (based on locale)
            .replace( /%Y/g, 'yy' )         // the year with the century
            .replace( /%y/g, 'y' )          // the year without the century, padded to 2 digits (00-99)
                // %Z: the time zone name, replaced with an empty string if it is not found
                // %z: the time zone offset from UTC, with a leading plus sign for UTC and zones east of UTC and a minus sign for those west of UTC, hours and minutes follow each padded to 2 digits and with no delimiter between them
        return str;
    },

    /**
     * @locus Anywhere
     * @param {Date} date
     * @param {Object} opts an option object with following keys
     *  - format: the strftime desired format, defaulting to '%Y-%m-%d'
     *  - default: the string to return if date is not set or empty, defaulting to ''
     * @returns {String} the provided date as a formatted string
     */
    toString( date, opts={} ){
        let str;
        if( this.isValid( date )){
            str = strftime( opts.format || this.format.strftime, new Date( date ));
        } else {
            str = opts.default || '';
        }
        //console.debug( date, opts, str );
        return str;
    },

    /* ***************************** */

    // default formats used by this
    formatx: {
        jQuery: 'yy-mm-dd'
    },

    dayms: 86400000,

    // switch hour
    switchHour: '00:00:00',

    // default timezone
    timeZone: 'UTC',

    /**
     * @summary Returns the current date for the given timezone
     * @param {String} timezone
     * @returns {Date}
     */
    date( timezone ){
        let date = new Date();
        let str = date.toLocaleString( 'en-US', { timeZone: timezone });
        //console.debug( 'date', date, 'str', str );
        return new Date( str );
    },

    /**
     * @locus Anywhere
     * @returns {Date} the current UTC date with hour-minute-seconds=0
     *
     * Ex:
     *  localtime: Thu Sep  7 09:38:21 PM CEST 2023
     *  new Date(): 2023-09-07T19:38:21.057Z
     *  today.toUTCString(): Thu, 07 Sep 2023 00:00:00 GMT
     */
    UTC(){
        const today = new Date();
        today.setUTCHours( 0, 0, 0, 0 );
        return today;
    }
};
