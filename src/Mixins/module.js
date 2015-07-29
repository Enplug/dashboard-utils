/**
 * Created by aleross on 7/23/15. Copyright (c) Enplug, Inc.
 */

angular.module('enplug.utils.mixins', []);

angular.module('enplug.utils.mixins').config([function () {

    /*
     * This file contains methods added to Javascript prototypes, the Angular object, and as Lodash mixins to
     * make our coding lives easier. We shouldn't add to this any more.
     *
     */


    /**
     * Additions to angular object. This may or may not be the best place for these, but we'll keep them because they
     * aren't doing too much harm right now and refactoring them would be a pain.
     */


    /**
     * Checks for undefined or null strictly. Can also do if (foo == null), or if (foo.property) but can't check for undefined
     * without typeof unless its a property. if (foo) when undefined will cause an error.
     *
     * @param val
     * @returns {*|boolean}
     */
    angular.isUndefinedOrNull = function (val) {
        return angular.isUndefined(val) || val === null;
    };

    /**
     * Empties an object, clearing all data while retaining the original reference.
     * Could this be an Object.empty() prototype method? Perhaps, not sure about Object v.s. Function type though.
     * @param obj
     */
    angular.emptyObject = function (obj) {
        var prop;
        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                delete obj[prop];
            }
        }
    };

    /**
     * Mixin for Lodash that checks if a string is fully usable and longer than zero characters.
     * We don't put this on the string prototype because we need to be able to check if the string is null, and we
     * can't call methods on null
     *
     * @param string
     * @param [length]
     * @returns {boolean}
     */
    function validString(string, length) {
        if (_.isUndefined(string) || _.isNull(string) || !_.isString(string)) {
            return false;
        }
        // Check length of string
        return (length ? string.length >= length : string.length > 0);
    }
    _.mixin({ 'validString': validString });

    /**
     * Mixin for Lodash that moves the item in array at old index to the new index, shifting any items in between.
     * @param array
     * @param oldIdx
     * @param newIdx
     * @returns {Array|string|*|Blob} Items that have been removed
     */
    function moveArrayItem(array, oldIdx, newIdx) {
        if (newIdx >= array.length) {
            // Fill in array with empty items if our target index requires things in between
            var k = newIdx - array.length;
            while ((k--) + 1) {
                array.push(undefined);
            }
        }
        return array.splice(newIdx, 0, array.splice(oldIdx, 1)[0]);
    }
    _.mixin({ 'move': moveArrayItem });

    /**
     * Checks if parameter is valid JSON
     * @param str
     * @returns {boolean}
     */
    function validJSON(str) {
        try {
            var o = JSON.parse(JSON.stringify(JSON.parse(str)));
            if (o && typeof o === 'object' && o !== null) {
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }
    _.mixin({ isJSON: validJSON });

    /**
     * Native support for sortBy on Javascript arrays.
     * Can use "-" to indicate descending
     * Taken from: http://stackoverflow.com/questions/1129216/sorting-objects-in-an-array-by-a-field-value-in-javascript
     */
//Won't work below IE9, but totally safe otherwise
    (function () {
        function _dynamicSortMultiple(attr) {
            /*
             * save the arguments object as it will be overwritten
             * note that arguments object is an array-like object
             * consisting of the names of the properties to sort by
             */
            var props = arguments;
            return function (obj1, obj2) {
                var i = 0, result = 0, numberOfProperties = props.length;
                /* try getting a different result from 0 (equal)
                 * as long as we have extra properties to compare
                 */
                while (result === 0 && i < numberOfProperties) {
                    result = _dynamicSort(props[i])(obj1, obj2);
                    i += 1;
                }
                return result;
            };
        }

        function _dynamicSort(property) {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a, b) {
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
            };
        }

        Object.defineProperty(Array.prototype, "sortBy", {
            enumerable: false,
            writable: true,
            value: function () {
                return this.sort(_dynamicSortMultiple.apply(null, arguments));
            }
        });
    }());

    /**
     * Push one array into another.
     */
    (function () {
        Object.defineProperty(Array.prototype, "pushArray", {
            enumerable: false,
            writable: true,
            value: function () {
                var toPush = this.concat.apply([], arguments),
                    i;
                for (i = 0, len = toPush.length; i < len; ++i) {
                    this.push(toPush[i]);
                }
            }
        });
    }());

    /**
     * Return last element from an array.
     */
    (function () {
        Object.defineProperty(Array.prototype, "last", {
            enumerable: false,
            writable: true,
            value: function () {
                return this[this.length - 1];
            }
        });
    }());

    /**
     * Return last element from an array.
     */
    (function () {
        Object.defineProperty(Array.prototype, "toggle", {
            enumerable: false,
            get: function () {
                return function (value) {
                    var index = this.indexOf(value);
                    if (index === -1) {
                        this.push(value);
                    } else {
                        this.splice(index, 1);
                    }
                    return this;
                };
            }
        });
    }());

    /**
     * Find an array element by property, returns the first match.
     */
    (function () {
        Object.defineProperty(Array.prototype, "findOne", {
            enumerable: false,
            get: function () {
                return function (query) {
                    var result = null;
                    if (typeof query === 'object' && query !== null) {
                        var property = Object.keys(query)[0],
                            value = query[Object.keys(query)[0]];
                        this.forEach(function (item) {
                            if (!result) {
                                if (typeof item === 'object' && item !== null) {
                                    if (item[property] === value) {
                                        result = item;
                                    }
                                }
                            }
                        });
                    } else if (typeof query === 'string') {
                        this.forEach(function (item) {
                            if (!result) {
                                if (item === query) {
                                    result = item;
                                }
                            }
                        });
                    }
                    return result;
                };
            }
        });
    }());

    /**
     * Finds elements in an array by object properties
     */
    (function () {
        Object.defineProperty(Array.prototype, "findWhere", {
            enumerable: false,
            get: function () {
                return function (query) {
                    var results = [];
                    if (typeof query === 'object' && query !== null) {
                        var property = Object.keys(query)[0],
                            value = query[Object.keys(query)[0]];
                        this.forEach(function (item) {
                            if (typeof item === 'object' && item !== null) {
                                if (item[property] === value) {
                                    results.push(item);
                                }
                            }
                        });
                    }
                    return result;
                };
            }
        });
    }());

    /**
     * Returns an array according to property
     */
    (function () {
        Object.defineProperty(Array.prototype, "pluck", {
            enumerable: false,
            get: function () {
                return function (query) {
                    var results = [];
                    if (typeof query === 'string' && query !== null) {
                        this.forEach(function (item) {
                            if (item.hasOwnProperty(query)) {
                                results.push(item[query]);
                            }
                        });
                    }
                    return results;
                };
            }
        });
    }());

    /**
     * Capitalize a string
     */
    (function () {
        Object.defineProperty(String.prototype, "capitalize", {
            enumerable: false,
            writable: true,
            value: function () {
                return this.charAt(0).toUpperCase() + this.slice(1);
            }
        });
    }());
}]);