angular.module('enplug.utils.apps', ['enplug.utils.endpoint']);

angular.module('enplug.utils.apps').run(function (EndpointOptions, AppEndpoints) {
    'use strict';

    // Add the app framework endpoints to the map of available endpoints
    EndpointOptions.setEndpoints(AppEndpoints);
});
