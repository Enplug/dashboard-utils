/* Set current domain ahead to prevent security errors especially in IE and Safari */
var extension = location.host.split('.').pop();
switch ( extension ) {
    case 'com' :
        document.domain = 'enplug.com';
        break;
    case 'in' :
        document.domain = 'enplug.in';
        break;
    case 'loc' :
        document.domain = 'enplug.loc';
        break;
}
console.log('Environment initialized to', document.domain);

angular.module('enplug.utils.environment', []).provider('Environment', function () {
    'use strict';

    var cookieName = 'ENVIRONMENT',
        paramName = cookieName.toLowerCase(),
        domainEnvMap,
        fallbackEnv,
        currentEnv;

    // immutable Environment list on 'this'
    Object.defineProperties( this, {
        PRODUCTION: {
            configurable: false,
            enumerable: true,
            writeable: false,
            value: 'prod'
        },
        STAGING: {
            configurable: false,
            enumerable: true,
            writeable: false,
            value: 'staging'
        },
        DEV: {
            configurable: false,
            enumerable: true,
            writeable: false,
            value: 'dev'
        }
    });

    // set 'fallback' environment enum here for easy changing later
    fallbackEnv = this.PRODUCTION;

    // maps domains to expected environment
    // todo remove these notes below (maybe?)
    //  prod dashboard is on .com
    //  prod apps are on .net
    //  staging apps and dashboard are on .in
    //  local is for local dev envs (must be set in your computers "hosts" file to 127.0.0.1)
    domainEnvMap = angular.extend( Object.create( null ), {
        'enplug.com': this.PRODUCTION,
        'enplug.net': this.PRODUCTION,
        'enplug.in': this.STAGING,
        'enplug.local': this.DEV,
        'enplug.loc': this.DEV
    });

    /**********************
     *** HELPERS
     **********************/

    // Returns query parameter value ?environment=X
    function getParameterByName( name ) {
        // escape [ and ] for string style regex constructor
        name = name.replace( /[\[]/g, '\\[' ).replace( /[\]]/g, '\\]' );

        // create regex and match against window.location.search
        var regex = new RegExp( '[\\?&]' + name + '=([^&#]*)' ),
            results = regex.exec( window.location.search );

        /*
        console.group( 'getParameterByName' );
        console.dir({
            name: name,
            regex: regex,
            results: results
        });
        console.groupEnd();
        */

        // return null if not found, otherwise decode result
        return results === null ? null : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ));
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
    // Returns session cookie value ENVIRONMENT=X
    function getCookie( sKey ) {
        if ( !sKey ) {
            return null;
        }

        var encodedKey = encodeURIComponent( sKey );

        return document.cookie.split( ';' )
            .reduce(function( value, keyValueString ) {
                if ( value !== null ) {
                    // already found short circuit
                    return value;
                }

                // turn raw cookie 'key=value' into [ 'key', 'value' ]
                var pairArray = keyValueString.trim().split( '=' ); // trimming could be an issue if 'value' ends with ' '

                // FOUND the COOKIE!
                if ( pairArray[ 0 ] === encodedKey ) {
                    return pairArray[ 1 ];
                }

                return value;
            }, null );
    }

    // Sets session cookie value ENVIRONMENT=X
    function setCookie(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if ( !sKey || (/^(?:expires|max\-age|path|domain|secure)$/i).test( sKey )) {
            return false;
        }

        var cookieFields = [],
            sExpires = '';

        // normalize expires value
        if ( vEnd ) {
            switch ( vEnd.constructor ) {
                case Number:
                    sExpires = vEnd === Infinity ? 'expires=Fri, 31 Dec 9999 23:59:59 GMT' : 'max-age=' + vEnd;
                    break;
                case String:
                    sExpires = 'expires=' + vEnd;
                    break;
                case Date:
                    sExpires = 'expires=' + vEnd.toUTCString();
                    break;
                default:
                    // todo?
                    break;
            }
        }

        // always exists
        cookieFields.push( encodeURIComponent( sKey ) + '=' + encodeURIComponent( sValue ));

        if ( sExpires !== '' ) {
            cookieFields.push( sExpires );
        }

        // could exist
        if ( sDomain ) {
            cookieFields.push( 'domain=' + sDomain );
        }

        if ( sPath ) {
            cookieFields.push( 'path=' + sPath );
        }

        if ( bSecure ) {
            cookieFields.push( 'secure' );
        }

//        console.log( 'Environment _setCookie: setting cookie to ' + cookieFields.join( '; ' ));
        document.cookie = cookieFields.join( '; ' );
        return true;
    }

    /**********************
     *** END HELPERS
     **********************/

    this.isValidEnvValue = (function() {
        var envValues = [ this.PRODUCTION, this.STAGING, this.DEV ];

        return function( value ) {
            return envValues.some(function( envVal ) { return envVal === value; });
        }
    }).call( this );

    // Returns an environment based on default key-value between domain
    // and inferred environment
    this.getDefault = function() {
//        console.log( 'Environment.getDefault(): using host ' + window.location.hostname );
        var hostLessSubdomain = window.location.hostname.split( '.' ).slice( 1 ).join( '.' );

        if ( hostLessSubdomain in domainEnvMap ) {
//            console.log( 'Environment.getDefault(): found current domain in domain to env map => ' + hostLessSubdomain + ':' + domainEnvMap[ hostLessSubdomain ]);
            return domainEnvMap[ hostLessSubdomain ];
        }

//        console.log( 'Environment.getDefault(): couldn\'t find enpoint using fallback (staging)' );
        return fallbackEnv;
    };

    /**
     * Returns a string name of the current environment ie: 'prod', 'staging', 'dev'
     * Settings are returned in that order
     * @returns {String}
     */
    this.get = function() {
//        console.log( 'Environment.get() => ' + currentEnv );
        return currentEnv;
    };

    this.isProduction = function() {
        return this.get() === this.PRODUCTION;
    };

    this.isStaging = function() {
        return this.get() === this.STAGING;
    };

    this.isDev = function() {
        return this.get() === this.DEV;
    };

    this.hosts = function() {
        return {
            dev: {
                adserver: 'https://staging-adserver.enplug.in/v1',
                monitoring: 'https://staging-monitoring.enplug.in/v1/edumonitoring/edumonitoring',
                social: 'https://staging-social.enplug.in/v1'
            },
            staging: {
                adserver: 'https://staging-adserver.enplug.in/v1',
                monitoring: 'https://staging-monitoring.enplug.in/v1/edumonitoring/edumonitoring',
                social: 'https://staging-social.enplug.in/v1'
            },
            prod: {
                adserver: 'https://adservernet.enplug.com/v1',
                monitoring: 'https://monitoring.enplug.com/v1/edumonitoring',
                social: 'https://social-server.enplug.com/v1'
            }
        };
    };

    this.host = function( type ) {
        var env = this.hosts()[ this.get() ];
        return type ?
           env[ type ] :
           ( env.adserver || env );
    };

    this.$get = function() {
        return this;
    };


    /**********************
     * INITIAL LOOKUP
     *  do lookup for env
     *   1) query param: ?environment=X
     *   2) cookie: ENVIRONMENT=X
     *   3) infer from hostname
     *   4) fallback to production
     **********************/
    // closure wrapped to keep provider namespace clean
    // also this only needs to run once, no need to hold on the the memory
    (function() {
        var paramValue = getParameterByName( paramName ),
            cookieValue = getCookie( cookieName ),
            setEnv = function( env ) {
                setCookie( cookieName, env );
                return currentEnv = env;
            };

        // lookup+set from query param
        if ( paramValue != null && this.isValidEnvValue( paramValue )) {
//            console.log( 'Environment: found initial env in query param => ' + paramValue );
            return setEnv( paramValue );
        }

        // lookup from cookie (no need to set here)
        if ( cookieValue != null && this.isValidEnvValue( cookieValue )) {
//            console.log( 'Environment: found initial env in cookie => ' + cookieValue );
            return currentEnv = cookieValue;
        }

//        console.log( 'Environment: falling back to getDefault function' );
        // lookup+set from hostname
        return setEnv( this.getDefault() );
    }).call( this );

});
