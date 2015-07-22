// Todo remove deps on User, jQuery ($.param), and Lodash?
angular.module('enplug.utils').factory('EndpointOptions', ['$log', 'Environment', 'Endpoints', 'User',
    function ($log, Environment, Endpoints, User) {
        'use strict';

        function Options(config) {

            // These are the options available to all API requests.
            // Documentation available in the Endpoint class
            var availableOptions = {
                method: 'GET',
                url: null,
                host: null,
                path: null,
                endpoint: null,
                data: null,
                headers: {},
                payload: null,
                prepare: null,
                params: {},
                formData: false,
                admin: false,
                useToken: true,
                // Callbacks, in order of when they're called
                transformResponse: defaultTransformResponse,
                checkResponse: defaultCheckResponse,
                parse: null,
                success: null,
                error: null,
                successMessage: null,
                errorMessage: null
            };

            var options = _.assign(availableOptions, config);
            // Add the token to our params if we want it
            if (options.useToken && User) {
                _.extend(options.params, getToken(options.admin));
            }
            // Check for empty param values
            checkForMissingParams(options.params);
            // Check make sure we have a transformResponse if we have a URL
            if (options.url && options.transformResponse !== defaultTransformResponse) {
                $log.warn('Absolute URL given to Endpoint without custom transform response callback.');
            }
            // If we don't have an absolute URL, build it.
            if (!options.url) {
                options.url = getUrl(options);
            }
            // Prepare data with user-provided prepare function if available
            if (angular.isFunction(options.prepare)) {
                // One of the advantages of a prepare function is we copy the data before manipulating
                var dataCopy = _.cloneDeep(options.data);
                options.data = options.prepare(dataCopy);
            }
            if (options.formData) {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded'; // change header
                options.data = $.param(options.data); // change data object into string compatible with form data
            }
            return options;
        }

        /**
         * Checks key-value params object and warns about empty values before each API call.
         * @param params
         */
        function checkForMissingParams(params) {
            // Check for missing URL parameters.
            _.forIn(params, function (value, key) {
                if (_.isUndefined(value)) {
                    $log.warn('API call parameter ' + key + ' is undefined. Params: ', params);
                }
                if (_.isNull(value)) {
                    $log.warn('API call parameter ' + key + ' is null. Params: ', params);
                }
            });
        }

        /**
         * Retrieves URL from Endpoints.js if using dot-notation paths. Will use monitoring host if using a
         * monitoring endpoint. Will use plain path if no dot notation is present.
         * @param options
         * @returns {*}
         */
        function getUrl(options) {
            var host = options.host || Environment.host(), // allow for custom host
                path = options.endpoint || options.path, //backwards compatibility with path
                endpoint;
            //Path using . notation to form a url
            if (path.indexOf('.') > -1) {
                endpoint = getEndpointFromPath(path);
                if (!endpoint) {
                    $log.error('Could not find endpoint for path: ', path);
                }
            }
            return host + (endpoint || path);
        }

        /**
         * Retrieves endpoint URL from a dot-notation path such as Venue.c
         * @param path
         * @returns {*}
         */
        function getEndpointFromPath(path) {
            // Todo just use _.get()
            var splitPath = path.split('.');
            return splitPath.reduce(function (map, key) {
                return map[key];
            }, Endpoints);
        }

        function getToken(useAdmin) {
            return { token: useAdmin ? User.root().Token : User.target().Token };
        }

        /**
         * Parses JSON API responses.
         * @param data
         * @returns {{data: boolean, error: boolean, reason: string}}
         */
        function defaultTransformResponse(data) {
            var result = {
                data: false,
                error: false,
                reason: null
            };
            try {
                data = angular.isObject(data) ? data : JSON.parse(data);
            } catch (e) {
                $log.error('Exception thrown while parsing JSON resonse: ', e);
                data = null;
            }
            // Check for missing data
            if (data === null) {
                result.error = true;
                result.reason = 'There was an error. Error code: 011.';
                return result;
            } else {
                result.data = data;
            }
            return result;
        }

        /**
         * Knows how to parse data from our AdServer responses.
         *
         * Processes each result, pulling our data out from the Result: key or registering Success: false
         *
         * @param result {{data: boolean, error: boolean, reason: string}}
         * @returns result {{data: boolean, error: boolean, reason: string}}
         */
        function defaultCheckResponse(result) {
            var data = result.data;
            // AdServer API checking
            if (data.Success === false || angular.isUndefined(data.Result)) {
                result.error = true;
                result.reason = data.ErrorMessage;
            } else {
                if (_.isArray(data.Result)) {
                    data.Result.forEach(function (result) {
                        delete result.__type;
                    });
                } else if (_.isObject(data.Result)) {
                    delete data.Result.__type;
                }
                result.data = data.Result;
            }
            return result;
        }

        return Options;

    }]);