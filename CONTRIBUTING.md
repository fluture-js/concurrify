# Contribution guide

## Making a contribution

* Fork and clone the project
* Commit changes to a branch named after the work that was done
* Make sure the tests pass locally (should happen automatically when you commit)
* Create a pull request

## NPM Scripts

* `npm run clean`: Remove build files and error logs
* `npm run lint`: Lint the source code
* `npm run lint:readme`: Lint the readme for broken internal links
* `npm run release major`: Release a new major version
* `npm run release minor`: Release a new minor version
* `npm run release patch`: Release a new patch version
* `npm run test`: Lint and test with coverage, then send coverage report to codecov
* `npm run test:all`: Lint and test without coverage
* `npm run test:coverage`: Test with coverage
* `npm run test:unit`: Test without coverage
* `npm run toc`: Generate a table of contents for the README

## Git hooks

I recommend using the following git hooks:

* `pre-commit`: `npm run test:all`
* `post-checkout`: `npm install`
* `post-merge`: `npm install`
