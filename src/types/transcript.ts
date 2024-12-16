import { EarningsEvent } from './event';

export type SpeakerInfo = {
  name?: string;
  title?: string;
};

export type Speaker = {
  speaker: string;
  speakerInfo?: SpeakerInfo;
  text: string;
};

export type WordLevelSpeaker = {
  speaker: string;
  speakerInfo?: SpeakerInfo;
  words: string[];
  startTimes: number[];
};

/**
 * A transcript of a single earnings call.
 */
export type WordLevelTimestampsTranscript = {
  event: EarningsEvent;
  speakers: WordLevelSpeaker[];
};

/**
 * A transcript of a single earnings call.
 */
export type QuestionAndAnswersTranscript = {
  event: EarningsEvent;
  preparedRemarks: string;
  questionsAndAnswers: string;
};

/**
 * A basic transcript of a single earnings call.
 */
export type BasicTranscript = {
  event: EarningsEvent;
  text: string;
};

/**
 * A transcript of a single earnings call with speaker groups.
 */
export type SpeakerGroups = {
  event: EarningsEvent;
  speakers: Speaker[];
  speakerNameMapV2?: { [key: string]: SpeakerInfo };
};
