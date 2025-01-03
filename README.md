# EarningsCall JavaScript Library

[![Version](https://img.shields.io/npm/v/earningscall.svg)](https://www.npmjs.org/package/earningscall)
[![Build Status](https://github.com/EarningsCall/earningscall-js/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/EarningsCall/earningscall-js/actions?query=branch%3Amaster)
[![Downloads](https://img.shields.io/npm/dm/earningscall.svg)](https://www.npmjs.com/package/earningscall)
[![Coverage Status](https://coveralls.io/repos/github/EarningsCall/earningscall-js/badge.svg?branch=master)](https://coveralls.io/github/EarningsCall/earningscall-js?branch=master)

[![bundlejs](https://deno.bundlejs.com/?q=earningscall&badge=detailed)](https://bundlejs.com/?q=earningscall&badge=detailed)
[![GitHub Stars](https://img.shields.io/github/stars/EarningsCall/earningscall-js.svg?style=social&label=Star)](https://github.com/EarningsCall/earningscall-js)
[![Twitter Follow](https://img.shields.io/twitter/follow/EarningsCallApp.svg?style=social&label=Follow)](https://twitter.com/EarningsCallApp)

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

The EarningsCall JavaScript library provides convenient access to the [EarningsCall API](https://earningscall.biz/api-guide) from
applications written in the JavaScript language (with TypeScript support). It includes a pre-defined set of
classes for API resources that initialize themselves dynamically from API
responses.

## Implementation Details

This library is designed for maximum efficiency and minimal dependencies:

- Zero external dependencies - relies only on standard JavaScript Node.js functionality
- Uses the built-in `fetch` API for HTTP requests
- Small library size (~4KB total)
- Tree-shakeable ES modules and TypeScript types included

The lightweight implementation means faster install times, reduced security attack surface, and better reliability since there are no third-party dependencies to maintain.

# Requirements

* Node.js 18+

## Installation

Install the package with:

```sh
npm install earningscall
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

### Retrieving a Basic Transcript for a Specific Year and Quarter

To obtain a company’s transcript for a particular year and quarter, use the `getBasicTranscript()` method. This method returns the complete transcript as a single continuous text string, as well as the date of the conference call.


```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });  // Get Company object by ticker symbol "AAPL"
const companyInfo = company.companyInfo;

console.log(`Company name: ${companyInfo.name} Sector: ${companyInfo.sector} Industry: ${companyInfo.industry}`);
const transcript = await company.getBasicTranscript({ year: 2021, quarter: 3 });
console.log(`${companyInfo.symbol} Q3 2021 Transcript: "${transcript?.text.slice(0, 100)}..."`);
```


Output

```
Company name: Apple Inc. Sector: Technology Industry: Consumer Electronics
AAPL Q3 2021 Transcript: "Good day, and welcome to the Apple Q3 FY 2021 Earnings Conference Call. Today's call is being recorded..."
```

### Retrieving All Transcripts for a Company

To access every available transcript for a specific company, use the `events()` method. This approach provides a comprehensive list of the company’s conference call transcripts in one place.

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });
console.log(`Getting all transcripts for: ${company.companyInfo.name}...`);
const events = await company.events();
for (const event of events) {
  const transcript = await company.getBasicTranscript({ event });
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


### Retrieve Text by Speaker, Including Name and Title

You can access earnings call transcripts segmented by speaker to gain a clearer understanding of who said what. The data is returned as an array of objects, where each object includes the speaker’s name, their professional title, and the text they provided. This structure makes it easy to identify the individual’s role and contributions during the call.

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });
const speakerGroups = await company.getSpeakerGroups({ year: 2024, quarter: 2 });
const firstSpeaker = speakerGroups?.speakers[0];
const secondSpeaker = speakerGroups?.speakers[1];
const thirdSpeaker = speakerGroups?.speakers[2];
console.log(`Speaker: ${firstSpeaker?.speakerInfo?.name}, ${firstSpeaker?.speakerInfo?.title}`);
console.log(`Text: ${firstSpeaker?.text?.slice(0, 100)}...`);
console.log(`Speaker: ${secondSpeaker?.speakerInfo?.name}, ${secondSpeaker?.speakerInfo?.title}`);
console.log(`Text: ${secondSpeaker?.text?.slice(0, 100)}...`);
console.log(`Speaker: ${thirdSpeaker?.speakerInfo?.name}, ${thirdSpeaker?.speakerInfo?.title}`);
console.log(`Text: ${thirdSpeaker?.text?.slice(0, 100)}...`);
```

Output

```
Speaker: Suhasini Chandramouli, Director of Investor Relations
Text: Good afternoon and welcome to the Apple Q2 fiscal year 2024 earnings conference call. My name is Suh...
Speaker: Tim Cook, CEO
Text: Thank you, Suhasini. Good afternoon, everyone, and thanks for joining the call. Today, Apple is repo...
Speaker: Luca Maestri, CFO
Text: Thank you, Tim, and good afternoon, everyone. Revenue for the March quarter was $90.8 billion, down ...
```


### Retrieving Word-Level Timestamps

Word-level timestamps are precise markers that indicate the exact point in time when each word in a transcript is spoken during an audio recording.

Why Are Word-Level Timestamps Useful?

1. Enhanced Searchability and Navigation:
   - You can jump to the exact part of the audio or video where a specific word or phrase was spoken.
   - Example: If the CEO says “inflation” at 3.25 seconds, you can navigate directly to that point.
2. Precise Content Synchronization:
   - Sync subtitles or captions with spoken content seamlessly.
   - Example: Video platforms like YouTube and Netflix use this feature for accurate subtitles.
3. Sentiment Analysis:
   - Analyzing the tone or meaning of specific words and correlating them to the audio.
   - Example: “Revenue growth” may have a positive sentiment, while “restructuring” may be neutral or negative.
4. AI Applications:
   - Word-level timestamps enable AI models to identify pauses, stress on words, or other speech patterns.
   - Example: Detecting emphasis on “record earnings” might indicate a focus on financial success.

Here's how you can retrieve the word-level timestamps for a single quarter:

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });
const wordLevelTranscript = await company.getWordLevelTimestamps({ year: 2021, quarter: 3 });

const firstSpeaker = wordLevelTranscript?.speakers[0];
const wordsAndStartTimes = firstSpeaker?.words.map((word, index) => ({
  word,
  startTime: firstSpeaker.startTimes[index]
}));
console.log(`Speaker: ${firstSpeaker?.speaker}`);
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

Prepared remarks and Q&A sections are key parts of earnings call transcripts that provide valuable insights to investors and analysts.

* **Prepared Remarks:** This is the scripted portion at the start of the call where executives (like the CEO or CFO) summarize the company’s performance, financials, and outlook. It is pre-planned and polished.
* **Q&A:** This follows the prepared remarks and is an unscripted session where analysts and investors ask questions, and company executives respond. It often contains candid insights not covered in prepared remarks.

Here's how you can retrieve the prepared remarks and Q&A for a single quarter.

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });

const transcript = await company.getQuestionAndAnswerTranscript({ year: 2021, quarter: 3 });
console.log(`${company} Q3 2021 Prepared Remarks: "${transcript?.preparedRemarks.slice(0, 100)}..."`);
console.log(`${company} Q3 2021 Q&A: "${transcript?.questionsAndAnswers.slice(0, 100)}..."`);
```

Output

```
Apple Inc. Q3 2021 Prepared Remarks: "Good day, and welcome to the Apple Q3 FY 2021 Earnings Conference Call. Today's call is being record..."
Apple Inc. Q3 2021 Q&A: "Our first question comes from Katie Huberty from Morgan Stanley. Please go ahead. Hello, Katie. Your..."
```


### Download Audio File for a Single Quarter

If you want to download the audio file for a single quarter, you can do so with the `downloadAudioFile` method.

```typescript
import { getCompany } from "earningscall";

const company = await getCompany({ symbol: "AAPL" });
console.log(`Downloading audio file for ${company} Q3 2021...`);
const audioFile = await company.downloadAudioFile({ year: 2021, quarter: 3 });
console.log(`Audio file downloaded to: ${audioFile?.outputFilePath}`);
```

Output

```
Downloading audio file for Apple Inc. Q3 2021...
Audio file downloaded to: AAPL_2021_Q3.mp3
```


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

By default, this library grants you access to only two companies, Apple Inc. and Microsoft, Inc.

To gain access to 5,000+ companies please signup here to get your API key: [https://earningscall.biz/api-pricing](https://earningscall.biz/api-pricing)


Once you have access to your API key, you can set the API Key like this:


### Set API Key

For access to the full library of 5,000+ companies, you must set an API key.

You can set the API key with the `setApiKey` functions.

```typescript
import { setApiKey } from "earningscall";

setApiKey("YOUR-SECRET-API-KEY");
```

You can also set the API key in the `EARNINGSCALL_API_KEY` environment variable.

```shell
export EARNINGSCALL_API_KEY="YOUR-SECRET-API-KEY"
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
