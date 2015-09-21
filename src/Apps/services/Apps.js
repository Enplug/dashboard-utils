angular.module('enplug.utils.apps').factory('Apps', function (Endpoint) {
    'use strict';

    return {

        loadDeveloperApps: function () {
            return Endpoint.get({ path: 'Apps.loadForDeveloper' });
        },

        loadAppsByVenue: function (venueId) {
            return Endpoint.get({
                path: 'Apps.loadByVenue',
                params: { venueId: venueId }
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
                params: { appid: appId }
            });
        },

        createApp: function (app) {
            return Endpoint.post({
                path: 'App.create',
                data: app
            });
        },

        activateApp: function (app) {
            return Endpoint.post({
                path: 'App.activate',
                data: { AppId: app.Id }
            });
        },

        updateApp: function (app) {
            return Endpoint.post({
                path: 'App.update',
                data: app
            });
        },

        updateResources: function (appId, packageId, jarId) {
            return Endpoint.post({
                path: 'App.updateResources',
                data: {
                    AppId: appId,
                    PackageResourceId: packageId,
                    JarResourceId: jarId
                }
            });
        },

        deleteApp: function (app) {
            return Endpoint.delete({
                path: 'App.remove',
                params: { appid: app.AppId }
            });
        }
    };

});
