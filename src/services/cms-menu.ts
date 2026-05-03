import { getSanityClient } from '../lib/sanity';

export interface MenuItem {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
  url?: string;
  children?: MenuItem[];
}

export interface Menu {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  items: MenuItem[];
}

export interface CMSMenuService {
  getMenu(slug: string): Promise<Menu | null>;
}

/**
 * GROQ query to fetch categories for navbar menu
 */
const categoriesQuery = `*[_type == "category"] | order(title asc){
  _id,
  title,
  "slug": slug.current
}`;

/**
 * Creates a CMS menu service using Sanity
 * @param config - Configuration object (currently unused but kept for consistency)
 * @returns The CMS menu service implementation
 */
export const createCMSMenuService = (config?: any): CMSMenuService => {
  return {
    async getMenu(slug: string): Promise<Menu | null> {
      try {
        const client = getSanityClient();

        if (slug === 'navbar') {
          // For navbar, fetch categories as menu items
          const categories = await client.fetch(categoriesQuery);

          const menuItems: MenuItem[] = categories.map((category: any) => ({
            _id: category._id,
            title: category.title,
            slug: { current: category.slug },
            url: `/collections/${category.slug}`,
          }));

          return {
            _id: 'navbar-menu',
            title: 'Navigation',
            slug: { current: 'navbar' },
            items: menuItems,
          };
        }

        // For other menus, you could implement custom menu fetching
        console.warn(`Menu with slug "${slug}" not implemented`);
        return null;
      } catch (error) {
        console.error('Error fetching menu from Sanity:', error);
        throw new Error(`Failed to fetch menu: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  };
};