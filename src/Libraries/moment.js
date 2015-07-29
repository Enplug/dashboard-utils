/**
 * Created by aleross on 7/23/15. Copyright (c) Enplug, Inc.
 */

angular.module('enplug.utils.libraries.moment', []).factory('moment', function() {
    return window.moment; // MomentJS must already be loaded on the page
});