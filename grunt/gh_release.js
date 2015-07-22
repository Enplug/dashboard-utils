module.exports = function (grunt) {
    return {
        dist: {
            options: {
                token: grunt.file.readJSON('grunt/gh.private.json').token,
                owner: 'aleross',
                repo: 'DashboardUtils'
            },
            release: {
                tag_name: 'v<%= pkg.version %>',
                asset: {
                    name: '<%= pkg.name %>.js-v<%= pkg.version %>.zip',
                    file: 'archive.zip',
                    'Content-Type': 'application/zip'
                }
            }
        }
    }
};