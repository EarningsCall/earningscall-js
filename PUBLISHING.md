# How to publish the EarningsCall JavaScript library to NPM

First, increment the version number in package.json.

```
{
  "name": "earningscall",
  "version": "0.0.5",
  ...
}
```

Next, update the CHANGELOG.md file with the new version number and the changes made in the new version.

Then, create a new git tag for the new version.

```
git tag v0.0.5
git push origin v0.0.5
```

GitHub Actions will automatically build the library and publish it to NPM.
