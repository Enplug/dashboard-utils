angular.module('enplug.utils').constant('Endpoints', {
    Account: {
        rA: '/accounts',
        r: '/account',
        c: '/account',
        u: '/account',
        setupState: '/account/setupstate',
        convertToDeveloper: '/autobilling/account/upgradetodeveloper',
        FeatureFlags: {
            loadFlags: '/autobilling/featureflags',
            updateFlag:'/autobilling/featureflag',
            deleteFlags: '/autobilling/featureflags'
        }
    },
    Advertisement: {
        r: '/advertisement',
        u: '/advertisement',
        d: '/advertisement',
        rA: '/advertisements',
        saveSocialAd: '/socialadvertisement',
        markInappropriate: '/scheduling/banadvertisement'
    },
    // Todo separate AppInstances, AppThemes, and AppAssets endpoints
    Apps: {
        rA: '/appframework/apps',
        r: '/appframework/app',
        c: '/appframework/app/create',
        d: '/appframework/app',
        byVenue: '/appframework/apps/byvenue',
        start: '/appframework/appinstance/start',
        stop: '/appframework/appinstance/stop',
        activate: '/appframework/app/activate',
        getInstances: '/appframework/appinstances/byapp',
        getInstanceByVenue: '/appframework/appinstances/byvenue',
        createInstance: '/appframework/appinstance/create',
        stopInstance: '/appframework/appinstance/stop',
        deleteInstance: '/appframework/appinstance',
        deployInstance: '/appframework/appinstance/deploy',
        upload: '/appframework/app/package',
        update: '/appframework/app/update',
        updateFrequencies: '/appframework/appinstances/frequencies',
        getAsset: '/appframework/appinstance/asset',
        deleteInstanceAsset: '/appframework/appinstance/asset',
        defaultAssets: '/appframework/defaultassets/byapp',
        loadAppAssets: '/appframework/assets',
        createAsset: '/appframework/asset/create',
        createAssetFromDefault: '/appframework/asset/create/fromdefault',
        deleteAsset: '/appframework/asset',
        updateAsset: '/appframework/asset/update',
        bulkUpdateAsset: '/appframework/assets/save',
        deleteResource: '/resource',
        weatherCities: '/appframework/cities',
        venuesWithTheme: '/appframework/venueswiththeme',
        updateResources: '/appframework/app/packages'
    },
    AppInstances: {
        getInstance: '/appframework/appinstance' // ?appinstanceid={id}
    },
    AppMarket: {
        Review: {
            c: '/appframework/store/appreview',
            u: '/appframework/store/appreview',
            d: '/appframework/store/appreview'
        },
        userReviews: '/appframework/store/appreviews/byuser',
        loadAppReviews: '/appframework/store/appreviews',
        loadAppInfos: '/appframework/store/appinfos',
        loadAppInfo: '/appframework/store/appinfo',
        saveAppInfo: '/appframework/store/appinfo'
    },
    Auth: {
        r: '', // login
        u: '/authentication/runas',
        loginAs: '/authentication/runas',
        changePassword: '/authentication/changepassword',
        forgotPassword: '/authentication/forgotpassword', //email
        resetPassword: '/authentication/resetpassword' //resetcode
    },
    Billing: {
        info: '/billing/info/venue',
        upgradeSubscription: '/enplugnplay/subscription/activate',
        upgradeAccount: '/enplugnplay/account/activate',
        newCard: '/billing/venue/newcard',
        updateCard: '/billing/changecard',
        enableAutoBilling: '/billing/info/venue/automatic/on',
        disableAutoBilling: '/billing/info/venue/automatic/off',
        PromoCode: {
            r: '/billing/promocode/list',
            c: '/billing/promocode/create',
            u: '/billing/promocode/update',
            d: '/billing/promocode/delete'
        },
        history: '/billing/venue/history',
        customBillingNote: '/billing/venue/history/new',
        markAsViewed: '/billing/venue/history/update', // historyid={historyId}
        subscriptionPlans: '/billing/subscription/plans',
        emailNotifications: '/billing/emailnotifications', //enabled={boolean}
        currentSubscriptionPlans: '/billing/subscription/plans',
        currentPlanInfos: '/billing/subscription/planinfos',
        createSubscriptionPlan: '/billing/subscription/plans/new',
        updateSubscriptionPlan: '/billing/subscription/plans/update',
        deleteSubscriptionPlan: '/billing/subscription/plans/delete',
        addBillingContact: '/billing/contact'
    },
    BucketBilling: {
        loadPlan: '/autobilling/plan',
        availablePlans: '/autobilling/plans',
        createPlan: '/autobilling/plan/create',
        updatePlan: '/autobilling/plan/update',
        deletePlan: '/autobilling/plan',
        upgradeBucketPlan: '/autobilling/upgrade',
        upgradeAutoBillingPlan: '/autobilling/upgrade/auto', // used to upgrade auto billing accounts to bucket billing
        upgradeManualBillingPlan: '/autobilling/upgrade/manual', // used to upgrade manual billing accounts to bucket billing
        reactivateAccount: '/autobilling/reactivate',
        cancelAccount: '/autobilling/cancel', // for accounts with auto billing = true
        uncancelAccount: '/autobilling/undocancel', // for accounts that have been cancelled but have not entered the suspended period yet
        updateCreditCard: '/autobilling/creditcard/update',
        applyPromoCode: '/autobilling/promocode/apply',
        addDevice: '/autobilling/device/add',
        deleteDevice: '/autobilling/device',
        suspendManualAccount: '/billing/suspend'
    },
    Campaign: {
        c: '/campaign',
        rA: '/campaigns'
    },
    Categories: {
        venue: '/venue/categories',
        ad: '/ad/categories'
    },
    CommandReceiver: {
        u: '/edu/command'
    },
    Directory: {
        createBackup: '/appframework/assets/backup',
        retrieveBackup: '/appframework/assets/backups'
    },
    Edu: {
        apps: {
            r: '/edu/app/deployments',
            deployBuild: '/edu/app/deploy/frombuild',
            deployResource: '/edu/app/deploy/fromresource',
            getHistory: '/edu/app/deployments/history',
            deployHistory: '/edu/app/deploy/fromhistory'
        },
        r: '/venue/edu',
        tags: '/edutags',
        getLibraries: '/edu/libraries',
        saveLibrary: '/edu/library'
    },
    EduMonitoring: {
        prod: {
            logs: '/edumonitoring/edustatuslogs',
            status: '/edumonitoring/edustatus',
            statuses: '/edumonitoring/edustatuses',
            history: '/edumonitoring/edustatus/history',
            events: '/edumonitoring/edustatus/events',
            versions: '/edumonitoring/edustatuses/packages',
            tv: '/edumonitoring/edustatuses/tv',
            errors: '/edumonitoring/eduerrors'
        },
        staging: {
            logs: '/edumonitoring/edumonitoring/edustatuslogs',
            status: '/edumonitoring/edumonitoring/edustatus',
            statuses: '/edumonitoring/edumonitoring/edustatuses',
            history: '/edumonitoring/edumonitoring/edustatus/history',
            events: '/edumonitoring/edumonitoring/edustatus/events',
            versions: '/edumonitoring/edumonitoring/edustatuses/packages',
            tv: '/edumonitoring/edumonitoring/edustatuses/tv',
            errors: '/edumonitoring/edumonitoring/eduerrors'
        },
        dev: {
            logs: '/edumonitoring/edumonitoring/edustatuslogs',
            status: '/edumonitoring/edumonitoring/edustatus',
            statuses: '/edumonitoring/edumonitoring/edustatuses',
            history: '/edumonitoring/edumonitoring/edustatus/history',
            events: '/edumonitoring/edumonitoring/edustatus/events',
            versions: '/edumonitoring/edumonitoring/edustatuses/packages',
            tv: '/edumonitoring/edumonitoring/edustatuses/tv',
            errors: '/edumonitoring/edumonitoring/eduerrors'
        }
    },
    EduSetup: {
        u: '/edusetup/assign',
        rA: '/edusetup/infos',
        tvs: '/edusetup/tvs',
        link: '/edusetup/link',
        resellerSale: '/edusetup/reseller',
        createSetupCode: '/edusetup/info'
    },
    EduSettings: {
        r: '/edusettings',
        u: '/edusetting',
        d: '/edusetting'
    },
    Inventory: {
        c: '/scheduling/getinventory'
    },
    Languages: {
        rA: '/languages'
    },
    Logs: {
        rA: '/playercommand/playerlogs',
        uploadLog: '/playercommand/downloadplayerlog',
        downloadLog: '/playercommand/downloadplayerlog',
        downloadScreenshot: '/playercommand/downloadscreenshot'
    },
    Login: {
        r: '/authentication/login'
    },
    Metrics: {
        r: '/monitoring/metrics'
    },
    Networks: {
        all: '/networks',
        r: '/network/info'
    },
    PlugNPlay: {
        cancelAccount: '/enplugnplay/cancel',
        restoreAccount: '/enplugnplay/undocancel',
        createUser: '/enplugnplay/user/create',
        activateDevice: '/enplugnplay/edu/activate',
        reactivateDevice: '/enplugnplay/edu/reactivate', //eduid={string}
        validateEmail: '/enplugnplay/user/validate',
        validateSetupCode: '/enplugnplay/edu/validate/setupphrase',
        deactivateDevice: '/enplugnplay/edu/delete',
        createReseller: '/enplugnplay/reseller/create',
        resellerInfo: '/enplugnplay/reseller',
        updateReseller: '/enplugnplay/reseller/update',
        convertToDeveloper: '/autobilling/account/upgradetodeveloper'
    },
    Profanity: {
        r: '/mildprofanity',
        c: '/mildprofanity/add',
        d: '/mildprofanity/remove',
        allowedItems: '/alloweditems',
        deletedItems: '/deleteditems',
        removeAllowedItem: '/alloweditems/remove',
        removeDeletedItem: '/deleteditems/remove',
        allowItem: '/allowitem'
    },
    Promo: {
        apply: '/autobilling/promocode/apply',
        validate: '/autobilling/promocode/validate',
        subscriptionPlans: '/billing/subscription/planinfos',
        getActiveCodes: '/autobilling/promocodes',
        getSingleCode: '/autobilling/promocode',
        retrieveCodeByName: '/autobilling/promocode/byname',
        createCode: '/autobilling/promocode/create',
        updateCode: '/autobilling/promocode/update',
        delete: '/autobilling/promocode/delete'
    },
    Resource: {
        c: '/resource',
        r: '/resource',
        delete: '/resource',
        getVenueResource: '/venue/resource',
        byUser: '/resources/byuser'
    },
    ServerMonitoring: {
        serverStatus: '/monitoring/server/status'
    },
    Weather: {
        citiesByPrefix: '/appframework/cities',
        createAsset: '/appframework/asset/create',
        citySearch: '/weather/city/bygeo',
        selectLocation: '/weather/city/venue'
    },
    Rtb: {
        c: '/scheduling/submitorder',
        r: '/scheduling/order',
        d: '/scheduling/stoporder',
        startOrder: '/scheduling/startorder',
        updateOrderBudget: '/scheduling/updateorderbudget',
        updateOrderRestrictions: '/scheduling/updateorderrestrictions',
        updateVenues: '/scheduling/updateordervenues',
        updateEndDate: '/scheduling/updateorderenddate'
    },
    Run: {
        rA: '/runs',
        d: '/scheduling/cancelrun',
        deleteAll: '/scheduling/cancelruns',
        getRtbRuns: '/rtbruns'
    },
    Schedule: {
        c: '/scheduling/schedule',
        r: '/scheduling/schedule',
        u: '/scheduling/commit',
        d: '/scheduling/cancel'
    },
    Services: {
        r: '/monitoring/servicemetrics',
        loadWebApiServices: '/monitoring/servicemetricsbymethod'
    },
    SocialAuthentication: {
        Instagram: '/authenticate/instagram'
    },
    SocialFeed: {
        getVenueSocialFeeds: '/venue/socialfeeds',
        bannedUsers: '/blacklist',
        bannedUsersNetwork: '/networkblacklist',
        unbanUser: '/unban',
        updateTwitterFeed: '/twitterfeed',
        updateFoursquareFeed: '/foursquarefeed',
        updateInstagramFeed: '/instagramfeed',
        updateYelpFeed: '/yelpfeed',
        updateFacebookFeed: '/facebookfeed',
        instagramClients: '/instagramclients',
        twitterClients: '/twitterclients',
        newInstagramClient: '/instagramclient',
        getLastWeeksInteractions: '/lastweeksinteractions',
        getLastWeeksGrowth: '/lastweeksgrowth',
        getMostActiveUsers: '/mostactiveusers',
        getTweets: '/tweets',
        getInstagrams: '/instagrams',
        authFacebookPage: '/facebook/page/auth',
        exportItems: '/export/csv',
        resetFeeds: '/feeds/reset',

        // Analytics
        interactions: '/interactions',
        mostActiveUsers: '/mostactiveusers',
        userInteractions: '/userinteractions'
    },
    SocialItem: {
        d: '/item',
        rA: '/items',
        adInfoDelete: '/aditem',
        loadFavorites: '/favoriteitems',
        favorite: '/favorite',
        unfavorite: '/unfavorite',
        // loadItemsToApprove: '/itemstoapprove',
        loadApprovalItems: '/approval/account',
        approve: '/approveitem',
        reject: '/rejectitem'
    },
    Storage: {
        r: '/monitoring/storagestats'
    },
    Themes: {
        c: '/appframework/theme/create',
        r: '/appframework/theme',
        d: '/appframework/theme',
        rA: '/appframework/themes/byapp',
        activate: '/appframework/appinstance/update'
    },
    TimeZones: {
        r: '/timezones'
    },
    TwitterAccount: {
        r: '/twitteridlookup'
    },
    User: {
        r: '/authentication/userinfo', //get the logged in user's info
        u: '/authentication/userinfo',
        d: '/authentication/user',
        rA: '/authentication/users',
        save: '/authentication/user',
        saveSetting: '/authentication/usersetting',
        deleteSetting: '/authentication/usersetting',
        getById: '/authentication/user',
        forgotPassword: '/authentication/forgotpassword', //email
        resetPassword: '/authentication/resetpassword' //resetcode
    },
    Venue: {
        c: '/venue',
        r: '/venueinfo',
        u: '/venueinfo',
        d: '/venue',
        rA: '/venueinfos',
        read: '/venue',
        saveAll: '/venue',
        updateOpeningHours: '/venue/openinghours',
        updateHolidayHours: '/venue/holidayhours',
        networkVenueList: '/venues',
        adInfos: '/venue/adinfos',
        adRestrictions: '/venue',
        edus: '/venue/edus',
        edu: '/venue/edu',
        archive: '/venue/oldgraphics',
        tags: '/venuetags'
    }
});