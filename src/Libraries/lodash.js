/**
 * Created by aleross on 7/23/15. Copyright (c) Enplug, Inc.
 */

angular.module('enplug.utils.libraries.lodash', []).factory('_', function() {
    return window._; // Lodash must already be loaded on the page
});
