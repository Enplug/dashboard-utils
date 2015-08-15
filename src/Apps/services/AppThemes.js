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
