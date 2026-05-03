import {
  createCMSPageService,
  createSearchService,
  createCollectionService,
  createStoreService,
  createCMSMenuService,
  type CMSPageService,
  type SearchService,
  type CollectionService,
  type StoreService,
  type CMSMenuService,
} from './index';

export interface ServiceRegistry {
  cmsPage: CMSPageService;
  search: SearchService;
  collection: CollectionService;
  store: StoreService;
  cmsMenu: CMSMenuService;
}

/**
 * Creates and returns a service registry with all Sanity services initialized
 * @returns The service registry with all services
 */
export const createServiceRegistry = (): ServiceRegistry => {
  const currency = 'USD'; // You can make this configurable

  return {
    cmsPage: createCMSPageService(),
    search: createSearchService({ currency }),
    collection: createCollectionService({ currency }),
    store: createStoreService({ currency }),
    cmsMenu: createCMSMenuService(),
  };
};

// Export a singleton instance
export const services = createServiceRegistry();