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

Start using it in your code:

ESM (ECMAScript Modules)

```javascript
import { getCompany } from "earningscall";
```

CommonJS

```javascript
const { getCompany } = require('earningscall');
```


## Examples

### Get Transcript for a Single Year and Quarter

If you want to retrieve a specific transcript of a company for a single year and quarter, you can do so with the `getTranscript` method.


```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });  // Get Company object by ticker symbol "AAPL"
const companyInfo = company.companyInfo;
console.log(`Company name: ${companyInfo.name} Sector: ${companyInfo.sector} Industry: ${companyInfo.industry}`);

const transcript = await company.getTranscript({ year: 2021, quarter: 3 });
console.log(`${companyInfo.symbol} Q3 2021 Transcript: "${transcript?.text.slice(0, 100)}..."`);
```


Output

```
Company name: Apple Inc. Sector: Technology Industry: Consumer Electronics
AAPL Q3 2021 Transcript: "Good day, and welcome to the Apple Q3 FY 2021 Earnings Conference Call. Today's call is being recorded..."
```

### Get All Transcripts for a Company

Sometimes you want to retrieve all transcripts for a company.  You can do so with the `events` method.

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });
console.log(`Getting all transcripts for: ${company.companyInfo.name}...`);
const events = await company.events();
for (const event of events) {
  const transcript = await company.getTranscript({ event });
  console.log(`${company.companyInfo.symbol} Q${event.quarter} ${event.year}`);
  console.log(` * Transcript Text: "${transcript?.text.slice(0, 100)}..."`);
}
```

Output

```
Getting all transcripts for: Apple Inc...
* Q4 2023
  Transcript Text: "Good day and welcome to the Apple Q4 Fiscal Year 2023 earnings conference call. Today's call is bein..."
* Q3 2023
  Transcript Text: "Good day and welcome to the Apple Q3 Fiscal Year 2023 earnings conference call. Today's call is bein..."
* Q2 2023
  Transcript Text: "At this time for opening remarks and introductions, I would like to turn the call over to Suhasini T..."
* Q1 2023

  ...
```


### Get Text by Speaker with Speaker Name and Title

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });

const transcriptLevel2 = await company.getTranscript({ year: 2024, quarter: 2, level: 2 });
const firstSpeaker = transcriptLevel2!.speakers![0];
console.log(`Speaker: ${firstSpeaker?.speakerInfo?.name}, ${firstSpeaker?.speakerInfo?.title}`);
console.log(`Text: ${firstSpeaker?.text}`);
```

Output

```
Speaker: Suhasini Chandramouli, Director of Investor Relations
Text: Good afternoon and welcome to the Apple Q2 fiscal year 2024 earnings conference call...
```


### Get Word-Level Timestamps

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });
// Level 3 Transcript Data includes words and start times
const transcriptLevel3 = await company.getTranscript({ year: 2021, quarter: 3, level: 3 });
const firstSpeaker = transcriptLevel3?.speakers![0];
if (!firstSpeaker) {
  console.log("No speakers found in transcript");
  return;
}
const wordsAndStartTimes = firstSpeaker?.words?.map((word, index) => ({
  word,
  startTime: firstSpeaker?.startTimes![index]
}));
console.log(`Speaker: ${firstSpeaker?.speakerInfo?.name}, ${firstSpeaker?.speakerInfo?.title}`);
console.log("Words with start times:", wordsAndStartTimes);
```

Output

```
Speaker: Suhasini Chandramouli, Director of Investor Relations
Words with start times: [
  { word: 'Good', startTime: 0.049 },
  { word: 'day,', startTime: 0.229 },
  { word: 'and', startTime: 0.489 },
  { word: 'welcome', startTime: 0.609 },
  { word: 'to', startTime: 0.929 },
  ...
]
```

### Get Prepared Remarks and Q&A for a Single Quarter

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });

const transcriptLevel4 = await company.getTranscript({ year: 2021, quarter: 3, level: 4 });
console.log(`${company} Q3 2021 Prepared Remarks: "${transcriptLevel4?.preparedRemarks?.slice(0, 100)}..."`);
console.log(`${company} Q3 2021 Q&A: "${transcriptLevel4?.questionsAndAnswers?.slice(0, 100)}..."`);
```

Output

```
Apple Inc. Q3 2021 Prepared Remarks: "Good day, and welcome to the Apple Q3 FY 2021 Earnings Conference Call. Today's call is being record..."
Apple Inc. Q3 2021 Q&A: "Our first question comes from Katie Huberty from Morgan Stanley. Please go ahead. Hello, Katie. Your..."
```


### Download Audio File for a Single Quarter

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });
console.log(`Downloading audio file for ${company} Q3 2021...`);
const audioFile = await company.getAudioFile({ year: 2021, quarter: 3 });
console.log(`Audio file downloaded to: ${audioFile}`);
```

Output

```
Downloading audio file for Apple Inc. Q3 2021...
Audio file downloaded to: AAPL_2021_Q3.mp3
```

### Set API Key

For access to non-demo companies, you need to set an API key.

You can set the API key with the `setApiKey` method.

```typescript
import { setApiKey } from "earningscall";

setApiKey("YOUR-SECRET-API-KEY");
```

You can also set the API key in the `EARNINGSCALL_API_KEY` environment variable.



### List All Companies

```typescript
import { getAllCompanies } from "earningscall";

const companies = await getAllCompanies();
console.log(companies);
```

Output

```
[
  Company {
    companyInfo: {
      exchange: 'NASDAQ',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Technology',
      industry: 'Consumer Electronics'
    },
    name: 'Apple Inc.',
    events_: undefined
  },
  Company {
    companyInfo: {
      exchange: 'NASDAQ',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      sector: 'Technology',
      industry: 'Software - Infrastructure'
    },
    name: 'Microsoft Corporation',
    events_: undefined
  }
]
```



### List S&P 500 Companies

```typescript
import { listSP500Companies } from "earningscall";

const companies = await listSP500Companies();
console.log(companies);
```

Output

```
[
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  ...
]
```
