module.exports = function (grunt) {

    return {
        options: {
            // Take type dynamically from prompt
            type: grunt.config('bump.increment'),
            // Using all defaults, hard-coded here so if they change we aren't surprised
            files: ['package.json'],
            commit: 'true',
            commitMessage: 'Release %VERSION%',
            commitFiles: ['package.json'],
            createTag: true,
            tagName: '%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: true,
            pushTo: 'origin'
        }
    }
};