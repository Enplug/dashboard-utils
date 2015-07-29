angular.module('enplug.utils.upload', ['Upload/progress-bar.tpl', 'Upload/upload-button.tpl']).service('epUpload', [
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
