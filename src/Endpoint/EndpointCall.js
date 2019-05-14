angular.module('enplug.utils').factory('EndpointCall', ['$http', '$q', '$log', '$rootScope', 'EndpointOptions',
    function($http, $q, $log, $rootScope, EndpointOptions) {
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
         * Handle error code
         * @param errorCode String
         */
        function handleError(errorCode) {
            if (errorCode === 'NoAccessToken' || errorCode === 'InvalidAccessToken') {
                $rootScope.$broadcast('EndpointCall:tokenError');
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

                // Make the call
                return $http({
                    method: settings.method,
                    headers: settings.headers,
                    url: settings.url,
                    cache: settings.cache,
                    data: settings.data,
                    params: settings.params,
                    transformResponse: settings.transformResponse,
                    withCredentials: settings.withCredentials
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
                        handleError(response.data.errorCode);

                        // TODO: remove these two console.logs after random logout fix (10/26/2018)
                        console.log('API error, request data: ' + JSON.stringify({
                            method: settings.method,
                            headers: settings.headers,
                            url: settings.url,
                            cache: settings.cache,
                            data: settings.data,
                            params: settings.params,
                            withCredentials: settings.withCredentials
                        }));
                        console.log('API error, response: ' + JSON.stringify(response));

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
                });
            } else {
                error(config, 'Invalid URL given to EndpointCall. EndpointOptions:', settings);
                var defer = $q.defer();
                defer.reject('There was an error.');
                return defer.promise;
            }
        };

    }
]);
