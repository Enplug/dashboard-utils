angular.module('enplug.utils.environment', []).provider('Environment', function () {
    'use strict';

    var cookieName = 'ENVIRONMENT';

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
     * Returns a string name of the current environment from cookies, or inferred from host name
     * @returns {String}
     */
    this.get = function () {
        var env = getCookie(cookieName),
            hosts = {
                'app.enplug.com': this.PRODUCTION,
                'staging.enplug.com': this.STAGING,
                'dev.enplug.com': this.DEV
            },
            host = window.location.hostname;
        if (angular.isString(env)) {
            return env;
        }
        env = hosts[host] || this.STAGING;
        setCookie(cookieName, env);
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
