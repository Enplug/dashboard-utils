angular.module('enplug.utils').factory('EndpointCall',
    function($http, $q, $log, $timeout, EndpointOptions) {
        'use strict';

        function debug(config, message, data) {
            if (config.verbose) {
                log(config, message, data);
            }
        }

        function log(config, message, data, level) {
            if (!level) level = 'debug';
            if (data) {
                // Clone data so properties can't be mutated later
                $log[level]('[#' + config.id + ' EndpointCall] ' + message, _.cloneDeep(data));
            } else {
                $log[level]('[#' + config.id + ' EndpointCall] ' + message);
            }
        }

        function warn(config, message, data) {
            log(config, message, data, 'warn');
        }

        function error(config, message, data) {
            log(config, message, data, 'error');
        }

        function startBrowserLoading() {
            if (!document.getElementById('noisey-endpoint')) {
                var iframe = document.createElement('iframe');
                iframe.src = '//loading.enplug.com';
                iframe.style.display = 'none';
                iframe.setAttribute('id', 'noisy-iframe');
                document.body.appendChild(iframe);
            }
            return iframe;
        }

        function stopBrowserLoading(iframe) {
            if (iframe) {
                $timeout(function () {
                    console.log( 'remove in iframe? ' + ('remove' in iframe) );
                    console.dir( iframe );
                    console.dir( iframe.remove );
                    console.log( iframe.remove.toString() );

                    angular.element( iframe ).remove();
                }, 200);
            }
        }

        /**
         * Success callback called after every successful API response.
         * @param data
         * @param settings
         */
        function successCallback(data, settings) {
            // Show the success message to the user
            if (angular.isFunction(settings.success)) {
                debug(settings, 'Calling success callback.');
                settings.success(data);
            }
        }

        /**
         * Error callback called after every failed API response.
         * @param data String
         * @param settings
         */
        function errorCallback(data, settings) {
            // Show the failure reason to the user
            if (angular.isFunction(settings.error)) {
                debug(settings, 'Calling error callback.');
                settings.error(data);
            }
        }

        /**
         * HTTP Request
         * Success: returns data object
         * Error: returns string
         *
         * $log.error receives full $http response during error.
         */
        return function (config) {
            debug(config, 'Creating EndpointCall with config:', config);
            var settings = EndpointOptions.new(config);
            if (_.isString(settings.url)) {
                debug(settings, 'Making EndpointCall with EndpointOptions:', settings);

                // If enabled, start the browser loading indicator
                if (settings.noisy) {
                    debug(settings, 'Trigger browser loading state.');
                    var iframe = startBrowserLoading();
                }

                // Make the call
                return $http({
                    method: settings.method,
                    headers: settings.headers,
                    url: settings.url,
                    cache: settings.cache,
                    data: settings.data,
                    params: settings.params,
                    transformResponse: settings.transformResponse
                }).then(function (response) {
                    debug(settings, '$http returned with response:', response);
                    if (angular.isFunction(settings.checkResponse)) {
                        debug(settings, 'Running custom check response on data:', response.data);
                        response.data = settings.checkResponse(response.data, settings);
                        debug(settings, 'Data after check response:', response.data);
                    } else {
                        warn(settings, 'Check response callback is not a valid function:', settings);
                    }
                    if (response.data.error) {
                        error(settings, 'API error, full $http response: ', response);
                        // Error callback registered by the caller
                        errorCallback(response.data, settings);
                        // Rejects promise and returns error message to chained promise callbacks
                        return $q.reject(response.data.reason);
                    }
                    // If we have a response parser, use it to modify the promise
                    var returnData;
                    if (angular.isFunction(settings.parse)) {
                        debug(settings, 'Calling response parser on data:', response.data.data);
                        returnData = settings.parse(response.data.data);
                        debug(settings, 'After response parser:', returnData);
                    } else {
                        returnData = response.data.data;
                    }
                    successCallback(returnData, settings);
                    return returnData;
                }, function (response) {
                    error(settings, 'HTTP error, full $http response: ', response);
                    errorCallback(error.data, settings);
                    return $q.reject(_.get(error.data, 'reason'));
                }).finally(function () {
                    stopBrowserLoading(iframe);
                });
            } else {
                error(config, 'Invalid URL given to EndpointCall. EndpointOptions:', settings);
                var defer = $q.defer();
                defer.reject('There was an error.');
                return defer.promise;
            }
        };

    }
);
