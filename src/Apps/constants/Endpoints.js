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