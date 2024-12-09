export type EarningsEvent = {
  year: number;
  quarter: number;
  conference_date: string;
  // Add other event properties as needed
};

export type EventsResponse = {
  company_name: string;
  events: EarningsEvent[];
};
