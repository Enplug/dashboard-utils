module.exports = {
    build: {
        src: ['src/**/*.tpl.html'],
        dest: 'tmp/templates.js',
        options: {
            module: 'dashboard-utils-templates',
            indentString: '    ', // 4-space indents
            useStrict: true,
            rename: function (moduleName) {
                return moduleName.replace('/templates', '').replace('.html', '');
            },
            htmlmin: {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: false,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            }
        }
    }
};
