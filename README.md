<h2>Dependencies:</h2>
- angularjs 1.4+
- Lodash
- ngDialog
- ng-file-upload
- angular-sanitize
- angular-cookies
- angular-cache

<h2>Contributing</h2>

<h5>Build:</h5>
1. `git clone`
2. `npm install`
3. `grunt build`/`grunt watch`

<h5>Develop:</h5>
1. New branch
2. Pull request & code review
3. `grunt version`
4. Combine into one commit (`git rebase -i head~[commitnumber]`)
5. Merge with master

<h5>Release:</h5>
1. add `aws.private.json`
2. `grunt release`

<h2>Notes</h2>

<h4>What Grunt does:</h4>

<h5>build:</h5>
1. Concatenates files
2. Minifies files

<h5>version:</h5>
1. Builds project
2. Check to make sure we're not on master
3. Makes sure last commit wasn't tagged
4. Check for clean working directory (no changes to be added/committed)
5. Check to make sure we're not jumping a tag (e.g. 1.0.0 to 1.0.2)
6. Bumps version (major/minor/patch) & commits

<h5>release:</h5>
1. Checks to make sure we're on master
2. Makes sure tag is greater than what's on master
3. Make sure most recent commit is not tagged
4. Creates tag from version
5. Pushes tag and commit (should only be one commit!) to Github
6. (later) Upload to S3
7. (later) Update Bower
