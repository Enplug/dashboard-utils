module.exports = {
    options: {
        accessKeyId: '<%= aws.accessKeyId %>',
        secretAccessKey: '<%= aws.secretAccessKey %>',
        bucket: 'cdn.enplug.net'
    },
    release: {
        cwd: 'dist/',
        src: '**',
        dest: '<%= pkg.name %>/<%= pkg.version %>/',
        cacheTTL: 0,
        enableWeb: true
    }
};