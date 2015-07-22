module.exports = function (grunt) {

    var semver = require('semver');
    var currentVersion = grunt.file.readJSON('./package.json').version;

    return {
        bump: {
            options: {
                questions: [
                    {
                        config:  'bump.increment',
                        type:    'list',
                        message: 'Bump version from ' + '<%= pkg.version %>' + ' to:',
                        choices: [
                            {
                                value: 'patch',
                                name:  'Patch:  ' + semver.inc(currentVersion, 'patch') + ' Backwards-compatible bug fixes.'
                            },
                            {
                                value: 'minor',
                                name:  'Minor:  ' + semver.inc(currentVersion, 'minor') + ' Add functionality in a backwards-compatible manner.'
                            },
                            {
                                value: 'major',
                                name:  'Major:  ' + semver.inc(currentVersion, 'major') + ' Incompatible API changes.'
                            }
                        ]
                    }
                ]
            }
        }
    }
};