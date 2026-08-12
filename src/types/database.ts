export type QualityRating = "GREEN" | "YELLOW" | "RED" | "UNKNOWN";

export type PhoneStatus = "CONNECTED" | "FLAGGED" | "RESTRICTED";

export type EventSeverity = "info" | "warning" | "critical";

export type EventSource = "webhook" | "poll";

export type MessageStatus = "sent" | "delivered" | "read" | "failed";

/** One row per WhatsApp number, from public.v_phone_health */
export interface PhoneHealthRow {
  phone_id: string;
  /** Meta's phone_number_id — links to messaging_stats / message_events */
  meta_phone_number_id: string;
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

/** One row per phone per day, from public.messaging_stats */
export interface MessagingStatsRow {
  phone_number_id: string;
  waba_id: string | null;
  stat_date: string;
  sent: number;
  delivered: number;
  captured_at: string;
}

/** One row per BM, from public.v_bm_usage_today */
export interface BmUsageTodayRow {
  bm_id: string;
  bm_name: string;
  client_name: string;
  messaging_limit: string | null;
  messaging_limit_updated_at: string | null;
  sent_today: number;
  delivered_today: number;
}

/** One row per message status event, from public.message_events */
export interface MessageEventRow {
  id: string;
  wamid: string | null;
  phone_number_id: string;
  waba_id: string | null;
  status: MessageStatus;
  error_code: number | null;
  error_title: string | null;
  error_details: string | null;
  recipient_masked: string | null;
  conversation_category: string | null;
  event_ts: string;
  created_at: string;
}
