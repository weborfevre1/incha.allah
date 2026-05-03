import { getSanityClient } from '../lib/sanity';
import { toImage, toTaxedPrice } from '../lib/sanity-helpers';

export interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  image?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants?: any[];
  tags?: string[];
}

export interface CollectionDetails {
  category: Category;
  products: Product[];
  total: number;
}

export interface CollectionService {
  getCollectionDetails(slug: string, options?: { limit?: number; offset?: number }): Promise<CollectionDetails>;
  getCategories(): Promise<Category[]>;
}

/**
 * GROQ query to fetch a category by slug
 */
const categoryQuery = `*[_type == "category" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  description,
  image
}`;

/**
 * GROQ query to fetch products by category
 */
const productsByCategoryQuery = `*[_type == "product" && references($categoryId)] | order(title asc) [$offset...$limit]{
  _id,
  title,
  slug,
  description,
  price,
  compareAtPrice,
  images,
  variants,
  tags
}`;

/**
 * GROQ query to fetch all categories
 */
const categoriesQuery = `*[_type == "category"] | order(title asc){
  _id,
  title,
  slug,
  description,
  image
}`;

/**
 * Creates a collection service using Sanity
 * @param config - Configuration object with currency
 * @returns The collection service implementation
 */
export const createCollectionService = (config: { currency?: string } = {}): CollectionService => {
  return {
    async getCollectionDetails(
      slug: string,
      options: { limit?: number; offset?: number } = {}
    ): Promise<CollectionDetails> {
      try {
        const client = getSanityClient();
        const { limit = 20, offset = 0 } = options;

        // Fetch category
        const category = await client.fetch(categoryQuery, { slug });

        if (!category) {
          throw new Error(`Category with slug "${slug}" not found`);
        }

        // Fetch products in category
        const products = await client.fetch(productsByCategoryQuery, {
          categoryId: category._id,
          offset,
          limit: offset + limit,
        });

        // Transform products
        const transformedProducts = products.map((product: any) => ({
          ...product,
          price: toTaxedPrice(product.price),
          compareAtPrice: product.compareAtPrice ? toTaxedPrice(product.compareAtPrice) : undefined,
          images: product.images?.map((img: any) => toImage(img)).filter(Boolean) || [],
        }));

        return {
          category: {
            ...category,
            image: toImage(category.image),
          },
          products: transformedProducts,
          total: transformedProducts.length, // In a real implementation, you'd need a count query
        };
      } catch (error) {
        console.error('Error fetching collection details from Sanity:', error);
        throw new Error(`Failed to fetch collection details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    async getCategories(): Promise<Category[]> {
      try {
        const client = getSanityClient();
        const categories = await client.fetch(categoriesQuery);

        return categories.map((category: any) => ({
          ...category,
          image: toImage(category.image),
        }));
      } catch (error) {
        console.error('Error fetching categories from Sanity:', error);
        throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  };
};