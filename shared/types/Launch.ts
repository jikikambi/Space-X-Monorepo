export interface Launch {
  id: string;                 
  name: string;               
  date_utc: string;           
  upcoming: boolean;
  success: boolean | null;
  details: string | null;

  rocket?: {
    rocket_id?: string;
    rocket_name?: string;
    rocket_type?: string;
  };
  launch_site?: {
    site_id?: string;
    site_name?: string;
    site_name_long?: string;
  };
  links?: {
    mission_patch?: string;
    mission_patch_small?: string;
    presskit?: string;
    article_link?: string;
    wikipedia?: string;
    video_link?: string;
    flickr_images?: string[];   // 🚀 add Flickr images for gallery
  };
  telemetry?: {
    flight_club?: string | null;
  };
  [key: string]: any;
}
