# EarningsCall JavaScript Library

[![Version](https://img.shields.io/npm/v/earningscall.svg)](https://www.npmjs.org/package/earningscall)
[![Build Status](https://github.com/EarningsCall/earningscall-js/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/EarningsCall/earningscall-js/actions?query=branch%3Amaster)
[![Downloads](https://img.shields.io/npm/dm/earningscall.svg)](https://www.npmjs.com/package/earningscall)
[![Try on RunKit](https://badge.runkitcdn.com/earningscall.svg)](https://runkit.com/npm/earningscall)
[![Coverage Status](https://coveralls.io/repos/github/EarningsCall/earningscall-js/badge.svg?branch=master)](https://coveralls.io/github/EarningsCall/earningscall-js?branch=master)


WARNING: THIS IS A WORK IN PROGRESS.  It is not yet ready for production use.

The EarningsCall JavaScript library provides convenient access to the [EarningsCall API](https://earningscall.biz/api-guide) from
applications written in the JavaScript language. It includes a pre-defined set of
classes for API resources that initialize themselves dynamically from API
responses.

# Requirements

* Node.js 18+

## Installation

Install the package with:

```sh
npm install earningscall
# or
yarn add earningscall
```



## Examples

### Get Transcript for single Year and Quarter

If you want to retrieve a specific transcript of a company for a single year and quarter, you can do so with the `getTranscript` method.


```typescript
import { getCompany } from "earningscall";

console.log("Getting company info for AAPL");
const company = await getCompany("AAPL");
console.log(company);
const transcript = await company.getTranscript({ year: 2021, quarter: 3 });
console.log(transcript?.text.slice(0, 100));
```

### Get All Transcripts for a Company

Sometimes you want to retrieve all transcripts for a company.  You can do so with the `events` method.

```typescript
import { getCompany } from "earningscall";

const company = await getCompany("AAPL");
const events = await company.events();
for (const event of events) {
  const transcript = await company.getTranscript({ event });
  console.log(`${company.companyInfo.symbol} Q${event.quarter} ${event.year}`);
  console.log(` * Transcript Text: "${transcript?.text.slice(0, 100)}..."`);
}
```

### Get Text by Speaker

```typescript
const transcriptLevel2 = await company.getTranscript({ year: 2021, quarter: 3, level: 2 });
console.log(transcriptLevel2?.speakers[0].text);
```


### Get Prepared Remarks and Q&A for a Single Quarter

```typescript
const transcriptLevel4 = await company.getTranscript({ year: 2021, quarter: 3, level: 4 });
console.log(transcriptLevel4?.prepared_remarks.slice(0, 100));
console.log(transcriptLevel4?.questions_and_answers.slice(0, 100));
```

### Set API Key

You can set the API key with the `setApiKey` method.

```typescript
import { setApiKey } from "earningscall";

setApiKey("your-secret-api-key");
```




