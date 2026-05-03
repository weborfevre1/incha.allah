# Sanity CMS Integration

This project now includes a complete Sanity CMS integration copied from the storefront project. The integration provides services for content management, product search, collections, and navigation.

## Setup

1. **Environment Variables**: Copy `.env.local.example` to `.env.local` and fill in your Sanity credentials:

```bash
VITE_SANITY_PROJECT_ID=your-project-id
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2025-01-01
VITE_SANITY_API_TOKEN=your-read-write-token
VITE_SANITY_USE_CDN=false
```

2. **Install Dependencies**: Make sure you have the Sanity client installed:

```bash
npm install @sanity/client
```

## Services

The integration provides the following services:

### CMS Page Service
Fetch static pages from Sanity.

```typescript
import { services } from '@/services/registry';

const page = await services.cmsPage.getPage('about-us');
```

### Search Service
Search products with filters and sorting.

```typescript
import { services } from '@/services/registry';

const results = await services.search.searchProducts('laptop', {
  category: 'electronics',
  minPrice: 500,
  maxPrice: 2000
}, {
  limit: 20,
  sortBy: 'price_asc'
});
```

### Collection Service
Fetch categories and products within categories.

```typescript
import { services } from '@/services/registry';

// Get all categories
const categories = await services.collection.getCategories();

// Get collection details
const collection = await services.collection.getCollectionDetails('electronics');
```

### Store Service
Fetch detailed product information.

```typescript
import { services } from '@/services/registry';

const product = await services.store.getProductDetails('macbook-pro');
const availability = await services.store.getProductAvailability(productId);
```

### CMS Menu Service
Fetch navigation menus (currently supports navbar with categories).

```typescript
import { services } from '@/services/registry';

const menu = await services.cmsMenu.getMenu('navbar');
```

## React Hooks

Convenient React hooks are provided for easy integration:

```typescript
import {
  useProductSearch,
  useProductDetails,
  useCategories,
  useCollectionDetails,
  useCMSPage,
  useNavigationMenu
} from '@/hooks';

function ProductList() {
  const { results, loading, error, search } = useProductSearch();

  useEffect(() => {
    search('laptop');
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {results?.products.map(product => (
        <div key={product._id}>{product.title}</div>
      ))}
    </div>
  );
}
```

## Data Types

All TypeScript interfaces are exported from the services:

```typescript
import type {
  Product,
  Category,
  SearchResult,
  CMSPage,
  Menu
} from '@/services';
```

## Sanity Schema

Your Sanity studio should include these content types:

- `page` - Static pages with title, slug, content, and SEO
- `product` - Products with pricing, images, variants, categories, tags
- `category` - Product categories with title, slug, description, image

## File Structure

```
src/
├── lib/
│   ├── sanity.ts          # Sanity client configuration
│   └── sanity-helpers.ts  # Data transformation utilities
├── services/
│   ├── index.ts           # Service exports
│   ├── registry.ts        # Service registry singleton
│   ├── cms-page.ts        # CMS page service
│   ├── search.ts          # Product search service
│   ├── collection.ts      # Category/collection service
│   ├── store.ts           # Product details service
│   └── cms-menu.ts        # Navigation menu service
└── hooks/
    ├── sanity.ts          # React hooks for Sanity services
    └── index.ts           # Hook exports
```

## Migration from Existing Sanity Hooks

If you were using the existing `useSanity*` hooks, you can gradually migrate to the new service-based approach. The new services provide more consistent error handling and better TypeScript support.