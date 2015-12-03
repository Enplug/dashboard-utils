angular.module('enplug.utils.apps', ['enplug.utils.endpoint']);

angular.module('enplug.utils.apps').run(function (EndpointOptions, AppEndpoints) {
    'use strict';

    // Add the app framework endpoints to the map of available endpoints
    EndpointOptions.setEndpoints(AppEndpoints);
});

/**
 * @ngdoc service
 * @name Endpoint
 * @module enplug.utils
 * @function
 * @description
 * Core service used to interact with any API over HTTP. Uses helper files EndpointCall and EndpointOptions.
 *
 * #General usage
 *
 * Endpoint calls should generally be made from services within the WebApp. They shouldn't be made from controllers,
 * because you want your API calls to be reusable by multiple controllers (DRY).
 *
 * Endpoint exposes 3 public methods - `.get()`, `.post()`, and `.delete()` for you to make calls with. Each call
 * accepts the same configuration object described below.
 *
 *
 * #Creating and Configuring an API call
 *
 * The following options are available for all API calls:
 *
 *    - **method** – `{string}` – HTTP method (e.g. 'GET', 'POST', etc)
 *
 *    - **endpoint** - `{string}` - Named endpoint from Endpoints.js for our AdServer. Example: Venue.create
 *
 *    - **url** – `{string}` – Absolute URL with hostname used for making 3rd party API calls. Overrides path/endpoint.
 *    If setting this, you usually will want to set a custom transformResponse callback as well so that Endpoint knows
 *    how to parse the data returned from the 3rd party API. If no transformResponse function is set, Endpoint will log
 *    a warning. Example URL: https://google.com/api/endpoint.js
 *
 *    - **host** - `{string}` - Host to use for this API call, if different from default AdServer host. The host
 *    will be combined with the endpoint given, which can either be a dot-notation path from Endpoints.js, or the end of
 *    an API url. E.g. `host = 'https://mydomain.com'`, `endpoint = '/v1/my-endpoint';` will result in
 *    `https://mydomain.com/v1/my-endpoint/';` You can achieve the same using the `url` config.
 *
 *    - **data** - `{Object}` - Javascript object to send along as POST data.
 *
 *    - **prepare** - `{function(payload)}` - Function called before sending data in POST request. Use to transform
 *    data into a format expected by server. Note: data is deep copied before being processed by this function.
 *
 *    - **params** – `{Object}` – Javascript object of key-value pairs to send as URL parameters. Note: the token is
 *    automatically appended as the first URL parameter for all API calls if useToken is true.
 *
 *    - **admin** - `{boolean}` - Flag indicating whether Endpoint should use the admin token or RunningAs token for
 *    admins. If true, Endpoint will use the token of the network user (e.g. alex@enplug.com) even if the user is
 *    running as a venue.
 *
 *    - **transformResponse** - `{callback(response)}` - Override this function when making non-JSON API calls.
 *    This function must return a payload in the following format: `{ data: Object, error: boolean, reason: string }`.
 *    Set error to true and provide a reason when an API response failed, and the Endpoint class will know how to handle
 *    the failure. Otherwise set error to false and provide a successful result to the data key to create a successful
 *    Endpoint response.
 *
 *    - **checkResponse** - `{callback({data: {}, error: bool, reason: string)}` - Override this function to handle API responses in a custom way.
 *    This function must return a payload in the following format: `{ data: Object, error: boolean, reason: string }`.
 *    Set error to true and provide a reason when an API response failed, and the Endpoint class will know how to handle
 *    the failure. Otherwise set error to false and provide a successful result to the data key to create a successful
 *    Endpoint response.
 *
 *    - **parse** - `{callback(data)}` - Use this function to alter the data returned in an API call and pass the result
 *    down the promise chain. Second function called in Endpoint callback stack.
 *
 *    - **success** - `{callback(data)}` - Success function callback that will be called upon a successful
 *    HTTP response.  Third function called in Endpoint callback stack. Important note: the return value is ignored.
 *
 *    - **error** - `{callback(reason)}` - Error callback. Like success callback, the return value is ignored.
 *
 *    - **successMessage** - `{string}` - Message to show in an Alert on successful Endpoint response.
 *    Default: no Alert is shown.
 *
 *    - **errorMessage** - `{string}` - Message to show in an Alert when an Endpoint request fails.
 *    Default: ErrorMessage string returned by API call/AdServer. Set to false to not show an Alert when an
 *    Endpoint request fails.
 *
 *    - **useToken** - `{boolean}` - Toggle using the User's token on/off. User tokens are auto-appended to URLs unless
 *    this value is set to false.
 *
 * ##Examples
 *
 *  ```js
 *   // Simple GET request example :
 *   Endpoint.get({
 *      path: 'Venue.r',
 *      params: {
 *          venueid: '1234'
 *      },
 *      success: function (data) {
 *          $log.debug('Received venue', data);
 *      }
 *   });```
 *
 *  ```js
 *   // POST request example :
 *   Endpoint.post({
 *      path: 'Venue.c',
 *      data: {
 *          Name: 'My Venue',
 *          Address: '123 Happy Street'
*       },
*       admin: true, // turns on Admin tokens
*       prepare: function (data) {
*           // This will modify the data sent to the server.
*           // data has already been copied by this point, and
*           // is safe to manipulate without affecting
*           // the object passed in by the caller.
*           return data.Name += ' with extra data';
*       },
*       parse: function (result) {
*           // Modify the data returned from the server before passing it
*           // down the promise chain.
*           return data.Name = 'A fake name';
*       }
 *      success: function (result) {
 *          // Perform callback functionality without affecting the promise chain
 *          $log.debug('Received venue', result);
 *      }
 *   });```
 *
 * #Return Value
 *
 * Endpoint calls return a chainable HTTP promise derived from the AngularJS $q framework. This return value can be
 * chained using `.then()` method calls upon it. The (success) data or (error) reason passed into the promise chain
 * is determined using the callbacks described below.
 *
 *
 * #Callback Stack
 *
 * A successful API response goes through three levels of callbacks:
 *
 * 1. **transformResponse**: used by AngularJS to parse the response directly from the API. Override this
 * if you need to parse XML or other data formats. Default successfully handles JSON.
 *
 * 2. **checkResponse**: used to parse the response directly from the API. The default setting for
 * this callback knows how to interpret our AdServer's API responses. When interacting with any other 3rd party API
 * you'll need to provide your own transform response function and return the expected result structure described above.
 *
 * 3. **parse**: this function is passed the result of `transformResponse` and is the end-user's opportunity to alter
 * the data that will be sent down the promise chain. This function must return a value in order for that value to be
 * passed down the promise chain.
 *
 * 4. **success**: this function receives the result of `transformResponse` and `parse` (if used). It is an opportunity
 * to respond to the API call. However, the return value is ignored and not passed down the promise chain.
 * This means you should use this method when you want to respond to an Endpoint call without altering the data that
 * will be passed to other potential users of the promise.
 *
 * 4. **error**: separate from the 3 callbacks above, the `error` callback function is called upon a failed API response
 * and will be passed the reason for the failure.
 *
 *
 * #Success Response
 *
 * Success responses will be automatically shown to the user in an Alert dialog *only* if you provide a
 * `successMessage`. They are *not* automatically logged to console.
 *
 * #Error Response
 *
 * Error responses *will* be automatically shown to the user *unless* you set the `errorMessage` config option
 * to `false`. Errors *are* automatically logged to console.
 */
angular.module('enplug.utils.endpoint', []).service('Endpoint', ['EndpointCall', '$log', function (EndpointCall, $log) {
    'use strict';

    var verboseMode = false,
        counter = 0,
        history = [];

    function execute(config) {
        counter += 1;
        history[counter] = _.cloneDeep(config);
        if (_.isObject(config)) {
            config.verbose = config.verbose || verboseMode; // enables verbose logging for development
            config.id = counter; // ID to help track API calls in verbose mode
            if (verboseMode) {
                $log.debug('[#' + counter + ' Endpoint] Executing ' + config.method + ' call');
            }
            return new EndpointCall(config);
        }
        $log.error('[#' + counter + ' Endpoint] Invalid config given:', config);
    }

    // Public API
    return {

        /**
         * @ngdoc method
         * @name Endpoint#get
         * @methodOf Endpoint
         * @param {object} params Endpoint options given
         * @returns {HttpPromise} HttpPromise with data from Endpoint call.
         */
        get: function (config) {
            if (_.isObject(config)) config.method = 'GET';
            return execute(config);
        },

        /**
         * @ngdoc method
         * @name Endpoint#post
         * @methodOf Endpoint
         * @param {object} config Endpoint options given
         * @returns {HttpPromise} HttpPromise with data from Endpoint call.
         * @description
         * POST HTTP request
         */
        post: function (config) {
            if (_.isObject(config)) config.method = 'POST';
            return execute(config);
        },

        /**
         * @ngdoc method
         * @name Endpoint#delete
         * @methodOf Endpoint
         * @param {object} config Endpoint options given
         * @returns {HttpPromise} HttpPromise with data from Endpoint call.
         */
        delete: function (config) {
            if (_.isObject(config)) config.method = 'DELETE';
            return execute(config);
        },

        verbose: function (bool) {
            $log.debug('[enplug.utils - Endpoint] Setting verbose mode:', bool);
            verboseMode = bool;
        },

        getHistory: function () {
            return history;
        }
    };
}
]);

/**
 * Created by aleross on 7/23/15. Copyright (c) Enplug, Inc.
 */

angular.module('enplug.utils.libraries', [
    'enplug.utils.libraries.lodash',
    'enplug.utils.libraries.moment'
]);
angular.module('enplug.utils.resource', []).service('ResourceService', ['Endpoint', '$log', 'ResourceTypes', '$q', '$timeout',
    function (Endpoint, $log, ResourceTypes, $q, $timeout) {
        "use strict";

        var checkFrequencyMilliseconds = 2000,
            resourcePaths = {
                read: '/resource',
                byUser: '/resources/byuser',
                remove: '/resource'
            };

        /**
         * Filters resources by ResourceTypes constant values. Accepts either single string and array of types.
         * @param resources
         * @param resourceTypes
         * @returns {*}
         */
        function filterResources(resources, resourceTypes, filter) {
            var filteredResources = [];
            if (resourceTypes && !_.isArray(resourceTypes)) {
                resourceTypes = [resourceTypes];
            }
            $log.debug('Filtering resources by ', resourceTypes);
            _.each(resources, function (resource) {
                resource = setResourceState(resource);
                var add = true;
                // Filter by resource type
                if (resourceTypes) {
                    if (!_.contains(resourceTypes, resource.ResourceType)) {
                        add = false;
                    }
                }
                // Run custom filter function
                if (_.isFunction(filter)) {
                    if (!filter(resource)) {
                        add = false;
                    }
                }
                // If resource passed both filters or no filters were applied, add it.
                if (add) {
                    filteredResources.push(resource);
                }
            });
            return filteredResources;
        }

        function setResourceState(resource) {
            switch (resource.ResourceState) {
            case 'Ready':
                resource.isReady = true;
                break;
            case 'Uploaded':
                resource.isUploaded = true;
                break;
            case 'Encoded':
                resource.isEncoded = true;
                break;
            case 'Error':
                resource.isError = true;
                break;
            }
            return resource;
        }

        function checkResourceState(resourceId, defer) {
            $log.debug('Checking resource state.');
            $timeout(function () {
                Endpoint.get({
                    path: resourcePaths.read,
                    params: {
                        resourceid: resourceId
                    },
                    success: function (resource) {
                        $log.debug('Resource ready:', resource);
                        if (resource.ResourceState === 'Ready') {
                            defer.resolve(resource);
                        } else {
                            checkResourceState(resourceId, defer);
                        }
                    },
                    error: function () {
                        $log.debug('Error while checking resource.');
                        defer.reject();
                    }
                });
            }, checkFrequencyMilliseconds);
        }

        var service = {

            /**
             * Convenience method for loading images and videos.
             * @param [filter]
             * @returns {*}
             */
            loadGraphics: function (filter) {
                return service.loadResourcesByUser([ResourceTypes.IMAGE, ResourceTypes.VIDEO], filter);
            },

            loadResourcesByUser: function (resourceTypes, filter) {
                return Endpoint.get({
                    path: resourcePaths.byUser,
                    parse: function (resources) {
                        return filterResources(resources, resourceTypes, filter);
                    },
                    success: function (resources) {
                        $log.debug('Loaded resources:', resources);
                    }
                });
            },

            completeUpload: function (resourceId) {
                var defer = $q.defer();
                checkResourceState(resourceId, defer);
                return defer.promise;
            },

            setResourceState: setResourceState,

            removeResource: function (resourceId) {
                $log.debug('Deleting resource:', resourceId);
                return Endpoint.delete({
                    path: resourcePaths.remove,
                    params: {
                        resourceid: resourceId
                    },
                    success: function () {
                        $log.debug('Deleted resource: ', resourceId);
                    }
                });
            }
        };
        return service;
    }
]);
angular.module('enplug.utils', [
    'enplug.utils.apps',
    'enplug.utils.browser',
    'enplug.utils.confirm',
    'enplug.utils.endpoint',
    'enplug.utils.environment',
    'enplug.utils.libraries',
    'enplug.utils.resource'
]);

angular.module('enplug.utils.apps').constant('AppEndpoints', {
    App: {
        load: '/appframework/app',
        create: '/appframework/app/create',
        activate: '/appframework/app/activate',
        update: '/appframework/app/update',
        updateResources: '/appframework/app/packages',
        remove: '/appframework/app'
    },
    Apps: {
        loadForDeveloper: '/appframework/apps',
        loadByVenue: '/appframework/apps/byvenue',
        loadFromStore: '/appframework/store/appinfos',
        loadFromStoreByApp: '/appframework/store/appinfo',
        saveStoreInfo: '/appframework/store/appinfo',
        loadReviewsByApp: '/appframework/store/appreviews'
    },
    AppInstances: {
        load: '/appframework/appinstance', // ?appinstanceid={id}
        loadAppInfo: '/appframework/appinstance/info',
        loadAllByVenue: '/appframework/appinstances/byvenue',
        loadAllByApp: '/appframework/appinstances/byapp',
        loadForAccountByApp: '/appframework/assets/byaccount',
        start: '/appframework/appinstance/start',
        stop: '/appframework/appinstance/stop',
        setFrequencies: '/appframework/appinstances/frequencies',
        setFrequency: '/appframework/appinstance/frequency'
    },
    AppAssets: {
        loadAll: '/appframework/assets',
        create: '/appframework/asset/create',
        update: '/appframework/asset/update',
        remove: '/appframework/asset',
        bulk: {
            create: '/appframework/assets/create',
            update: '/appframework/assets/save',
            remove: '/appframework/assets/delete'
        },
        loadDefault: '/appframework/defaultassets/byapp',
        createFromDefault: '/appframework/asset/create/fromdefault'
    },
    AppThemes: {
        load: '/appframework/theme',
        loadAll: '/appframework/themes/byapp',
        create: '/appframework/theme/create',
        remove: '/appframework/theme',
        activate: '/appframework/appinstance/update',
        venuesWithTheme: '/appframework/venueswiththeme'
    }
});

angular.module('enplug.utils.apps').factory('AppAssets', function (Endpoint, AppInstances, AppUtilities) {
    'use strict';

    // We automatically parse JSON assets and add the appInstanceId for convenience.
    function parseAsset(asset, appInstanceId) {
        AppUtilities.parseJson(asset);
        asset.appInstanceId = appInstanceId;
        return asset;
    }

    // We remove empty properties from payload because server needs us to. Supposedly, haven't fully confirmed.
    function removeEmptyProperties(payload) {
        // don't send empty keys
        _.forOwn(payload.Value, function (v, k) {
            if (v === '') {
                delete payload[k];
            }
        });
        return payload;
    }

    function prepareBulkAssets(payload) {
        payload.Assets.forEach(function (asset) {
            removeEmptyProperties(asset);
            if (typeof asset.Value === 'object') {
                asset.Value = JSON.stringify(asset.Value);
            }
        });
        return payload;
    }

    function parseBulkAssetsResponse(response) {
        response.Assets.forEach(function (asset) {
            AppUtilities.parseJson(asset);
        });
        return response.Assets;
    }

    return {

        loadByInstance: function (instanceId) {
            return Endpoint.get({
                path: 'AppAssets.loadAll',
                params: { appinstanceid: instanceId },
                parse: parseBulkAssetsResponse
            })
        },

        /**
         * Creates a new asset, and updates assets stored in service.
         * @param appInstanceId
         * @param value
         * @param name
         */
        createAsset: function (appInstanceId, value, name) {
            return Endpoint.post({
                path: 'AppAssets.create',
                data: {
                    AppInstanceId: appInstanceId,
                    AssetName: _.isUndefined(name) ? 'ObjectAsset' : name,
                    Value: _.isObject(value) ? JSON.stringify(value) : value
                },
                prepare: removeEmptyProperties,
                parse: function (asset) {
                    return parseAsset(asset, appInstanceId);
                }
            });
        },

        /**
         * Removes an asset, and removes from assets stored in service
         * @param appInstanceId
         * @param assetId
         */
        removeAsset: function (appInstanceId, assetId) {
            return Endpoint.delete({
                path: 'AppAssets.remove',
                params: {
                    appinstanceid: appInstanceId,
                    assetid: assetId
                }
            });
        },

        /**
         * Updates an existing asset, and updates the asset stored in service.
         * @param appInstanceId
         * @param assetId
         * @param value
         */
        updateAsset: function (appInstanceId, assetId, value) {
            return Endpoint.post({
                path: 'AppAssets.update',
                data: {
                    AppInstanceId: appInstanceId,
                    AssetId: assetId,
                    Value: angular.isObject(value) ? JSON.stringify(value) : value
                },
                prepare: removeEmptyProperties,
                parse: function (asset) {
                    return parseAsset(asset, appInstanceId);
                }
            });
        },

        /**
         * Creates multiple assets at once.
         *
         * @param assets [{ AppInstanceId: <id>, AssetName: <name>, Value: <id> }]
         * @returns {*|HttpPromise}
         */
        bulkCreateAssets: function (assets) {
            return Endpoint.post({
                path: 'AppAssets.bulk.create',
                data: {
                    Assets: assets
                },
                prepare: prepareBulkAssets,
                parse: parseBulkAssetsResponse
            });
        },

        /**
         * Updates multiple assets at once.
         *
         * @param assets [{ AppInstanceId: <id>, AssetId: <id>, Value: <value> }]
         * @returns {*|HttpPromise}
         */
        bulkUpdateAsset: function (assets) {
            return Endpoint.post({
                path: 'AppAssets.bulk.update',
                data: {
                    Assets: assets
                },
                prepare: prepareBulkAssets,
                parse: parseBulkAssetsResponse

                // FIXME parse the response
            });
        },

        /**
         * Removes multiple assets at once.
         *
         * @param assets [{ AppInstanceId: <id>, AssetId: <id> }]
         * @returns {*|HttpPromise}
         */
        bulkRemoveAssets: function (assets) {
            return Endpoint.post({
                path: 'AppAssets.bulk.remove',
                data: {
                    Assets: assets
                }
            });
        },

        /**
         * Returns default assets for app id like "rss"
         * @param appId
         */
        getDefaultAssets: function (appId) {
            return Endpoint.get({
                path: 'AppAssets.loadDefault',
                params: { AppId: appId },
                parse: function (assets) {
                    return AppUtilities.parseJson(assets);
                }
            });
        },

        createAssetFromDefault: function (appInstanceId, defaultAssetId) {
            return Endpoint.post({
                path: 'AppAssets.createFromDefault',
                data: {
                    AppInstanceId: appInstanceId,
                    DefaultAssetId: defaultAssetId
                },
                parse: function (asset) {
                    return parseAsset(asset, appInstanceId);
                }
            });
        }
    };
});

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
        loadAppInfo: function (appId, venueId) {
            return Endpoint.get({
                path: 'AppInstances.loadAppInfo',
                params: {
                    appid: appId,
                    venueid: venueId
                },
                parse: function (app) {
                    if (app['AppInstance']) {
                        AppUtilities.parseJson(app['AppInstance']['Assets']);
                    }

                    return app;
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

angular.module('enplug.utils.apps').factory('AppThemes', function (Endpoint) {
    'use strict';
    return {

        /**
         * Get themes array by App ID
         */
        loadThemes: function (appId) {
            return Endpoint.get({
                path: 'AppThemes.loadAll',
                params: {
                    appid: appId
                }
            });
        },

        /**
         * Returns a theme object for a given theme ID
         */
        getTheme: function (themeId) {
            return Endpoint.get({
                path: 'AppThemes.load',
                params: {
                    themeid: themeId
                }
            });
        },

        /**
         * Returns a list of venues that are using the specific theme
         * @param theme
         * @returns {*}
         */
        venuesWithTheme: function (theme) {
            return Endpoint.get({
                path: 'AppThemes.venuesWithTheme',
                params: {
                    themeid: theme.id //Id not AppId
                }
            });
        },

        /**
         * Takes a theme package and creates a new theme for a given app
         * theme = { Name, AppID, Assets, IsDefault }
         */
        createTheme: function (theme) {
            return Endpoint.post({
                path: 'AppThemes.create',
                data: theme,
                admin: theme.IsDefault // use admin token when generating default themes
            });
        },

        /**
         * Takes an instance ID and theme ID to be activated
         */
        activateTheme: function (appInstanceId, themeId) {
            return Endpoint.post({
                path: 'AppThemes.activate',
                data: {
                    AppInstanceId: appInstanceId,
                    ThemeId: themeId
                }
            });
        },

        /**
         * Deletes a theme by theme ID
         */
        deleteTheme: function (themeId, admin) {
            return Endpoint.delete({
                path: 'AppThemes.remove',
                params: {
                    themeid: themeId
                },
                admin: admin
            });
        }
    };
});

angular.module('enplug.utils.apps').factory('AppUtilities', function (_) {
    return {
        /**
         * Accepts either array of assets or individual asset
         * @param assets
         */
        parseJson: function (assets) {
            if (_.isArray(assets)) {
                _.each(assets, function (asset) {
                    try {
                        asset.Value = JSON.parse(asset.Value);
                    } catch (e) {}
                });
            } else {
                try {
                    assets.Value = JSON.parse(assets.Value);
                } catch (e) {}
            }
            return assets;
        }
    };
});

angular.module('enplug.utils.apps').factory('Apps', function (Endpoint) {
    'use strict';

    return {

        loadDeveloperApps: function (accountId) {
            return Endpoint.get({
                path: 'Apps.loadForDeveloper',
                params: { accountid: accountId }
            });
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

angular.module('enplug.utils.confirm', ['Confirm/confirm-dialog.tpl']).service('Confirm', ['ngDialog', '$sce', function (ngDialog, $sce) {
    'use strict';

    // Todo have a field for More Info (bottom left?) links to help center
    // Todo tooltips in template? custom html?/body partials?
    // Todo take a value for confirm. Hook into pre-close callback, e.g. type name of venue before deleting.

    var defaults = {
            title: 'Default',
            text: 'Default',
            cancelText: 'Cancel',
            confirmText: 'Confirm',
            confirmClass: 'btn-primary'
        },
        unsavedChangesDefaults = {
            title: 'Please Confirm',
            text: 'There are unsaved changes. Are you sure you want to continue and discard your changes?',
            cancelText: 'Cancel',
            confirmText: 'Discard Changes',
            confirmClass: 'btn-primary'
        };

    return {
        open: function (opts) {

            opts = _.merge({}, defaults, opts);

            return ngDialog.openConfirm({
                template: 'Confirm/confirm-dialog.tpl',
                controller: ['$scope', function($scope) {
                    // controller logic
                    $scope.title = opts.title;
                    $scope.text = $sce.trustAsHtml(opts.text);
                    $scope.cancelText = opts.cancelText;
                    $scope.confirmText = opts.confirmText;
                    $scope.confirmClass = opts.confirmClass;
                }],
                className: 'confirm-dialog',
                showClose: false, // no X in the top right
                trapFocus: false // prevents cancel button from getting auto-focused
            });
        },

        unsavedChanges: function (opts) {
            opts = _.merge({}, unsavedChangesDefaults, opts);
            return this.open(opts);
        }
    };
}]);

angular.module('enplug.utils').factory('EndpointCall',
    function($http, $q, $log, $timeout, EndpointOptions) {
        'use strict';

        function debug(config, message, data) {
            if (config.verbose) {
                log(config, message, data);
            }
        }

        function log(config, message, data, level) {
            if (!level) level = 'debug';
            if (data) {
                // Clone data so properties can't be mutated later
                $log[level]('[#' + config.id + ' EndpointCall] ' + message, _.cloneDeep(data));
            } else {
                $log[level]('[#' + config.id + ' EndpointCall] ' + message);
            }
        }

        function warn(config, message, data) {
            log(config, message, data, 'warn');
        }

        function error(config, message, data) {
            log(config, message, data, 'error');
        }

        function startBrowserLoading() {
            if (!document.getElementById('noisey-endpoint')) {
                var iframe = document.createElement('iframe');
                iframe.src = '//loading.enplug.com';
                iframe.style.display = 'none';
                iframe.setAttribute('id', 'noisy-iframe');
                document.body.appendChild(iframe);
            }
            return iframe;
        }

        function stopBrowserLoading(iframe) {
            if (iframe) {
                $timeout(function () {
                    iframe.remove();
                }, 200);
            }
        }

        /**
         * Success callback called after every successful API response.
         * @param data
         * @param settings
         */
        function successCallback(data, settings) {
            // Show the success message to the user
            if (angular.isFunction(settings.success)) {
                debug(settings, 'Calling success callback.');
                settings.success(data);
            }
        }

        /**
         * Error callback called after every failed API response.
         * @param data String
         * @param settings
         */
        function errorCallback(data, settings) {
            // Show the failure reason to the user
            if (angular.isFunction(settings.error)) {
                debug(settings, 'Calling error callback.');
                settings.error(data);
            }
        }

        /**
         * HTTP Request
         * Success: returns data object
         * Error: returns string
         *
         * $log.error receives full $http response during error.
         */
        return function (config) {
            debug(config, 'Creating EndpointCall with config:', config);
            var settings = EndpointOptions.new(config);
            if (_.isString(settings.url)) {
                debug(settings, 'Making EndpointCall with EndpointOptions:', settings);

                // If enabled, start the browser loading indicator
                if (settings.noisy) {
                    debug(settings, 'Trigger browser loading state.');
                    var iframe = startBrowserLoading();
                }

                // Make the call
                return $http({
                    method: settings.method,
                    headers: settings.headers,
                    url: settings.url,
                    cache: settings.cache,
                    data: settings.data,
                    params: settings.params,
                    transformResponse: settings.transformResponse
                }).then(function (response) {
                    debug(settings, '$http returned with response:', response);
                    if (angular.isFunction(settings.checkResponse)) {
                        debug(settings, 'Running custom check response on data:', response.data);
                        response.data = settings.checkResponse(response.data, settings);
                        debug(settings, 'Data after check response:', response.data);
                    } else {
                        warn(settings, 'Check response callback is not a valid function:', settings);
                    }
                    if (response.data.error) {
                        error(settings, 'API error, full $http response: ', response);
                        // Error callback registered by the caller
                        errorCallback(response.data, settings);
                        // Rejects promise and returns error message to chained promise callbacks
                        return $q.reject(response.data.reason);
                    }
                    // If we have a response parser, use it to modify the promise
                    var returnData;
                    if (angular.isFunction(settings.parse)) {
                        debug(settings, 'Calling response parser on data:', response.data.data);
                        returnData = settings.parse(response.data.data);
                        debug(settings, 'After response parser:', returnData);
                    } else {
                        returnData = response.data.data;
                    }
                    successCallback(returnData, settings);
                    return returnData;
                }, function (response) {
                    error(settings, 'HTTP error, full $http response: ', response);
                    errorCallback(error.data, settings);
                    return $q.reject(_.get(error.data, 'reason'));
                }).finally(function () {
                    stopBrowserLoading(iframe);
                });
            } else {
                error(config, 'Invalid URL given to EndpointCall. EndpointOptions:', settings);
                var defer = $q.defer();
                defer.reject('There was an error.');
                return defer.promise;
            }
        };

    }
);

angular.module('enplug.utils').factory('EndpointOptions', ['$log', 'Environment', '$httpParamSerializerJQLike',
    function ($log, Environment, $httpParamSerializerJQLike) {
        'use strict';

        function debug(config, message, data) {
            if (config.verbose) {
                log(config, message, data);
            }
        }

        function log(config, message, data, level) {
            if (!level) level = 'debug';
            if (data) {
                // Clone data so properties can't be mutated later
                $log[level]('[#' + config.id + ' EndpointOptions] ' + message, _.cloneDeep(data));
            } else {
                $log[level]('[#' + config.id + ' EndpointOptions] ' + message);
            }
        }

        function warn(config, message, data) {
            log(config, message, data, 'warn');
        }

        function error(config, message, data) {
            log(config, message, data, 'error');
        }


        var persistentParams = {},
            endpoints = {};

        function Options(config) {

            /**
             * Parses JSON API responses.
             * @param data
             * @returns {{data: boolean, error: boolean, reason: string}}
             */
            function defaultTransformResponse(data) {
                var result = {
                    data: false,
                    error: false,
                    reason: null
                };
                try {
                    data = angular.isObject(data) ? data : JSON.parse(data);
                } catch (e) {
                    error(config, 'Exception thrown while parsing JSON resonse: ', e);
                    data = null;
                }
                // Check for missing data
                if (data === null) {
                    error(config, 'Null data returned from default transform response');
                    result.error = true;
                    result.reason = 'There was an error. Error code: 011.';
                    return result;
                } else {
                    result.data = data;
                    debug(config, 'Parsed data in default transform response:', result.data);
                }
                return result;
            }

            // These are the options available to all API requests.
            // Documentation available in the Endpoint class
            var availableOptions = {
                method: 'GET',
                url: null,
                host: null,
                path: null,
                endpoint: null,
                cache: false,
                data: null,
                headers: {},
                payload: null,
                prepare: null,
                params: {},
                formData: false,
                useToken: true, // deprecated
                // Callbacks, in order of when they're called
                transformResponse: defaultTransformResponse,
                checkResponse: defaultCheckResponse,
                parse: null,
                success: null,
                error: null,
                successMessage: null,
                errorMessage: null,
                usePersistentParams: true,
                persistentParams: persistentParams // for logging
            };

            var options = _.merge({}, availableOptions, config);

            debug(config, 'Options before processing:', options);

            // Add persistent params if we want them
            if (Object.keys(persistentParams).length) {
                debug(config, 'Persistent parameters available:', persistentParams);
                if (options.useToken && options.usePersistentParams) {
                    // params overwrite persistent params
                    options.params = _.merge({}, persistentParams, options.params);
                    debug(config, 'Persistent params applied. Parameters:', options.params);
                } else {
                    debug(config, 'Persistent params not applied.');
                }
            }

            // Check for empty param values
            checkForMissingParams(options.params, config);

            // Check make sure we have a transformResponse if we have a URL
            if (options.url && options.transformResponse !== defaultTransformResponse) {
                warn(config, 'Absolute URL given to Endpoint without custom transform response callback.');
            }

            // If we don't have an absolute URL, build it
            if (!options.url) {
                options.url = getUrl(options);
                debug(config, 'Built URL:', options.url);
            } else {
                debug(config, 'Not building URL, absolute given:', options.url);
            }

            // Prepare data with user-provided prepare function if available
            if (angular.isFunction(options.prepare)) {
                debug(config, 'Calling prepare function on data:', options.data);
                // One of the advantages of a prepare function is we copy the data before manipulating
                var dataCopy = _.cloneDeep(options.data);
                options.data = options.prepare(dataCopy);
                debug(config, 'Data after prepare function:', options.data);
            }

            if (options.formData) {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded'; // change header
                options.data = $httpParamSerializerJQLike(options.data); // change data object into string compatible with form data
                debug(config, 'Added form data headers and serialized data. Options:', options);
            }

            return options;
        }

        /**
         * Checks key-value params object and warns about empty values before each API call.
         * @param params
         */
        function checkForMissingParams(params, config) {
            // Check for missing URL parameters.
            _.forIn(params, function (value, key) {
                if (_.isUndefined(value)) {
                    warn(config, 'API call parameter ' + key + ' is undefined. Params: ', params);
                }
                if (_.isNull(value)) {
                    warn(config, 'API call parameter ' + key + ' is null. Params: ', params);
                }
            });
        }

        /**
         * Retrieves URL from endpoints if using dot-notation paths. Will use monitoring host if using a
         * monitoring endpoint. Will use plain path if no dot notation is present.
         * @param options
         * @returns {*}
         */
        function getUrl(options) {
            var host = options.host || Environment.host(), // allow for custom host
                path = options.endpoint || options.path, //backwards compatibility with path
                endpoint;
            //Path using . notation to form a url
            if (_.isString(path)) {
                debug(options, 'Building URL with values:', {
                    host: host,
                    path: path
                });
                if (path.indexOf('.') > -1) {
                    endpoint = getEndpointFromPath(path, options);
                    if (!endpoint) {
                        error(options, 'Could not find endpoint for path: ', path);
                    }
                }
                return host + (endpoint || path);
            } else {
                warn(options, 'Path was not a string for options:', options);
            }
        }

        /**
         * Retrieves endpoint URL from a dot-notation path such as Venue.c
         * @param path
         * @returns {*}
         */
        function getEndpointFromPath(path, config) {
            debug(config, 'Returning endpoint from path');
            if (!Object.keys(endpoints).length) {
                warn(config, 'No endpoints have been registered yet');
            }
            var splitPath = path.split('.');
            return splitPath.reduce(function (map, key) {
                return map[key];
            }, endpoints);
        }

        /**
         * Knows how to parse data from our AdServer responses.
         *
         * Processes each result, pulling our data out from the Result: key or registering Success: false
         *
         * @param result {{data: object, error: boolean, reason: string}}
         * @returns result {{data: object, error: boolean, reason: string}}
         */
        function defaultCheckResponse(result, config) {
            debug(config, 'Running default check response on result:', result.data);
            var data = result.data;
            // AdServer API checking
            if (data.Success === false || angular.isUndefined(data.Result)) {
                debug(config, 'API failure. Success was false or Result was undefined.');
                result.error = true;
                result.reason = data.ErrorMessage;
            } else {
                debug(config, 'API success');
                if (_.isArray(data.Result)) {
                    data.Result.forEach(function (result) {
                        delete result.__type;
                    });
                } else if (_.isObject(data.Result)) {
                    delete data.Result.__type;
                }
                result.data = data.Result;
            }
            return result;
        }

        return {

            new: function (config) {
                return new Options(config);
            },

            setEndpoints: function (_endpoints) {
                _.merge(endpoints, _endpoints);
            },

            setPersistentParam: function (key, value) {
                persistentParams[key] = value;
            },

            unsetPersistentParam: function (key) {
                delete persistentParams[key];
            }
        };
    }]);

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
     * Returns a string name of the current environment from cookies, or inferred from host name
     * @returns {String}
     */
    this.get = function () {
        var env = getCookie(cookieName),
            hosts = {
                'dashboard.enplug.com': this.PRODUCTION,
                'staging.enplug.com': this.STAGING
            },
            host = window.location.hostname;

        // Make sure the cookie is a valid host
        if (this.hosts()[env]) {
            return env;
        }

        // Check to see if environment is stored as query parameter
        var param = getParameterByName(cookieName.toLowerCase());

        // Make sure the param is a valid setting
        if (this.hosts()[param]) {
            env = param;
        } else {

            // Default environment settings by host, or staging default
            env =  hosts[host] || this.STAGING;
        }

        // Persist whatever we found as a cookie
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

/**
 * Created by aleross on 7/23/15. Copyright (c) Enplug, Inc.
 */

angular.module('enplug.utils.libraries.lodash', []).factory('_', function() {
    return window._; // Lodash must already be loaded on the page
});

/**
 * Created by aleross on 7/23/15. Copyright (c) Enplug, Inc.
 */

angular.module('enplug.utils.libraries.moment', []).factory('moment', function() {
    return window.moment; // MomentJS must already be loaded on the page
});
angular.module('enplug.utils').constant('ResourceTypes', {
    IMAGE: 'Image',
    VIDEO: 'Video'
});
angular.module('dashboard-utils-templates', ['Confirm/confirm-dialog.tpl']);

angular.module("Confirm/confirm-dialog.tpl", []).run(["$templateCache", function($templateCache) {
    "use strict";
    $templateCache.put("Confirm/confirm-dialog.tpl",
        "<header><h2 ng-bind=title></h2></header><section><p ng-bind-html=text></p></section><footer><button class=\"btn btn-default\" ng-bind=cancelText ng-click=closeThisDialog()></button> <button class=btn ng-class=confirmClass ng-bind=confirmText ng-click=confirm()></button></footer>");
}]);
