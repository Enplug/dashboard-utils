<h1>dashboard-utils.js</h1>

<h4>Dependencies:</h4>
- Lodash
- ngDialog
- ng-file-upload

<h2>Contributing</h2>

<h3>Build:</h3>
1. `git clone`
2. `npm install`
3. `grunt build`/`grunt watch`

<h3>Develop:</h3>
1. New branch
2. Pull request & code review
3. Merge with master

Release:
1. `grunt version`
2. Combine into one commit (`git rebase -i head~[commitnumber]`)
3. add `aws.private.json` & `gh.private.json`
4. `grunt release`

<h2>Notes</h2>

<h3>What Grunt does:</h3>

<h4>Build:</h4>
1. Concatenates files
2. Minifies files

<h4>Version:</h4>
1. Builds project
2. Check for correct branch (master)
3. Check for clean working directory (no changes to be added/committed)
4. Check to make sure we're not jumping a tag (e.g. 1.0.0 to 1.0.2)
5. Bumps version (major/minor/patch) & commits

<h4>Release:</h4>
1. Creates tag from version
2. Pushes tag and commit (should only be one commit!) to Github
3. (later) Upload to S3
4. (later) Update Bower



*Git push errors? Try:*
- `git config --global push.default simple`
- `git branch --set-upstream master origin/master`


*Updating npm packages:* Update individually. For mass-updates (be careful!) use `npm-check-update`
