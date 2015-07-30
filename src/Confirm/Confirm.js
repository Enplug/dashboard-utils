angular.module('enplug.utils.confirm', ['Confirm/confirm-dialog.tpl']).service('Confirm', ['ngDialog', '$sce', function (ngDialog, $sce) {
    'use strict';

    // Todo have a field for More Info (bottom left?) links to help center
    // Todo tooltips in template? custom html?/body partials?
    // Todo take a value for confirm. Hook into pre-close callback, e.g. type name of venue before deleting.

    var defaults = {
            title: 'Default',
            text: 'Default',
            cancelText: 'Cancel',
            confirmText: 'Confirm',
            confirmClass: 'btn-primary'
        },
        unsavedChangesDefaults = {
            title: 'Please Confirm',
            text: 'There are unsaved changes. Are you sure you want to continue and discard your changes?',
            cancelText: 'Cancel',
            confirmText: 'Discard Changes',
            confirmClass: 'btn-primary'
        };

    return {
        open: function (opts) {

            opts = _.merge({}, defaults, opts);

            return ngDialog.openConfirm({
                template: 'Confirm/confirm-dialog.tpl',
                controller: ['$scope', function($scope) {
                    // controller logic
                    $scope.title = opts.title;
                    $scope.text = $sce.trustAsHtml(opts.text);
                    $scope.cancelText = opts.cancelText;
                    $scope.confirmText = opts.confirmText;
                    $scope.confirmClass = opts.confirmClass;
                }],
                className: 'confirm-dialog',
                showClose: false, // no X in the top right
                trapFocus: false // prevents cancel button from getting auto-focused
            });
        },

        unsavedChanges: function (opts) {
            opts = _.merge({}, unsavedChangesDefaults, opts);
            return this.open(opts);
        }
    };
}]);
