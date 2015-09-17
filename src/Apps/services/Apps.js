angular.module('enplug.utils.apps').factory('Apps', function (Endpoint, CacheFactory) {
    'use strict';

    var appsCache = CacheFactory('appsCache', {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }),
        appCache = CacheFactory('appCache');
    return {

        loadDeveloperApps: function () {
            return Endpoint.get({
                path: 'Apps.loadForDeveloper'
            });
        },

        loadAppsByVenue: function (venueId) {
            return Endpoint.get({
                path: 'Apps.loadByVenue',
                params: { venueId: venueId },
                cache: appsCache
            });
        },

        loadFromStore: function () {
            return Endpoint.get({
                path: 'Apps.loadFromStore'
            });
        },

        loadFromStoreByApp: function (id) {
            return Endpoint.get({
                path: 'Apps.loadFromStoreByApp',
                params: { appid: id }
            });
        },

        saveStoreInfo: function (appInfo) {
            return Endpoint.post({
                path: 'Apps.saveStoreInfo',
                data: appInfo
            });
        },

        loadAppReviews: function (id) {
            return Endpoint.get({
                path: 'Apps.loadReviewsByApp',
                params: { appid: id }
            });
        },

        loadApp: function (appId) {
            return Endpoint.get({
                path: 'App.load',
                params: { appid: appId },
                cache: appCache // TODO: cache with app ID as key
            });
        },

        createApp: function (app) {
            return Endpoint.post({
                path: 'App.create',
                data: app,
                success: function () {
                    appCache.removeAll();
                }
            });
        },

        activateApp: function (app) {
            return Endpoint.post({
                path: 'App.activate',
                data: { AppId: app.Id },
                success: function () {
                    appsCache.removeAll();
                }
            });
        },

        updateApp: function (app) {
            return Endpoint.post({
                path: 'App.update',
                data: app,
                success: function () {
                    appsCache.removeAll();
                    appCache.removeAll();
                }
            });
        },

        updateResources: function (appId, packageId, jarId) {
            return Endpoint.post({
                path: 'App.updateResources',
                data: {
                    AppId: appId,
                    PackageResourceId: packageId,
                    JarResourceId: jarId
                },
                success: function () {
                    appsCache.removeAll();
                    appCache.removeAll();
                }
            });
        },

        /**
         * Only call when the app has no instances
         */
        deleteApp: function (app) {
            return Endpoint.delete({
                path: 'App.remove',
                params: {
                    appid: app.AppId
                },
                success: function () {
                    appsCache.removeAll();
                    appCache.removeAll();
                }
            });
        }
    };

});
