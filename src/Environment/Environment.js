angular.module('enplug.utils', []).constant('Environment', {

    // Environment list
    PRODUCTION: 'prod',
    STAGING: 'staging',
    DEV: 'dev',

    /**
     * Returns a string name of the current environment from local storage, or inferred from host name if not
     * available in local storage.
     * @returns {String}
     */
    get: function () {
        var env = localStorage.getItem('env'),
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
        localStorage.setItem('env', env);
        return env;
    },
    isProduction: function () {
        return this.get() === this.PRODUCTION;
    },
    isStaging: function () {
        return this.get() === this.STAGING;
    },
    isDev: function () {
        return this.get() === this.DEV;
    },
    setEnvironment: function (env, callback) {
        localStorage.setItem('env', env);
        if (callback) {
            callback();
        }
    },
    hosts: function () {
        return {
            dev:  {
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
    },
    host: function (type) {
        var env = this.hosts()[this.get()];
        return type ? env[type] : (env.adserver || env);
    }
});
