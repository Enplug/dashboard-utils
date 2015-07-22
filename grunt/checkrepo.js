module.exports = {
    dist: {
        tag: {
            valid: '<%= pkg.version %>', // Check if pkg.version is valid semantic version
            eq: '<%= pkg.version %>'    // Check if highest repo tag is lower than pkg.version
        },
    //    tagged: false, // Require last commit (head) to not be tagged,
        clean: true // Require repo to be clean (no unstaged changes)
    }
};