module.exports = {
    build: {
        singleModule: true,
        module: 'enplug.utils.templates',
        src: ['src/**/*.tpl.html'],
        dest: 'tmp/templates.js'
    }
};