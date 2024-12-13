export type EarningsEvent = {
  year: number;
  quarter: number;
  conferenceDate: string;
};

export type EventsResponse = {
  companyName: string;
  events: EarningsEvent[];
};
