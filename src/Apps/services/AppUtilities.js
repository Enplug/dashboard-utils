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
