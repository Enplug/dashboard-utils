module.exports = {
    // Build modules first for registering components on them
    modules: {
        src: ['src/**/module.js'],
        dest: 'tmp/modules.js'
    },
    // Exclude modules from second round, include templates file
    components: {
        src: ['tmp/modules.js', 'src/**/*.js', '!src/**/module.js', 'tmp/templates.js'],
        dest: 'dist/dashboard-utils.js'
    }
};