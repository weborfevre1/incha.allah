import { getSanityClient } from '../lib/sanity';
import { toImage, toTaxedPrice } from '../lib/sanity-helpers';

export interface ProductVariant {
  _id: string;
  title: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  inventory?: number;
  options?: Record<string, string>;
}

export interface ProductDetails {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: ProductVariant[];
  tags?: string[];
  categories?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface StoreService {
  getProductDetails(slug: string): Promise<ProductDetails | null>;
  getProductAvailability(productId: string): Promise<{ available: boolean; inventory?: number }>;
}

/**
 * GROQ query to fetch product details by slug
 */
const productQuery = `*[_type == "product" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  description,
  price,
  compareAtPrice,
  images,
  variants,
  tags,
  categories,
  seo
}`;

/**
 * Transforms a Sanity product to the ProductDetails interface
 */
const toProductDetails = (product: any): ProductDetails => {
  return {
    ...product,
    price: toTaxedPrice(product.price),
    compareAtPrice: product.compareAtPrice ? toTaxedPrice(product.compareAtPrice) : undefined,
    images: product.images?.map((img: any) => toImage(img)).filter(Boolean) || [],
    variants: product.variants?.map((variant: any) => ({
      ...variant,
      price: toTaxedPrice(variant.price),
      compareAtPrice: variant.compareAtPrice ? toTaxedPrice(variant.compareAtPrice) : undefined,
    })) || [],
  };
};

/**
 * Creates a store service using Sanity
 * @param config - Configuration object with currency
 * @returns The store service implementation
 */
export const createStoreService = (config: { currency?: string } = {}): StoreService => {
  return {
    async getProductDetails(slug: string): Promise<ProductDetails | null> {
      try {
        const client = getSanityClient();
        const product = await client.fetch(productQuery, { slug });

        if (!product) {
          console.warn(`Product with slug "${slug}" not found`);
          return null;
        }

        return toProductDetails(product);
      } catch (error) {
        console.error('Error fetching product details from Sanity:', error);
        throw new Error(`Failed to fetch product details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    async getProductAvailability(productId: string): Promise<{ available: boolean; inventory?: number }> {
      try {
        const client = getSanityClient();

        // Fetch product to check availability
        const product = await client.fetch(`*[_id == $productId][0]{ variants }`, { productId });

        if (!product) {
          return { available: false };
        }

        // Check if any variant has inventory
        const hasInventory = product.variants?.some((variant: any) =>
          variant.inventory !== undefined && variant.inventory > 0
        );

        // For simplicity, return available if we have variants or assume available
        return {
          available: hasInventory !== false,
          inventory: product.variants?.[0]?.inventory,
        };
      } catch (error) {
        console.error('Error checking product availability:', error);
        return { available: false };
      }
    },
  };
};