/**
 * @ngdoc service
 * @name Endpoint
 * @module enplug.utils
 * @function
 * @description
 * Core service used to interact with any API over HTTP. Uses helper files EndpointCall and EndpointOptions.
 *
 * #General usage
 *
 * Endpoint calls should generally be made from services within the WebApp. They shouldn't be made from controllers,
 * because you want your API calls to be reusable by multiple controllers (DRY).
 *
 * Endpoint exposes 3 public methods - `.get()`, `.post()`, and `.delete()` for you to make calls with. Each call
 * accepts the same configuration object described below.
 *
 *
 * #Creating and Configuring an API call
 *
 * The following options are available for all API calls:
 *
 *    - **method** – `{string}` – HTTP method (e.g. 'GET', 'POST', etc)
 *
 *    - **endpoint** - `{string}` - Named endpoint from Endpoints.js for our AdServer. Example: Venue.create
 *
 *    - **url** – `{string}` – Absolute URL with hostname used for making 3rd party API calls. Overrides path/endpoint.
 *    If setting this, you usually will want to set a custom transformResponse callback as well so that Endpoint knows
 *    how to parse the data returned from the 3rd party API. If no transformResponse function is set, Endpoint will log
 *    a warning. Example URL: https://google.com/api/endpoint.js
 *
 *    - **host** - `{string}` - Host to use for this API call, if different from default AdServer host. The host
 *    will be combined with the endpoint given, which can either be a dot-notation path from Endpoints.js, or the end of
 *    an API url. E.g. `host = 'https://mydomain.com'`, `endpoint = '/v1/my-endpoint';` will result in
 *    `https://mydomain.com/v1/my-endpoint/';` You can achieve the same using the `url` config.
 *
 *    - **data** - `{Object}` - Javascript object to send along as POST data.
 *
 *    - **prepare** - `{function(payload)}` - Function called before sending data in POST request. Use to transform
 *    data into a format expected by server. Note: data is deep copied before being processed by this function.
 *
 *    - **params** – `{Object}` – Javascript object of key-value pairs to send as URL parameters. Note: the token is
 *    automatically appended as the first URL parameter for all API calls if useToken is true.
 *
 *    - **admin** - `{boolean}` - Flag indicating whether Endpoint should use the admin token or RunningAs token for
 *    admins. If true, Endpoint will use the token of the network user (e.g. alex@enplug.com) even if the user is
 *    running as a venue.
 *
 *    - **transformResponse** - `{callback(response)}` - Override this function when making non-JSON API calls.
 *    This function must return a payload in the following format: `{ data: Object, error: boolean, reason: string }`.
 *    Set error to true and provide a reason when an API response failed, and the Endpoint class will know how to handle
 *    the failure. Otherwise set error to false and provide a successful result to the data key to create a successful
 *    Endpoint response.
 *
 *    - **checkResponse** - `{callback({data: {}, error: bool, reason: string)}` - Override this function to handle API responses in a custom way.
 *    This function must return a payload in the following format: `{ data: Object, error: boolean, reason: string }`.
 *    Set error to true and provide a reason when an API response failed, and the Endpoint class will know how to handle
 *    the failure. Otherwise set error to false and provide a successful result to the data key to create a successful
 *    Endpoint response.
 *
 *    - **parse** - `{callback(data)}` - Use this function to alter the data returned in an API call and pass the result
 *    down the promise chain. Second function called in Endpoint callback stack.
 *
 *    - **success** - `{callback(data)}` - Success function callback that will be called upon a successful
 *    HTTP response.  Third function called in Endpoint callback stack. Important note: the return value is ignored.
 *
 *    - **error** - `{callback(reason)}` - Error callback. Like success callback, the return value is ignored.
 *
 *    - **successMessage** - `{string}` - Message to show in an Alert on successful Endpoint response.
 *    Default: no Alert is shown.
 *
 *    - **errorMessage** - `{string}` - Message to show in an Alert when an Endpoint request fails.
 *    Default: ErrorMessage string returned by API call/AdServer. Set to false to not show an Alert when an
 *    Endpoint request fails.
 *
 *    - **useToken** - `{boolean}` - Toggle using the User's token on/off. User tokens are auto-appended to URLs unless
 *    this value is set to false.
 *
 * ##Examples
 *
 *  ```js
 *   // Simple GET request example :
 *   Endpoint.get({
 *      path: 'Venue.r',
 *      params: {
 *          venueid: '1234'
 *      },
 *      success: function (data) {
 *          $log.debug('Received venue', data);
 *      }
 *   });```
 *
 *  ```js
 *   // POST request example :
 *   Endpoint.post({
 *      path: 'Venue.c',
 *      data: {
 *          Name: 'My Venue',
 *          Address: '123 Happy Street'
*       },
*       admin: true, // turns on Admin tokens
*       prepare: function (data) {
*           // This will modify the data sent to the server.
*           // data has already been copied by this point, and
*           // is safe to manipulate without affecting
*           // the object passed in by the caller.
*           return data.Name += ' with extra data';
*       },
*       parse: function (result) {
*           // Modify the data returned from the server before passing it
*           // down the promise chain.
*           return data.Name = 'A fake name';
*       }
 *      success: function (result) {
 *          // Perform callback functionality without affecting the promise chain
 *          $log.debug('Received venue', result);
 *      }
 *   });```
 *
 * #Return Value
 *
 * Endpoint calls return a chainable HTTP promise derived from the AngularJS $q framework. This return value can be
 * chained using `.then()` method calls upon it. The (success) data or (error) reason passed into the promise chain
 * is determined using the callbacks described below.
 *
 *
 * #Callback Stack
 *
 * A successful API response goes through three levels of callbacks:
 *
 * 1. **transformResponse**: used by AngularJS to parse the response directly from the API. Override this
 * if you need to parse XML or other data formats. Default successfully handles JSON.
 *
 * 2. **checkResponse**: used to parse the response directly from the API. The default setting for
 * this callback knows how to interpret our AdServer's API responses. When interacting with any other 3rd party API
 * you'll need to provide your own transform response function and return the expected result structure described above.
 *
 * 3. **parse**: this function is passed the result of `transformResponse` and is the end-user's opportunity to alter
 * the data that will be sent down the promise chain. This function must return a value in order for that value to be
 * passed down the promise chain.
 *
 * 4. **success**: this function receives the result of `transformResponse` and `parse` (if used). It is an opportunity
 * to respond to the API call. However, the return value is ignored and not passed down the promise chain.
 * This means you should use this method when you want to respond to an Endpoint call without altering the data that
 * will be passed to other potential users of the promise.
 *
 * 4. **error**: separate from the 3 callbacks above, the `error` callback function is called upon a failed API response
 * and will be passed the reason for the failure.
 *
 *
 * #Success Response
 *
 * Success responses will be automatically shown to the user in an Alert dialog *only* if you provide a
 * `successMessage`. They are *not* automatically logged to console.
 *
 * #Error Response
 *
 * Error responses *will* be automatically shown to the user *unless* you set the `errorMessage` config option
 * to `false`. Errors *are* automatically logged to console.
 */
angular.module('enplug.utils.endpoint', []).service('Endpoint', ['EndpointCall', '$log', function (EndpointCall, $log) {
    'use strict';

    var verboseMode = false,
        counter = 0,
        history = [];

    function execute(config) {
        counter += 1;
        history[counter] = _.cloneDeep(config);
        if (_.isObject(config)) {
            config.verbose = config.verbose || verboseMode; // enables verbose logging for development
            config.id = counter; // ID to help track API calls in verbose mode
            if (verboseMode) {
                $log.debug('[#' + counter + ' Endpoint] Executing ' + config.method + ' call');
            }
            return new EndpointCall(config);
        }
        $log.error('[#' + counter + ' Endpoint] Invalid config given:', config);
    }

    // Public API
    return {

        /**
         * @ngdoc method
         * @name Endpoint#get
         * @methodOf Endpoint
         * @param {object} params Endpoint options given
         * @returns {HttpPromise} HttpPromise with data from Endpoint call.
         */
        get: function (config) {
            if (_.isObject(config)) config.method = 'GET';
            return execute(config);
        },

        /**
         * @ngdoc method
         * @name Endpoint#post
         * @methodOf Endpoint
         * @param {object} config Endpoint options given
         * @returns {HttpPromise} HttpPromise with data from Endpoint call.
         * @description
         * POST HTTP request
         */
        post: function (config) {
            if (_.isObject(config)) config.method = 'POST';
            return execute(config);
        },

        /**
         * @ngdoc method
         * @name Endpoint#delete
         * @methodOf Endpoint
         * @param {object} config Endpoint options given
         * @returns {HttpPromise} HttpPromise with data from Endpoint call.
         */
        delete: function (config) {
            if (_.isObject(config)) config.method = 'DELETE';
            return execute(config);
        },

        verbose: function (bool) {
            $log.debug('[enplug.utils - Endpoint] Setting verbose mode:', bool);
            verboseMode = bool;
        },

        getHistory: function () {
            return history;
        }
    };
}
]);
