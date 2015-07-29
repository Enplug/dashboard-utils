angular.module('enplug.utils').directive('progressBar', [
    '$log', '$timeout',
    function ($log, $timeout) {
        return {
            templateUrl: '/js/modules/App/partials/progress-bar.html',
            link: function ($scope, $element, $attrs) {
                console.log('Loaded progress bar.');
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

            }
        };
    }
]);