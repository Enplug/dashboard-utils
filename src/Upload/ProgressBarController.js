/**
 * Created by aleross on 7/22/15. Copyright (c) Enplug, Inc.
 */

angular.module('enplug.utils').controller('ProgressBarController', ['$scope', '$log', '$timeout', function ($scope, $log, $timeout) {
    $scope.progress = 0;
    $scope.showing = false;

    $scope.$on('startProgress', function () {
        $log.debug('Starting upload progress.');
        $scope.showing = true;
        $scope.progress = 0;
    });

    $scope.$on('updateProgress', function (event, percent) {
        $scope.progress = percent;
    });

    $scope.$on('completeProgress', function () {
        $scope.progress = 100;
        $timeout(function () {
            $log.debug('Complete upload progress.');
            $scope.showing = false;
            $scope.progress = 0;
        }, 1000);
    });
}]);