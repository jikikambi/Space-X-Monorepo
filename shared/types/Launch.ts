export interface Links {
  patch: {
    small: string | null;
    large: string | null;
  };
  webcast: string | null;
  article: string | null;
  wikipedia: string | null;
}

export interface Core {
  core: string | null;
  flight: number | null;
  gridfins: boolean;
  legs: boolean;
  reused: boolean;
  landing_attempt: boolean;
  landing_success: boolean | null;
  landing_type: string | null;
  landpad: string | null;
}

export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  details: string | null;
  rocket: string;
  launchpad: string;
  links: {
    patch: { small: string | null; large: string | null };
    reddit: {
      campaign: string | null;
      launch: string | null;
      media: string | null;
      recovery: string | null;
    };
    flickr: {
      small: string[];
      original: string[];
    };
    presskit: string | null;
    webcast: string | null;
    youtube_id: string | null;
    article: string | null;
    wikipedia: string | null;
  };
  telemetry?: {
    flight_club: string | null;
  } | null;
  upcoming: boolean;
  cores: any[];
  [key: string]: any; // optional: to allow other fields you don’t type yet
}

