import { getSanityClient } from '../lib/sanity';

export interface CMSPage {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  content: any[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface CMSPageService {
  getPage(slug: string): Promise<CMSPage | null>;
}

/**
 * GROQ query to fetch a page by slug
 */
const pageQuery = `*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  content,
  seo
}`;

/**
 * Creates a CMS page service using Sanity
 * @param config - Configuration object (currently unused but kept for consistency)
 * @returns The CMS page service implementation
 */
export const createCMSPageService = (config?: any): CMSPageService => {
  return {
    async getPage(slug: string): Promise<CMSPage | null> {
      try {
        const client = getSanityClient();
        const page = await client.fetch(pageQuery, { slug });

        if (!page) {
          console.warn(`Page with slug "${slug}" not found`);
          return null;
        }

        return page;
      } catch (error) {
        console.error('Error fetching page from Sanity:', error);
        throw new Error(`Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  };
};