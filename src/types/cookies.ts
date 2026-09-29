export const COOKIE_CONSENT_KEY = 'flores_cookie_consent_v1';

export type CookieConsentStatus = 'accepted' | 'rejected' | null;

export interface CookiePreferences {
  status: CookieConsentStatus;
  analytics: boolean;
  timestamp: string;
}
