/*
 * pwix:validity/src/client/components/validities_band/validities_band.js
 *
 * Validities horizontal band.
 *
 * Parms:
 * - periods: the array of available validity periods, sorted by ascending effect start date
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import './validities_band.html';

Template.validities_band.onCreated( function(){
    const self = this;
});

Template.validities_band.onRendered( function(){
    const self = this;
    const appDate = Meteor.APP.Date;

    // have a colored band for each period from infinite to infinite
    //  leaving free periods without color
    self.autorun(() => {
        const periods = Template.currentData().periods;

        self.$( '.c-validities-band .band' ).empty();
        let $div;

        if( periods.length ){

            // build an array of all to-be-displayed parts
            let parts = [];
            for( let i=0 ; i<periods.length ; ++i ){
                // do we have a hole with a start date ?
                //  if yes, this means we have a used part before
                if( appDate.isValid( periods[i].start )){
                    const start = i ? appDate.toString( appDate.compute( periods[i-1].end, +1 )) : null;
                    parts.push({
                        class: 'used',
                        start: start,
                        end: appDate.toString( appDate.compute( periods[i].start, -1 ))
                    });
                }
                // and set the hole as a free period
                parts.push({
                    class: 'free',
                    start: periods[i].start,
                    end: periods[i].end
                });
            }
            // if last hole has a valid end date, then there is still is a last used period
            if( appDate.isValid( periods[periods.length-1].end )){
                parts.push({
                    class: 'used',
                    start: appDate.toString( appDate.compute( periods[periods.length-1].end, +1 )),
                    end: null
                });
            }

            // calculate the width of each
            const width = 100 / parts.length;
            for( let i=0 ; i<parts.length ; ++i ){
                $div = $( '<div></div' ).css({ width: width+'%' }).addClass( parts[i].class );

                switch( parts[i].class ){
                    case 'used':
                        if( !appDate.isValid( parts[i].start )){
                            $div.attr( 'title', pwixI18n.label( I18N, 'validities.band.used_to', appDate.toString( parts[i].end )));
                        } else if( appDate.isValid( parts[i].end )){
                            $div.attr( 'title', pwixI18n.label( I18N, 'validities.band.used_fromto', appDate.toString( parts[i].start ), appDate.toString( parts[i].end )));
                        } else {
                            $div.attr( 'title', pwixI18n.label( I18N, 'validities.band.used_from', appDate.toString( parts[i].start )));
                        }
                        break;

                    case 'free':
                        if( !appDate.isValid( parts[i].start )){
                            $div.attr( 'title', pwixI18n.label( I18N, 'validities.band.free_to', appDate.toString( parts[i].end )));
                        } else if( appDate.isValid( parts[i].end )){
                            $div.attr( 'title', pwixI18n.label( I18N, 'validities.band.free_fromto', appDate.toString( parts[i].start ), appDate.toString( parts[i].end )));
                        } else {
                            $div.attr( 'title', pwixI18n.label( I18N, 'validities.band.free_from', appDate.toString( parts[i].start )));
                        }
                        break;
                }
                self.$( '.c-validities-band .band' ).append( $div );
            }

        // no free period at all - have only one full used period
        } else {
            $div = $( '<div></div' ).css({ width: '100%' }).addClass( 'used' );
            $div.attr( 'title', pwixI18n.label( I18N, 'validities.band.used_fromto_infinite' ));
            self.$( '.c-validities-band .band' ).append( $div );
        }
    });
});
