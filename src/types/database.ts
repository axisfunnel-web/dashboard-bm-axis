export type QualityRating = "GREEN" | "YELLOW" | "RED" | "UNKNOWN";

export type PhoneStatus = "CONNECTED" | "FLAGGED" | "RESTRICTED";

export type EventSeverity = "info" | "warning" | "critical";

export type EventSource = "webhook" | "poll";

/** One row per WhatsApp number, from public.v_phone_health */
export interface PhoneHealthRow {
  phone_id: string;
  display_number: string;
  verified_name: string | null;
  quality_rating: QualityRating;
  status: PhoneStatus;
  name_status: string | null;
  last_event_at: string | null;
  phone_updated_at: string | null;
  waba_id: string | null;
  waba_name: string | null;
  account_review_status: string | null;
  business_verification_status: string | null;
  bm_id: string | null;
  bm_name: string | null;
  meta_business_id: string | null;
  messaging_limit: string | null;
  is_active: boolean;
  client_id: string;
  client_name: string;
}

export interface HealthEventPayload {
  quality?: string;
  status?: string;
  name_status?: string;
  [key: string]: unknown;
}

/** One row per health event, from public.health_events */
export interface HealthEventRow {
  id: string;
  phone_number_id: string;
  waba_id: string | null;
  bm_id: string | null;
  event_type: string;
  source: EventSource;
  severity: EventSeverity;
  payload: HealthEventPayload | null;
  created_at: string;
}
