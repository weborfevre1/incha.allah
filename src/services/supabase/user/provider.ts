import type { SupabaseConfig, SupabaseAdminConfig } from '../client';
import type { Logger } from '../../types';
import { getSanityClient, toImage } from '../../lib/sanity-helpers';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  checkoutIds: string[];
  metadata: Record<string, any>;
};

export type Order = {
  id: string;
  number: string;
  created: string;
  status: 'UNCONFIRMED' | 'UNFULFILLED' | 'FULFILLED' | 'CANCELED' | 'RETURNED';
  fulfillments: any[];
  total: {
    amount: number;
    currency: string;
  };
  lines: Array<{
    id: string;
    productName: string;
    quantity: number;
    totalPrice: {
      amount: number;
      currency: string;
    };
    thumbnail: {
      url: string;
      alt: string;
    } | null;
    variant: { selectionAttributes: any[] };
    variantName: string;
  }>;
};

export type AccountInput = {
  firstName?: string;
  lastName?: string;
};

type OrderRow = {
  id: string;
  status: string | null;
  total_amount: number | null;
  created_at: string;
  order_items?: Array<{
    id: string;
    product_id: string;
    quantity: number | null;
    price_snapshot: number | null;
    total: number | null;
  }>;
};

type SanityProduct = {
  _id: string;
  title?: string | null;
  images?: Array<{
    asset?: { url?: string | null } | null;
    alt?: string | null;
  }> | null;
};

const mapOrderStatus = (status?: string | null): Order["status"] => {
  switch (status) {
    case "paid":
      return "UNFULFILLED";
    case "failed":
      return "UNCONFIRMED";
    case "canceled":
      return "CANCELED";
    case "refunded":
      return "RETURNED";
    case "processing":
      return "UNFULFILLED";
    case "shipped":
    case "delivered":
      return "FULFILLED";
    case "cancelled":
      return "CANCELED";
    case "pending":
    default:
      return "UNCONFIRMED";
  }
};

const fetchSanityProductsByIds = async (
  sanityConfig: any,
  ids: string[],
) => {
  if (!ids.length) {
    return new Map<string, SanityProduct>();
  }

  const client = getSanityClient(sanityConfig);
  const products = await client.fetch<SanityProduct[]>(
    `*[_type == "product" && _id in $ids]{ _id, title, images[]{asset->{url}, alt} }`,
    { ids },
  );

  return new Map(products.map((product) => [product._id, product]));
};

export type UserService = {
  userGet: (params: { accessToken?: string }) => Promise<
    | { success: true; data: User | null }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
  ordersGet: (params: { accessToken?: string }) => Promise<
    | { success: true; data: Order[] }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
  accountUpdate: (params: { accessToken?: string; accountInput: AccountInput }) => Promise<
    | { success: true; data: User }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
  passwordChange: (params: { accessToken?: string; newPassword: string }) => Promise<
    | { success: true; data: boolean }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
};

type SupabaseUserServiceConfig = {
  currency: string;
  logger: Logger;
  sanity: any;
  supabase: SupabaseConfig;
  supabaseAdmin?: SupabaseAdminConfig;
};

const supabaseUserGetInfra =
  ({ supabase, logger }: SupabaseUserServiceConfig) =>
  async ({ accessToken }: { accessToken?: string }) => {
    if (!accessToken) {
      return { success: true, data: null };
    }

    try {
      const { createSupabaseClient } = await import('../client');
      const client = createSupabaseClient(supabase);
      const { data, error } = await client.auth.getUser(accessToken);

      if (error || !data.user) {
        logger.error("Supabase user get failed", { error });
        return { success: true, data: null };
      }

      const firstName = (data.user.user_metadata?.first_name as string) ?? "";
      const lastName = (data.user.user_metadata?.last_name as string) ?? "";

      return {
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email ?? "",
          firstName,
          lastName,
          checkoutIds: [],
          metadata: {},
        },
      };
    } catch (error) {
      logger.error("Supabase user get failed", { error });
      return {
        success: false,
        errors: [{ code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Unknown error" }],
      };
    }
  };

const supabaseOrdersGetInfra =
  ({ supabase, sanity, currency, logger }: SupabaseUserServiceConfig) =>
  async ({ accessToken }: { accessToken?: string }) => {
    if (!accessToken) {
      return { success: true, data: [] };
    }

    try {
      const { createSupabaseClient } = await import('../client');
      const client = createSupabaseClient(supabase, accessToken);
      const { data: userData, error: userError } =
        await client.auth.getUser(accessToken);

      if (userError || !userData.user) {
        logger.error("Supabase user get failed", { error: userError });
        return { success: true, data: [] };
      }

      const { data, error } = await client
        .from("orders")
        .select(
          "id,status,total_amount,created_at,order_items(id,product_id,quantity,price_snapshot,total)",
        )
        .eq("customer_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Supabase orders fetch failed", { error });
        return {
          success: false,
          errors: [{ code: "HTTP_ERROR", message: error.message }],
        };
      }

      const orders = (data ?? []) as OrderRow[];
      const productIds = orders
        .flatMap((order) => order.order_items ?? [])
        .map((item) => item.product_id)
        .filter(Boolean);

      const productMap = await fetchSanityProductsByIds(sanity, productIds);

      const results: Order[] = orders.map((order) => ({
        id: order.id,
        number: order.id,
        created: order.created_at,
        status: mapOrderStatus(order.status),
        fulfillments: [],
        total: {
          amount: order.total_amount ?? 0,
          currency,
        },
        lines: (order.order_items ?? []).map((line) => {
          const product = productMap.get(line.product_id);
          const image = toImage(product?.images?.[0]);

          return {
            id: line.id,
            productName: product?.title ?? "",
            quantity: line.quantity ?? 0,
            totalPrice: {
              amount:
                line.total ?? (line.price_snapshot ?? 0) * (line.quantity ?? 0),
              currency,
            },
            thumbnail: image
              ? {
                  url: image.url,
                  alt: image.alt,
                }
              : null,
            variant: { selectionAttributes: [] },
            variantName: "",
          };
        }),
      }));

      return { success: true, data: results };
    } catch (error) {
      logger.error("Supabase orders fetch failed", { error });
      return {
        success: false,
        errors: [{ code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Unknown error" }],
      };
    }
  };

const supabasePasswordChangeInfra =
  ({ supabase, supabaseAdmin, logger }: SupabaseUserServiceConfig) =>
  async ({
    accessToken,
    newPassword,
  }: {
    accessToken?: string;
    newPassword: string;
  }) => {
    if (!accessToken) {
      return {
        success: false,
        errors: [{ code: "PASSWORD_CHANGE_ERROR" }],
      };
    }

    try {
      const { createSupabaseClient, createSupabaseAdminClient } = await import('../client');
      const client = createSupabaseClient(supabase);
      const { data, error } = await client.auth.getUser(accessToken);

      if (error || !data.user) {
        return {
          success: false,
          errors: [{ code: "PASSWORD_CHANGE_ERROR" }],
        };
      }

      if (supabaseAdmin) {
        const admin = createSupabaseAdminClient(supabaseAdmin);
        const { error: adminError } = await admin.auth.admin.updateUserById(
          data.user.id,
          { password: newPassword },
        );

        if (adminError) {
          return {
            success: false,
            errors: [{ code: "PASSWORD_CHANGE_ERROR" }],
          };
        }

        return { success: true, data: true };
      }

      return {
        success: false,
        errors: [{ code: "PASSWORD_CHANGE_ERROR" }],
      };
    } catch (error) {
      logger.error("Supabase password change failed", { error });
      return {
        success: false,
        errors: [{ code: "PASSWORD_CHANGE_ERROR", message: error instanceof Error ? error.message : "Unknown error" }],
      };
    }
  };

const supabaseAccountUpdateInfra =
  ({ supabase, supabaseAdmin, logger }: SupabaseUserServiceConfig) =>
  async ({
    accessToken,
    accountInput,
  }: {
    accessToken?: string;
    accountInput: AccountInput;
  }) => {
    if (!accessToken) {
      return {
        success: false,
        errors: [{ code: "ACCOUNT_UPDATE_ERROR" }],
      };
    }

    try {
      const { createSupabaseClient, createSupabaseAdminClient } = await import('../client');
      const client = createSupabaseClient(supabase);
      const { data, error } = await client.auth.getUser(accessToken);

      if (error || !data.user) {
        return {
          success: false,
          errors: [{ code: "ACCOUNT_UPDATE_ERROR" }],
        };
      }

      if (supabaseAdmin) {
        const admin = createSupabaseAdminClient(supabaseAdmin);
        const { error: adminError } = await admin.auth.admin.updateUserById(
          data.user.id,
          {
            user_metadata: {
              first_name: accountInput.firstName,
              last_name: accountInput.lastName,
            },
          },
        );

        if (adminError) {
          return {
            success: false,
            errors: [{ code: "ACCOUNT_UPDATE_ERROR" }],
          };
        }
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email ?? "",
        firstName: accountInput.firstName ?? "",
        lastName: accountInput.lastName ?? "",
        checkoutIds: [],
        metadata: {},
      };

      return { success: true, data: user };
    } catch (error) {
      logger.error("Supabase account update failed", { error });
      return {
        success: false,
        errors: [{ code: "ACCOUNT_UPDATE_ERROR", message: error instanceof Error ? error.message : "Unknown error" }],
      };
    }
  };

export const createSupabaseUserService = (
  config: SupabaseUserServiceConfig,
): UserService => ({
  userGet: supabaseUserGetInfra(config),
  ordersGet: supabaseOrdersGetInfra(config),
  accountUpdate: supabaseAccountUpdateInfra(config),
  passwordChange: supabasePasswordChangeInfra(config),
});