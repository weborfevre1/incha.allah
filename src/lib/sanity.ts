import { createClient } from '@sanity/client';

// Sanity client initialization with comprehensive configuration
const projectId = import.meta.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = import.meta.env.NEXT_PUBLIC_SANITY_API_VERSION;
const token = import.meta.env.SANITY_API_TOKEN;
const useCdn = import.meta.env.NEXT_PUBLIC_SANITY_USE_CDN === 'true';

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity configuration. Please check your .env.local file for NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET'
  );
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: apiVersion || '2025-01-01',
  useCdn,
  token,
  ignoreBrowserWarnings: true,
  withCredentials: true,
});

export const sanityTokenizedClient = createClient({
  projectId,
  dataset,
  apiVersion: apiVersion || '2025-01-01',
  token,
  useCdn: false,
  withCredentials: true,
});

// Export for server-side use
export const getSanityClient = () => {
  return sanityClient;
};

export const getSanityTokenizedClient = () => {
  return sanityTokenizedClient;
};
