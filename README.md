Dependencies:

- Lodash
- ngDialog
- ng-file-upload


Build Process:

1. Check for correct branch (master)
2. Check for clean working directory (no changes to be added/committed)
3. Check to make sure latest commit is not tagged (must commit before tagging and releasing)


1. (others) create templates JS
2. Concat JS
3. Minify JS
4. (later) Obfuscate JS
4. Increment version
5. Git add (package.json only)
6. Git commit
7. Git push
8. Git create tag
9. Compress dist into zip
10. Git release
11. (later) Upload to S3
12. (later) Update Bower


Updating npm packages: Update individually. For mass-updates (be careful!) use npm-check-update