angular.module('enplug.utils').factory('EndpointOptions', ['$log', 'Environment', '$httpParamSerializerJQLike',
    function ($log, Environment, $httpParamSerializerJQLike) {
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
                $log[level]('[#' + config.id + ' EndpointOptions] ' + message, _.cloneDeep(data));
            } else {
                $log[level]('[#' + config.id + ' EndpointOptions] ' + message);
            }
        }

        function warn(config, message, data) {
            log(config, message, data, 'warn');
        }

        function error(config, message, data) {
            log(config, message, data, 'error');
        }


        var persistentParams = {},
            endpoints = {};

        function Options(config) {

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
                    error(config, 'Exception thrown while parsing JSON resonse: ', e);
                    data = null;
                }
                // Check for missing data
                if (data === null) {
                    error(config, 'Null data returned from default transform response');
                    result.error = true;
                    result.reason = 'There was an error. Error code: 011.';
                    return result;
                } else {
                    result.data = data;
                    debug(config, 'Parsed data in default transform response:', result.data);
                }
                return result;
            }

            // These are the options available to all API requests.
            // Documentation available in the Endpoint class
            var availableOptions = {
                method: 'GET',
                url: null,
                host: null,
                path: null,
                endpoint: null,
                cache: false,
                data: null,
                headers: {},
                payload: null,
                prepare: null,
                params: {},
                formData: false,
                useToken: true, // deprecated
                // Callbacks, in order of when they're called
                transformResponse: defaultTransformResponse,
                checkResponse: defaultCheckResponse,
                parse: null,
                success: null,
                error: null,
                successMessage: null,
                errorMessage: null,
                usePersistentParams: true,
                persistentParams: persistentParams, // for logging
                withCredentials: true // should send auth cookies
            };

            var options = _.merge({}, availableOptions, config);

            // Copy headers set to undefined as `_.merge` skips them.
            // Use case: `Content-Type` must be set to undefined for multipart uploads.
            if (config && config.headers)
            {
                Object.keys(config.headers)
                    .filter(function (key) {
                        return config.headers[key] === undefined;
                    })
                    .forEach(function (key) {
                        options.headers[key] = undefined;
                    });
            }

            debug(config, 'Options before processing:', options);

            // Add persistent params if we want them
            if (Object.keys(persistentParams).length) {
                debug(config, 'Persistent parameters available:', persistentParams);
                if (options.useToken && options.usePersistentParams) {
                    var appliedPersistentParams = Object.assign({}, persistentParams);

                    // Handle the token persistent param as the Authorization Bearer value
                    if (appliedPersistentParams['token']) {
                        options.headers['Authorization'] = 'Bearer ' + persistentParams['token'];
                        delete appliedPersistentParams['token'];
                    }

                    // params overwrite persistent params
                    options.params = _.merge({}, appliedPersistentParams, options.params);
                    debug(config, 'Persistent params applied. Parameters:', options.params);
                } else {
                    debug(config, 'Persistent params not applied.');
                }
            }

            // Check for empty param values
            checkForMissingParams(options.params, config);

            // Check make sure we have a transformResponse if we have a URL
            if (options.url && options.transformResponse !== defaultTransformResponse) {
                warn(config, 'Absolute URL given to Endpoint without custom transform response callback.');
            }

            // If we don't have an absolute URL, build it
            if (!options.url) {
                options.url = getUrl(options);
                debug(config, 'Built URL:', options.url);
            } else {
                debug(config, 'Not building URL, absolute given:', options.url);
            }

            // Prepare data with user-provided prepare function if available
            if (angular.isFunction(options.prepare)) {
                debug(config, 'Calling prepare function on data:', options.data);
                // One of the advantages of a prepare function is we copy the data before manipulating
                var dataCopy = _.cloneDeep(options.data);
                options.data = options.prepare(dataCopy);
                debug(config, 'Data after prepare function:', options.data);
            }

            if (options.formData) {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded'; // change header
                options.data = $httpParamSerializerJQLike(options.data); // change data object into string compatible with form data
                debug(config, 'Added form data headers and serialized data. Options:', options);
            }

            return options;
        }

        /**
         * Checks key-value params object and warns about empty values before each API call.
         * @param params
         */
        function checkForMissingParams(params, config) {
            // Check for missing URL parameters.
            _.forIn(params, function (value, key) {
                if (_.isUndefined(value)) {
                    warn(config, 'API call parameter ' + key + ' is undefined. Params: ', params);
                }
                if (_.isNull(value)) {
                    warn(config, 'API call parameter ' + key + ' is null. Params: ', params);
                }
            });
        }

        /**
         * Retrieves URL from endpoints if using dot-notation paths. Will use monitoring host if using a
         * monitoring endpoint. Will use plain path if no dot notation is present.
         * @param options
         * @returns {*}
         */
        function getUrl(options) {
            var host = options.host || Environment.host(), // allow for custom host
                path = options.endpoint || options.path, //backwards compatibility with path
                endpoint;
            //Path using . notation to form a url
            if (_.isString(path)) {
                debug(options, 'Building URL with values:', {
                    host: host,
                    path: path
                });
                if (path.indexOf('.') > -1) {
                    endpoint = getEndpointFromPath(path, options);
                    if (!endpoint) {
                        error(options, 'Could not find endpoint for path: ', path);
                    }
                }
                return host + (endpoint || path);
            } else {
                warn(options, 'Path was not a string for options:', options);
            }
        }

        /**
         * Retrieves endpoint URL from a dot-notation path such as Venue.c
         * @param path
         * @returns {*}
         */
        function getEndpointFromPath(path, config) {
            debug(config, 'Returning endpoint from path');
            if (!Object.keys(endpoints).length) {
                warn(config, 'No endpoints have been registered yet');
            }
            var splitPath = path.split('.');
            return splitPath.reduce(function (map, key) {
                return map[key];
            }, endpoints);
        }

        /**
         * Knows how to parse data from our AdServer responses.
         *
         * Processes each result, pulling our data out from the Result: key or registering Success: false
         *
         * @param result {{data: object, error: boolean, reason: string}}
         * @returns result {{data: object, error: boolean, errorCode: string, reason: string}}
         */
        function defaultCheckResponse(result, config) {
            debug(config, 'Running default check response on result:', result.data);
            var data = result.data;
            // AdServer API checking
            if (data.Success === false || angular.isUndefined(data.Result)) {
                debug(config, 'API failure. Success was false or Result was undefined.');
                result.error = true;
                result.errorCode = data.ErrorCode;
                result.reason = data.ErrorMessage;
            } else {
                debug(config, 'API success');
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

        return {

            new: function (config) {
                return new Options(config);
            },

            setEndpoints: function (_endpoints) {
                _.merge(endpoints, _endpoints);
            },

            setPersistentParam: function (key, value) {
                persistentParams[key] = value;
            },

            unsetPersistentParam: function (key) {
                delete persistentParams[key];
            }
        };
    }]);
