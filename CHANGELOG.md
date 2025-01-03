# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.4](https://github.com/EarningsCall/earningscall-js/compare/v2.0.3...v2.0.4) (2024-12-24)

-   Add support for STO exchange.

## [2.0.3](https://github.com/EarningsCall/earningscall-js/compare/v2.0.2...v2.0.3) (2024-12-20)

-   Standardize user-agent header on HTTP requests.

## [2.0.2](https://github.com/EarningsCall/earningscall-js/compare/v2.0.1...v2.0.2) (2024-12-17)

-   Clarify and improve documentation in README.md.

## [2.0.1](https://github.com/EarningsCall/earningscall-js/compare/v2.0.0...v2.0.1) (2024-12-17)

-   Update documentation in README.md.

## [2.0.0](https://github.com/EarningsCall/earningscall-js/compare/v1.0.4...v2.0.0) (2024-12-16)

-   BREAKING CHANGE: Remove `getTranscript()` function from `Company` class.  In it's place, there are now 4 new functions: `getBasicTranscript()`, `getSpeakerGroups()`, `getWordLevelTimestamps()`, and `getQuestionAndAnswerTranscript()`.  This is to enhance the developer experience by providing Types that are specific to type of transcript data that is being retrieved.
-   BREAKING CHANGE: Change function name from `getAudioFile()` to `downloadAudioFile()`.
-   Add `getBasicTranscript` method to `Company` class.
-   Add `getSpeakerGroups` method to `Company` class.
-   Add `getWordLevelTimestamps` method to `Company` class.
-   Add `getQuestionAndAnswerTranscript` method to `Company` class.


## [1.0.4](https://github.com/EarningsCall/earningscall-js/compare/v1.0.3...v1.0.4) (2024-12-15)

-   Add various documentation comments to the code.

## [1.0.3](https://github.com/EarningsCall/earningscall-js/compare/v1.0.2...v1.0.3) (2024-12-15)

-   Fix `getSP500Companies` to not throw an exception when a symbol is not found.

## [1.0.2](https://github.com/EarningsCall/earningscall-js/compare/v1.0.1...v1.0.2) (2024-12-15)

-   Update NPM files exclusion list to reduce total package size (remove map files and all spec files).

## [1.0.1](https://github.com/EarningsCall/earningscall-js/compare/v1.0.0...v1.0.1) (2024-12-15)

-   Use NPM instead of Yarn.
-   Eliminate `*.spec.ts` files from the package output (which didn't work in Yarn).

## [1.0.0](https://github.com/EarningsCall/earningscall-js/compare/v0.0.27...v1.0.0) (2024-12-15)

-   Make first major release version available.

## [0.0.27](https://github.com/EarningsCall/earningscall-js/compare/v0.0.26...v0.0.27) (2024-12-15)

-   Cleanup dead code and add more unit tests.

## [0.0.26](https://github.com/EarningsCall/earningscall-js/compare/v0.0.25...v0.0.26) (2024-12-15)

-   Prevent duplicate calls to the symbols API by caching the symbols object for 24 hours (or respect cache-control headers from the API).

## [0.0.25](https://github.com/EarningsCall/earningscall-js/compare/v0.0.24...v0.0.25) (2024-12-13)

-   Update documentation in README.md.

## [0.0.24](https://github.com/EarningsCall/earningscall-js/compare/v0.0.23...v0.0.24) (2024-12-13)

-   BREAKING CHANGE: Convert types from snake case to camel case.
-   Pass proper NPM package version in UserAgent.
-   Add proper error checking, such as when API returns 404 not found.

## [0.0.23](https://github.com/EarningsCall/earningscall-js/compare/v0.0.22...v0.0.23) (2024-12-12)

-   Try yet again to resolve type build issue.

## [0.0.22](https://github.com/EarningsCall/earningscall-js/compare/v0.0.21...v0.0.22) (2024-12-12)

-   Bump version to 0.0.22 to fix type issue.

## [0.0.21](https://github.com/EarningsCall/earningscall-js/compare/v0.0.20...v0.0.21) (2024-12-12)

-   Fix type issue by exporting types from `index.ts`: change files names to remove the .d.ts extension (only .ts is necessary)

## [0.0.20](https://github.com/EarningsCall/earningscall-js/compare/v0.0.19...v0.0.20) (2024-12-12)

-   Export types from `index.ts`.

## [0.0.19](https://github.com/EarningsCall/earningscall-js/compare/v0.0.17...v0.0.18) (2024-12-12)

-   Try to resolve type issue by exporting types from `index.ts` instead of `src/types`.

## [0.0.17](https://github.com/EarningsCall/earningscall-js/compare/v0.0.16...v0.0.17) (2024-12-10)

-   Bugfix: Don't export types from `index.ts`.

## [0.0.16](https://github.com/EarningsCall/earningscall-js/compare/v0.0.15...v0.0.16) (2024-12-10)

-   Add `getSP500Companies` function.
-   Remove `loglevel` and `pino` dependencies.
-   BREAKING CHANGE: Update `getCompany()` interface to take a `GetCompanyOptions` object.
-   Utilize Speaker Name Map from API response to map speaker labels to their name and titles.

## [0.0.15](https://github.com/EarningsCall/earningscall-js/compare/v0.0.14...v0.0.15) (2024-12-10)

-   Remove console log statements from `api` module.
-   Allow Level 4 transcripts to be retrieved.

## [0.0.14](https://github.com/EarningsCall/earningscall-js/compare/v0.0.13...v0.0.14) (2024-12-09)

-   Add `setApiKey` method to `api` module.

## [0.0.13](https://github.com/EarningsCall/earningscall-js/compare/v0.0.12...v0.0.13) (2024-12-09)

-   Add support for level 2 and 3 transcripts.
-   Add `events` method to `Company` class.
-   Add more unit tests for `Company` class.

### [0.0.12](https://github.com/EarningsCall/earningscall-js/compare/v0.0.11...v0.0.12) (2024-12-09)

-   Update files include patterns.

### [0.0.11](https://github.com/EarningsCall/earningscall-js/compare/v0.0.9...v0.0.11) (2024-12-01)

### [0.0.6](https://github.com/EarningsCall/earningscall-js/compare/v0.0.5...v0.0.6) (2024-11-30)

-   Upgrade typedoc to version ^0.23.21.

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.4](https://github.com/EarningsCall/earningscall-js/compare/v0.0.2...v0.0.4) (2024-11-30)
