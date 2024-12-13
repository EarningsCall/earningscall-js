import { EarningsEvent } from './event';

export type SpeakerInfo = {
  name?: string;
  title?: string;
};

export type Speaker = {
  speaker: string;
  speakerInfo?: SpeakerInfo;
  text?: string;
  words?: string[];
  startTimes?: number[];
};

export type Transcript = {
  event: EarningsEvent;
  text: string;
  speakers?: Speaker[];
  preparedRemarks?: string;
  questionsAndAnswers?: string;
  speakerNameMapV2?: { [key: string]: SpeakerInfo };
};
