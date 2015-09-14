angular.module('enplug.utils.apps').factory('AppInstances', function (Endpoint, AppUtilities, CacheFactory, _) {
    'use strict';

    // FIXME: when to invalidate/update cache of an app instance

    var instancesCache = CacheFactory('instances');

    var service = {

        loadInstance: function (instanceId) {
            return Endpoint.get({
                path: 'AppInstances.load',
                params: { appinstanceid: instanceId },
                // We want to return the app instance already in the array, if there is one (there always should be)
                parse: function (instance) {
                    AppUtilities.parseJson(instance.Assets);
                    return instance;
                }
            });
        },

        /**
         * Loads all instances for a user and stores them to be retrieved later.
         * @param venueId
         */
        loadInstances: function (venueId) {
            return Endpoint.get({
                path: 'AppInstances.loadAllByVenue',
            //    cache: instancesCache,
                params: {
                    returnAll: true,
                    venueid: venueId
                },
                parse: function (result) {
                    // Mark misconfigured apps
                    var instances = result.AppInstanceResponses;
                    _.each(result.MisconfiguredApps, function (misconfiguredApp) {
                        var instance = _.findWhere(instances, { AppId: misconfiguredApp.AppId });
                        instance._isMisconfigured = true;
                    });
                    _.each(instances, function (instance) {
                        // Parse JSON complex assets ahead of time
                        AppUtilities.parseJson(instance.Assets);
                    });
                    return instances;
                }
            });
        },

        loadInstanceByApp: function (displayId, appId) {
            return Endpoint.get({
                path: 'AppInstances.loadByApp',
                params: {
                    venueid: displayId,
                    appid: appId
                },
                parse: function (instance) {
                    AppUtilities.parseJson(instance.Assets);
                    return instance;
                }
            });
        },

        enableApp: function (app, venue, triggers) {
            // venue parameter could be object or venue id
            var venueId = _.isObject(venue) ? venue.Id : venue,
            // app could be object or id
                appId = _.isObject(app) ? app.Id : app;

            return Endpoint.post({
                path: 'AppInstances.start',
                data: {
                    AppId: appId,
                    VenueId: venueId,
                    Triggers: triggers
                }
            });
        },

        disableApp: function (instance, venue) {
            // venue parameter could be object or venue id
            var venueId = _.isObject(venue) ? venue.Id : venue;
            return Endpoint.post({
                path: 'AppInstances.stop',
                data: {
                    AppInstanceId: _.isObject(instance) ? instance.Id : instance
                }
            });
        },

        updateFrequencies: function (venueId, appInstances) {
            var frequencies = [];
            _.each(appInstances, function (appInstance) {
                frequencies.push({
                    AppInstanceId: appInstance.Id || appInstance.instanceId,
                    Frequency: parseInt(appInstance.duration, 10)
                });
            });
            return Endpoint.post({
                path: 'Apps.setFrequencies',
                data: {
                    VenueId: venueId,
                    Frequencies: frequencies
                }
            });
        },

        /**
         * Admin and Developer method for loading all instances of an app.
         * @param app
         */
        loadInstancesForApp: function (app) {
            var appId = _.isObject(app) ? app.AppId : app;
            return Endpoint.get({
                admin: true,
                path: 'AppInstances.loadAllByApp',
                params: {
                    appid: appId,
                    returnAll: true
                }
            });
        }
    };

    return service;
});
