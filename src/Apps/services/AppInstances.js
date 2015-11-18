angular.module('enplug.utils.apps').factory('AppInstances', function (Endpoint, AppUtilities, _) {
    'use strict';

    return {

        loadInstance: function (instanceId) {
            return Endpoint.get({
                path: 'AppInstances.load',
                params: { appinstanceid: instanceId },
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

        /**
         * Loads instances and assets for an account. If no accountId provide, takes account from token used.
         * Used for chain apps, like graphics.
         * @param appId
         * @param accountId
         */
        loadInstancesForAccountByApp: function (appId, accountId) {
            var params = { appid: appId };
            if (accountId) {
                params.accountid = accountId;
            }
            return Endpoint.get({
                path: 'AppInstances.loadForAccountByApp',
                params: params,
                parse: function (instances) {
                    instances.forEach(function (instance) {
                        AppUtilities.parseJson(instance.Assets);
                    });

                    return instances;
                }
            })
        },

        /**
         * Returns app info and instance info if a venue ID is provided.
         */
        loadAppInfo: function (accountId, appId, venueId) {
            return Endpoint.get({
                path: 'AppInstances.loadAppInfo',
                params: {
                    accountid: accountId,
                    appid: appId,
                    venueid: venueId
                },
                parse: function (instance) {
                    AppUtilities.parseJson(instance.Assets);
                    return instance;
                }
            });
        },

        startApp: function (appId, venueId) {

            // Hard-coded because they don't change between apps
            var triggers = [{ TriggerType: 'Interaction' }, { TriggerType: 'TimePercentage' }];
            return Endpoint.post({
                path: 'AppInstances.start',
                data: {
                    AppId: appId,
                    VenueId: venueId,
                    Triggers: triggers,
                    FrequencyLevel: 'Medium'
                }
            });
        },

        stopApp: function (instanceId) {
            return Endpoint.post({
                path: 'AppInstances.stop',
                data: {
                    AppInstanceId: instanceId,
                    UseFrequencyLevels: true
                }
            });
        },

        updateFrequencies: function (venueId, appInstances) {
            var frequencies = [];
            _.each(appInstances, function (appInstance) {
                frequencies.push({
                    AppInstanceId: appInstance.Id,
                    FrequencyLevel: appInstance.FrequencyLevel
                });
            });
            return Endpoint.post({
                path: 'AppInstances.setFrequencies',
                data: {
                    VenueId: venueId,
                    UseFrequencyLevels: true,
                    Frequencies: frequencies
                }
            });
        },

        updateFrequency: function (venueId, instanceId, frequencyLevel) {
            return Endpoint.post({
                path: 'AppInstances.setFrequency',
                data: {
                    VenueId: venueId,
                    AppInstanceId: instanceId,
                    FrequencyLevel: frequencyLevel
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
});
