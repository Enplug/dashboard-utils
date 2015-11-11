angular.module('enplug.utils.resource', []).service('ResourceService', ['Endpoint', '$log', 'ResourceTypes', '$q', '$timeout',
    function (Endpoint, $log, ResourceTypes, $q, $timeout) {
        "use strict";

        var checkFrequencyMilliseconds = 2000,
            resourcePaths = {
                read: '/resource',
                byUser: '/resources/byuser',
                remove: '/resource'
            };

        /**
         * Filters resources by ResourceTypes constant values. Accepts either single string and array of types.
         * @param resources
         * @param resourceTypes
         * @returns {*}
         */
        function filterResources(resources, resourceTypes, filter) {
            var filteredResources = [];
            if (resourceTypes && !_.isArray(resourceTypes)) {
                resourceTypes = [resourceTypes];
            }
            $log.debug('Filtering resources by ', resourceTypes);
            _.each(resources, function (resource) {
                resource = setResourceState(resource);
                var add = true;
                // Filter by resource type
                if (resourceTypes) {
                    if (!_.contains(resourceTypes, resource.ResourceType)) {
                        add = false;
                    }
                }
                // Run custom filter function
                if (_.isFunction(filter)) {
                    if (!filter(resource)) {
                        add = false;
                    }
                }
                // If resource passed both filters or no filters were applied, add it.
                if (add) {
                    filteredResources.push(resource);
                }
            });
            return filteredResources;
        }

        function setResourceState(resource) {
            switch (resource.ResourceState) {
            case 'Ready':
                resource.isReady = true;
                break;
            case 'Uploaded':
                resource.isUploaded = true;
                break;
            case 'Encoded':
                resource.isEncoded = true;
                break;
            case 'Error':
                resource.isError = true;
                break;
            }
            return resource;
        }

        function checkResourceState(resourceId, defer) {
            $log.debug('Checking resource state.');
            $timeout(function () {
                Endpoint.get({
                    path: resourcePaths.read,
                    params: {
                        resourceid: resourceId
                    },
                    success: function (resource) {
                        $log.debug('Resource ready:', resource);
                        if (resource.ResourceState === 'Ready') {
                            defer.resolve(resource);
                        } else {
                            checkResourceState(resourceId, defer);
                        }
                    },
                    error: function () {
                        $log.debug('Error while checking resource.');
                        defer.reject();
                    }
                });
            }, checkFrequencyMilliseconds);
        }

        var service = {

            /**
             * Convenience method for loading images and videos.
             * @param [filter]
             * @returns {*}
             */
            loadGraphics: function (filter) {
                return service.loadResourcesByUser([ResourceTypes.IMAGE, ResourceTypes.VIDEO], filter);
            },

            loadResourcesByUser: function (resourceTypes, filter) {
                return Endpoint.get({
                    path: resourcePaths.byUser,
                    parse: function (resources) {
                        return filterResources(resources, resourceTypes, filter);
                    },
                    success: function (resources) {
                        $log.debug('Loaded resources:', resources);
                    }
                });
            },

            completeUpload: function (resourceId) {
                var defer = $q.defer();
                checkResourceState(resourceId, defer);
                return defer.promise;
            },

            setResourceState: setResourceState,

            removeResource: function (resourceId) {
                $log.debug('Deleting resource:', resourceId);
                return Endpoint.delete({
                    path: resourcePaths.remove,
                    params: {
                        resourceid: resourceId
                    },
                    success: function () {
                        $log.debug('Deleted resource: ', resourceId);
                    }
                });
            }
        };
        return service;
    }
]);