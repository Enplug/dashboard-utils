angular.module('enplug.utils.apps').factory('AppUtilities', function (_) {
    return {
        /**
         * Accepts either array of assets or individual asset
         * @param assets
         */
        parseJson: function (assets) {
            if (_.isArray(assets)) {
                _.each(assets, function (asset) {
                    if (_.isJSON(asset.Value)) {
                        asset.Value = JSON.parse(asset.Value);
                    }
                });
            } else {
                if (_.isJSON(assets.Value)) {
                    assets.Value = JSON.parse(assets.Value);
                }
            }
            return assets;
        }
    };
});
