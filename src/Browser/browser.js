angular.module('enplug.utils.browser', []).factory('Browser', function () {
    'use strict';

    var supported = {
        Chrome: '43',
        Firefox: '38',
        IE: '10',
        Safari: '7'
    };

    function getBrowser() {
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return {name: 'IE', version: (tem[1] || '')};
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/);
            if (tem != null) {
                return {name: 'Opera', version: tem[1]};
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) {
            M.splice(1, 1, tem[1]);
        }
        return {
            name: M[0],
            version: M[1]
        };
    }

    return {
        supported: function () {
            var browser = getBrowser();
            if (supported[browser.name]) {
                var supportedVersion = parseInt(supported[browser.name]),
                    userVersion = parseInt(browser.version);
                return userVersion >= supportedVersion;
            }
            return false;
        }
    }
});
