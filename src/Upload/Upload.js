angular.module('enplug.utils').directive('upload', [
    '$rootScope', '$log', 'Upload', 'Environment', 'Alerts', 'User', 'ResourceService',
    function ($rootScope, $log, Upload, Environment, Alerts, User, ResourceService) {
        'use strict';
        return {
            templateUrl: '/js/modules/Upload/partials/upload.html', // Todo fix this path
            replace: true,
            scope: {
                settings: '=settings'
            },
            link: function ($scope, $element, $attrs) {

                /////////////////////////////////////////////////////////
                //
                // Initialization
                //
                /////////////////////////////////////////////////////////

                var settings;

                function init(_settings) {
                    settings = angular.copy(_settings || $scope.settings || {});
                    if (!settings.dropzone && !settings.hideFilename) {
                        settings.showFilename = true;
                    }
                    if (settings.multiple) {
                        // recompile element with multiple flag
                        $element.find('input').attr('multiple', true);
                    }
                    if (!settings.accept) {
                        settings.accept = '*';
                    }
                    // Default to our generic resource upload
                    if (!settings.url) {
                        settings.url = '/resource';
                    }
                    // Add host and token to url
                    settings.url = Environment.host() + settings.url + '?token=';
                    settings.url += (settings.admin) ? User.root().Token : User.target().Token;
                    if (!settings.label) {
                        settings.label = 'Upload';
                    }
                    $scope.uploadLabel = settings.label;
                    // Random ID to allow label-input click connection
                    $scope.uploadId = Math.floor(Math.random() * (1000 + 1)) + 0;
                    $scope.settings = settings;
                }

                init($scope.settings);

                /////////////////////////////////////////////////////////
                //
                // Upload Lifecycle
                //
                /////////////////////////////////////////////////////////

                function startUpload($file) {
                    $scope.$broadcast('startProgress');

                    // We allow passing in a function as data in case we need to get access to the file name or
                    // other file attributes
                    var fields = _.isFunction(settings.fields) ? settings.fields($file) : settings.fields;
                    // Fire the upload account
                    Upload.upload({
                        url: settings.url,
                        fields: fields,
                        file: $file,
                        fileFormDataName: 'Filedata',
                        ignoreLoadingBar: true
                    })
                        .progress(uploadProgress)
                        .success(uploadSuccess)
                        .error(uploadError)
                        .then(function () {
                            $scope.uploadPercent = 0;
                        });
                    $scope.fileName = $file.name;
                }

                // Process progress events
                function uploadProgress(event) {
                    var percent = parseInt(100.0 * event.loaded / event.total);
                    if (percent === 100) {
                        percent = 95;
                    }
                    $scope.$broadcast('updateProgress', percent);
                }

                function uploadSuccess(data, status, headers, config) {
                    var resource = data.Result;
                    if (data.Success === true && !_.isUndefined(resource)) {
                        $log.debug('Successful upload: ', resource);
                        complete(resource);
                    } else {
                        error(data);
                    }
                    $scope.$broadcast('completeProgress');
                }

                function complete(resource) {
                    if (_.isFunction(settings.success)) {
                        settings.success(resource);
                    }
                    $scope.successfulUpload = true;
                }

                function error(data) {
                    $log.debug('Unsuccessful upload.');
                    if (_.isFunction(settings.error)) {
                        settings.error(data);
                    }
                    if (_.validString(data.ErrorMessage)) {
                        Alerts.add('error', data.ErrorMessage);
                    } else {
                        Alerts.add('error', 'Unsuccessful upload.');
                    }
                }

                function uploadError(data, status, headers, config) {
                    $log.error('Upload error.');
                }


                /////////////////////////////////////////////////////////
                //
                // Page Actions
                //
                /////////////////////////////////////////////////////////

                $scope.process = function ($files) {
                    // call onDrop function if exists
                    settings.onSelect && settings.onSelect($files);

                    // autoupload files by default unless explicitly stated not to
                    if (typeof settings.autoUpload === 'undefined' || settings.autoUpload) {
                        $scope.upload($files);
                    }
                };

                $scope.upload = function ($files) {
                    $files.forEach(function ($file) {
                        if ($file.size <= 100000000) {
                            $scope.fileName = $file.name;
                            startUpload($file);
                        } else {
                            window.alert('This file is larger than the maximum allowed size (100 MBs).');
                        }
                    });
                };

                $rootScope.$on('upload', function (e, uploadSettings, file) {
                    init(uploadSettings);
                    $scope.upload([file]);
                });
            }
        };
    }
]);

angular.module('enplug.utils').service('epUpload', [
    '$rootScope', '$q', '$log', 'Upload',
    function ($rootScope, $q, $log, Upload) {

        // inherit function taken from window.util, factored out.
        // Todo refactor this
        function inherits(ctor, superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
                constructor: {
                    value: ctor,
                    enumerable: false,
                    writeable: true,
                    configurable: true
                }
            });
        }

        var _Upload = function (file, settings) {
            if (!(this instanceof _Upload)) {
                console.log('File: ', file);
                console.log('SettingsL ', settings);
                return new _Upload(file, settings);
            }

            EventEmitter.call(this);

            var
                _settings = angular.copy(settings),
                defaultSettings = {
                    url: '/resources',
                    file: file,
                    fileFormDataName: 'Filedata',
                    ignoreLoadingBar: true
                };

            delete _settings.file;
            _settings.data = _.isFunction(_settings.data) ? _settings.data(file) : _settings.data;
            console.log('Data Settings: ', _settings.data);
            this.settings = angular.extend(defaultSettings, _settings || {});

            return this;
        };

        inherits(_Upload, EventEmitter);

        _Upload.prototype.start = function () {
            var
                deferred = $q.defer(),
                self = this;

            this.emit('start');

            // Fire the upload account
            Upload
                .upload(self.settings)
                .progress(onProgress)
                .success(onSuccess)
                .error(onError)
                .then(function () {
                    //
                });

            /**
             * handler for progress events, emits progress in percentage
             * @param {Object} event
             */
            function onProgress(event) {
                var percent = parseInt(100.0 * event.loaded / event.total);
                if (percent === 100) {
                    percent = 95;
                }

                self.emit('progress', percent);
            }

            /**
             * handler for when upload finishes, emits success + reuslt
             * @param {Object} data
             * @param status
             * @param headers
             * @param config
             */
            function onSuccess(data, status, headers, config) {
                self.emit('finished', data.Result);

                if (data.Success !== true || typeof data.Result === 'undefined') {
                    self.emit('finished', new Error(), data.Result);
                    deferred.reject(new Error());
                } else {
                    self.emit('finished', null, data.Result);
                    deferred.resolve(data.Result);
                }
            }

            /**
             * error handler for upload stream, emits error
             * @param data
             * @param status
             * @param headers
             * @param config
             */
            function onError(data, status, headers, config) {
                self.emit('error', new Error());
            }

            return deferred.promise;
        };

        return _Upload;
    }
]);

epUpload.controller('ProgressBarController', [
    '$scope', '$log', '$timeout','Upload',
    function ($scope, $log, $timeout, Upload) {
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
]);