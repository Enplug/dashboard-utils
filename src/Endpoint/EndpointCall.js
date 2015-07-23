angular.module('enplug.utils').factory('EndpointCall', ['$http', '$q', '$log', 'EndpointOptions',
    function($http, $q, $log, EndpointOptions) {
        'use strict';

        /**
         * Success callback called after every successful API response.
         * @param data
         * @param settings
         */
        function successCallback(data, settings) {
            // Show the success message to the user
            if (angular.isFunction(settings.success)) {
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
            var settings = EndpointOptions.new(config);
            // Make the call
            return $http({
                method: settings.method,
                headers: settings.headers,
                url: settings.url,
                data: settings.data,
                params: settings.params,
                transformResponse: settings.transformResponse
            }).then(function (response) {
                if (angular.isFunction(settings.checkResponse)) {
                    response.data = settings.checkResponse(response.data);
                } else {
                    $log.warn('Check response callback is not a valid function:', settings);
                }
                if (response.data.error) {
                    $log.error('API error, full $http response: ', response);
                    // Error callback registered by the caller
                    errorCallback(response.data, settings);
                    // Rejects promise and returns error message to chained promise callbacks
                    return $q.reject(response.data.reason);
                }
                // If we have a response parser, use it to modify the promise
                var returnData;
                if (angular.isFunction(settings.parse)) {
                    returnData = settings.parse(response.data.data);
                } else {
                    returnData = response.data.data;
                }
                successCallback(returnData, settings);
                return returnData;
            }, function (error) {
                $log.error('HTTP error, full $http response: ', error);
                errorCallback(error.data, settings);
                return $q.reject(error.data.reason);
            });
        };

    }]);