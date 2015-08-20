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

    return {

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
         * @param payload [{ AppInstanceId: <id>, Value: <id> }]
         * @returns {*|HttpPromise}
         */
        bulkCreateAssets: function (payload) {
            return Endpoint.post({
                path: 'AppAssets.bulk.create',
                data: payload,
                prepare: removeEmptyProperties,
                parse: function (asset) {
                    asset.Assets.forEach(function (indvidualAsset){
                        parseAsset(indvidualAsset, payload.Assets[0].AppInstanceId);
                    });
                    return asset;
                }
            });
        },

        /**
         * Updates multiple assets at once.
         *
         * @param payload [{ AppInstanceId: <id>, AssetId: <id>, Value: <value> }]
         * @returns {*|HttpPromise}
         */
        bulkUpdateAsset: function (payload) {
            return Endpoint.post({
                path: 'AppAssets.bulk.update',
                data: payload,
                prepare: removeEmptyProperties
            });
        },

        /**
         * Removes multiple assets at once.
         *
         * @param payload [{ AppInstanceId: <id>, AssetId: <id> }]
         * @returns {*|HttpPromise}
         */
        bulkRemoveAssets: function (payload) {
            return Endpoint.post({
                path: 'AppAssets.bulk.remove',
                data: payload,
                prepare: removeEmptyProperties
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
