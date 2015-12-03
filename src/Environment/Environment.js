angular.module('enplug.utils.environment', []).provider('Environment', function () {
    'use strict';

    var cookieName = 'ENVIRONMENT';

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(window.location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
    function getCookie(sKey) {
        if (!sKey) {
            return null;
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    }

    function setCookie(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
            case Number:
                sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                break;
            case String:
                sExpires = "; expires=" + vEnd;
                break;
            case Date:
                sExpires = "; expires=" + vEnd.toUTCString();
                break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    }

    // Environment list
    this.PRODUCTION = 'prod';
    this.STAGING = 'staging';
    this.DEV = 'dev';

    /**
     * Returns a string name of the current environment from cookies, param, or inferred from host name
     * @returns {String}
     */
    this.get = function () {

        // first check if we have a manual environment stored in session cookies
        var env = getCookie(cookieName),
            hosts = {
                'dashboard.enplug.com': this.PRODUCTION,
                'staging.enplug.com': this.STAGING
            },
            host = window.location.hostname;

        // Make sure the cookie matches a valid host
        if (this.hosts()[env]) {
            return env;
        }

        // Check to see if environment is stored as query parameter
        var param = getParameterByName(cookieName.toLowerCase());

        // Make sure the param is a valid setting and store for future sessions, because
        // the URL will change but the environment should stay the same
        if (this.hosts()[param]) {
            env = param;
            setCookie(cookieName, env);
        } else {

            // Default environment settings by host, or staging default
            env =  hosts[host] || this.STAGING;
        }

        return env;
    };

    this.isProduction = function () {
        return this.get() === this.PRODUCTION;
    };

    this.isStaging = function () {
        return this.get() === this.STAGING;
    };

    this.isDev = function () {
        return this.get() === this.DEV;
    };

    this.setEnvironment = function (env, callback) {
        setCookie(cookieName, env);
        if (callback) {
            callback();
        }
    };

    this.hosts = function () {
        return {
            dev: {
                adserver: 'https://aws-dev1.enplug.com/v1',
                social: 'https://aws-dev1.enplug.com/v1/social'
            },
            staging: {
                adserver: 'https://staging-adserver.enplug.com/v1',
                social: 'https://staging-social.enplug.com/v1'
            },
            prod: {
                adserver: 'https://adservernet.enplug.com/v1',
                monitoring: 'https://monitoring.enplug.com/v1',
                social: 'https://social-server.enplug.com/v1'
            }
        };
    };

    this.host = function (type) {
        var env = this.hosts()[this.get()];
        return type ? env[type] : (env.adserver || env);
    };

    this.$get = function () {
        return this;
    }
});
