import { EarningsEvent } from './event';

export type SpeakerInfo = {
  name?: string;
  title?: string;
};

export type Speaker = {
  speaker: string;
  speaker_info?: SpeakerInfo;
  text?: string;
  words?: string[];
  start_times?: number[];
};

export type Transcript = {
  event?: EarningsEvent;
  text?: string;
  speakers?: Speaker[];
  prepared_remarks?: string;
  questions_and_answers?: string;
  speaker_name_map_v2?: { [key: string]: SpeakerInfo };
};
