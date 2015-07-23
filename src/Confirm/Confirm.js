angular.module('enplug.utils').service('Confirm', ['ngDialog', '$sce', function (ngDialog, $sce) {
    'use strict';

    // Todo have a field for More Info (bottom left?) links to help center
    // Todo tooltips in template? custom html?/body partials?
    // Todo take a value for confirm. Hook into pre-close callback, e.g. type name of venue before deleting.

    var defaults = {
            title: 'Default',
            text: 'Default',
            cancelText: 'Cancel',
            confirmText: 'Confirm'
        },
        unsavedChangesDefaults = {
            title: 'Please Confirm',
            text: 'There are unsaved changes. Are you sure you want to continue and discard your changes?',
            cancelText: 'Cancel',
            confirmText: 'Discard Changes'
        };

    return {
        open: function (opts) {

            opts = _.assign(defaults, opts);

            return ngDialog.openConfirm({
                template: 'Confirm/confirm-dialog.tpl.html',
                controller: ['$scope', function($scope) {
                    // controller logic
                    $scope.title = opts.title;
                    $scope.text = $sce.trustAsHtml(opts.text);
                    $scope.cancelText = opts.cancelText;
                    $scope.confirmText = opts.confirmText;
                }],
                className: 'confirm-dialog',
                showClose: false, // no X in the top right
                trapFocus: false // prevents cancel button from getting auto-focused
            });
        },

        unsavedChanges: function (opts) {
            opts = _.assign(unsavedChangesDefaults, opts);
            return this.open(opts);
        }
    };
}]);