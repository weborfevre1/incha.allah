// Sanity CMS Service Layer
import { sanityClient } from '../lib/sanity';
import type { SanityProduct, SanityCategory, SanityPage, PaginatedResponse } from '../types';

const PRODUCT_FRAGMENT = `
  _id,
  _type,
  title,
  slug,
  description,
  price,
  originalPrice,
  currency,
  image {
    asset -> {
      _id,
      url
    }
  },
  images[] {
    asset -> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title,
    slug
  },
  sku,
  stock,
  _createdAt,
  _updatedAt
`;

export const sanityService = {
  // Product queries
  async getProducts(limit = 20, offset = 0): Promise<SanityProduct[]> {
    const query = `*[_type == "product"] | order(_createdAt desc)[${offset}...${offset + limit}] {
      ${PRODUCT_FRAGMENT}
    }`;
    return await sanityClient.fetch(query);
  },

  async getProductById(id: string): Promise<SanityProduct | null> {
    const query = `*[_type == "product" && _id == "${id}"][0] {
      ${PRODUCT_FRAGMENT}
    }`;
    return await sanityClient.fetch(query);
  },

  async getProductBySlug(slug: string): Promise<SanityProduct | null> {
    const query = `*[_type == "product" && slug.current == "${slug}"][0] {
      ${PRODUCT_FRAGMENT}
    }`;
    return await sanityClient.fetch(query);
  },

  async searchProducts(searchTerm: string, limit = 20): Promise<SanityProduct[]> {
    const query = `*[_type == "product" && (
      title match "${searchTerm}*" ||
      description match "${searchTerm}*"
    )] | order(_createdAt desc)[0...${limit}] {
      ${PRODUCT_FRAGMENT}
    }`;
    return await sanityClient.fetch(query);
  },

  async getProductsByCategory(
    categorySlug: string,
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<SanityProduct>> {
    const countQuery = `count(*[_type == "product" && category->slug.current == "${categorySlug}"])`;
    const productsQuery = `*[_type == "product" && category->slug.current == "${categorySlug}"] | order(_createdAt desc)[${offset}...${
      offset + limit
    }] {
      ${PRODUCT_FRAGMENT}
    }`;

    const [total, products] = await Promise.all([
      sanityClient.fetch(countQuery),
      sanityClient.fetch(productsQuery),
    ]);

    return {
      data: products,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      hasMore: offset + limit < total,
    };
  },

  // Category queries
  async getCategories(): Promise<SanityCategory[]> {
    const query = `*[_type == "category"] | order(title asc) {
      _id,
      _type,
      title,
      slug,
      description,
      image {
        asset -> {
          _id,
          url
        }
      }
    }`;
    return await sanityClient.fetch(query);
  },

  async getCategoryBySlug(slug: string): Promise<SanityCategory | null> {
    const query = `*[_type == "category" && slug.current == "${slug}"][0] {
      _id,
      _type,
      title,
      slug,
      description,
      image {
        asset -> {
          _id,
          url
        }
      }
    }`;
    return await sanityClient.fetch(query);
  },

  // Page queries
  async getPageBySlug(slug: string): Promise<SanityPage | null> {
    const query = `*[_type == "page" && slug.current == "${slug}"][0] {
      _id,
      _type,
      title,
      slug,
      content,
      blocks
    }`;
    return await sanityClient.fetch(query);
  },

  // Search across all content types
  async search(searchTerm: string, limit = 10) {
    const query = `[
      *[_type == "product" && (
        title match "${searchTerm}*" ||
        description match "${searchTerm}*"
      )][0...${limit}] {
        _id,
        _type,
        title,
        "slug": slug.current,
        "image": image.asset->url
      },
      *[_type == "category" && title match "${searchTerm}*"][0...${limit}] {
        _id,
        _type,
        title,
        "slug": slug.current
      }
    ]`;
    const results = await sanityClient.fetch(query);
    return results.flat();
  },

  // Listen to real-time updates
  listen(query: string, callback: (update: any) => void) {
    const subscription = sanityClient.listen(query).subscribe(callback);
    return subscription;
  },
};

export default sanityService;
