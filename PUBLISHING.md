# How to publish the EarningsCall JavaScript library to NPM

## Prerequisites

Install Node.js

Install packages:

```
npm install
```

## Make your Code Changes

First thing is to make your code changes and commit them to the repository.

## Run Tests

Next, you can run tests to ensure everything is passing:

```
npm test
```

Fix any linting errors:

```
npm run fix
```

If you want, you can see the coverage of the tests:

```
npm run cov
```

## Get Ready to Publish the New Version

Next, increment the version number in package.json.  Assuming the next version is 0.0.5, you would do this:

```
{
  "name": "earningscall",
  "version": "0.0.5",
  ...
}
```

Next, increment the version number in src/lib/version.ts.

```typescript
export const LIB_VERSION = '0.0.5';
```

Next, update the CHANGELOG.md file with the new version number and the changes made in the new version.

Then, create a new git tag for the new version.

```
git tag v0.0.5
git push origin v0.0.5
```

GitHub Actions will automatically build the library and publish it to NPM.
