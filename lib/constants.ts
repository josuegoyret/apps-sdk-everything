export const GOOGLE_MAPS_API_URL = "https://maps.googleapis.com";
export const GOOGLE_FAVICONS_HOST = "www.google.com";
export const POSTHOG_APP_URL = "https://app.posthog.com";
export const POSTHOST_CSP = "https://*.posthog.com";

export const OWNRIGHT_API_URL = "https://api.ownright.com";
export const OWNRIGHT_CLIENT_URL = "https://ownright.com";
export const OWNRIGHT_ORGANIZATION_ID = process.env.OWNRIGHT_ORGANIZATION_ID!;
export const OWNRIGHT_CLIENT_ID = process.env.OWNRIGHT_CLIENT_ID!;

export const NODE_ENV =
  process.env.NODE_ENV ?? process.env.NEXT_PUBLIC_NODE_ENV;
