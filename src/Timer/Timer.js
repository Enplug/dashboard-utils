/**
 * This service is meant to handle data that needs to be
 * reloaded at an interval and cancelled on app event types.
 */
angular.module('enplug.utils').factory('Timer', [
    '$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        "use strict";

        var timers = {},
            paused = false,
            i = 0;

        function cancelTimer(index) {
            var exists = angular.isObject(timers[index]);
            if (exists) {
                if (timers[index] !== null)
                    $timeout.cancel(timers[index].cancel);
                delete timers[index];
            }

            return exists;
        };

        function cancelTimers(event) {
            for (var timer in timers) {
                if (timers.hasOwnProperty(timer) && timers[timer].event === event) {
                    cancelTimer(timer);
                }
            }
        }

        function pauseTimers() {
            paused = true;
        }

        function restartTimers() {
            paused = false;
        }

        /**
         * Cancel any timers for the pageChange event
         */
        $rootScope.$on('$locationChangeStart', function () {
            cancelTimers('pageChange');
            cancelTimers('resolve');
        });

        $rootScope.$on('userUpdated', function () {
            cancelTimers('pageChange');
        });

        $rootScope.$on('pageHidden', pauseTimers);
        $rootScope.$on('pageVisible', restartTimers);

        var service = {
            /**
             * @param {[type]} func        [description]
             * @param {[type]} interval    [description]
             * @param {[type]} cancelEvent [description]
             */
            add: function (func, interval, immediateStart, cancelEvent) {
                var method = function () {
                    var removeTimer = false;
                    if (!paused) {
                        removeTimer = func();
                    }
                    delete timers[i];

                    if (cancelEvent !== 'resolve') {
                        service.add(func, interval, false, cancelEvent);
                    } else {
                        //for the management of timers that should be cancelled once their callback resolves correctly
                        //image uploading
                        removeTimer.then(function () {
                            //timer completed successfully delete the timer
                        }, function () {
                            service.add(func, interval, false, cancelEvent);
                        });
                    }
                };

                if (immediateStart === true) {
                    func();
                }

                timers[i] = {
                    cancel: $timeout(method, interval),
                    event: cancelEvent,
                    method: method,
                    interval: interval,
                    immediateStart: immediateStart
                };

                i += 1;

                return i - 1;
            },

            cancel: function (index) {
                return cancelTimer(index);
            },

            cancelAll: function () {
                pauseTimers();
                for (var timer in timers) {
                    cancelTimer(timer);
                }
                restartTimers();
            }
        };

        return service;
    }
]);