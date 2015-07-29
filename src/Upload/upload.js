angular.module('enplug.utils').directive('upload', ['$rootScope', '$log', 'Upload', 'Environment',
    function ($rootScope, $log, Upload, Environment) {
        'use strict';

        var maxFileSize = 100000000; //

        return {
            templateUrl: 'Upload/upload-button.tpl.html', // Todo include progress bar
            replace: true,
            scope: {
                settings: '=settings'
            },
            link: function ($scope, $element) {

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
                    // Add host and token to url
                    settings.url = Environment.host() + settings.url;
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
                        if ($file.size <= maxFileSize) {
                            $scope.fileName = $file.name;
                            startUpload($file);
                        } else {
                            window.alert('This file is larger than the maximum allowed size (100 MBs).'); // Todo replace with variable
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