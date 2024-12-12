export type EarningsEvent = {
  year: number;
  quarter: number;
  conference_date: string; // TODO: Should we parse this as a date object?
};

export type EventsResponse = {
  company_name: string;
  events: EarningsEvent[];
};
