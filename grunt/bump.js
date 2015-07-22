module.exports = function (grunt) {

    return {
        options: {
            // Take type dynamically from prompt
            type: grunt.config('bump.increment'),
            // Using all defaults, hard-coded here so if they change we aren't surprised
            files: ['package.json'],
            commit: 'true',
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['package.json'],
            createTag: false,
            push: false
        }
    }
};