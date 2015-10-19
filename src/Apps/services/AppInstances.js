angular.module('enplug.utils.apps').factory('AppInstances', function (Endpoint, AppUtilities, _) {
    'use strict';

    return {

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
         * Loads instances and assets for an account. If no accountId provide, takes account from token used
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

        startApp: function (appId, venueId) {

            // Hard-coded because they don't change between apps
            var triggers = [{ TriggerType: 'Interaction' }, { TriggerType: 'TimePercentage' }];
            return Endpoint.post({
                path: 'AppInstances.start',
                data: {
                    AppId: appId,
                    VenueId: venueId,
                    Triggers: triggers
                }
            });
        },

        stopApp: function (instanceId) {
            return Endpoint.post({
                path: 'AppInstances.stop',
                data: { AppInstanceId: instanceId }
            });
        },

        updateFrequencies: function (venueId, appInstances, isText) {
            var frequencies = [];
            _.each(appInstances, function (appInstance) {
                frequencies.push({
                    AppInstanceId: appInstance.Id || appInstance.instanceId,
                    
                    //Old accounts may still use numbers
                    Frequency: isText ? appInstance.duration : parseInt(appInstance.duration, 10)
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
        
        updateFrequency: function (displayId, appInstance) {
            return Endpoint.post({
                path: 'Apps.setFrequencies',
                data: {
                    VenueId: venueId,
                    Frequencies: {
                        AppInstanceId: appInstance.Id,
                        Frequency: appInstance.duration
                    }
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
