import type { SupabaseConfig } from '../client';
import type { Logger } from '../../types';

export type TokenRefreshInfra = (params: {
  refreshToken: string;
}) => Promise<
  | { success: true; data: { refreshToken: string } }
  | { success: false; errors: Array<{ code: string; message?: string }> }
>;

type SupabaseAuthConfig = {
  logger: Logger;
  supabase: SupabaseConfig;
};

export const supabaseTokenRefreshInfra =
  ({ supabase, logger }: SupabaseAuthConfig): TokenRefreshInfra =>
  async ({ refreshToken }) => {
    try {
      const { createSupabaseClient } = await import('../client');
      const client = createSupabaseClient(supabase);
      const { data, error } = await client.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session?.access_token) {
        logger.error("Supabase token refresh failed", { error });
        return {
          success: false,
          errors: [
            {
              code: "TOKEN_REFRESH_ERROR",
              message: error?.message,
            },
          ],
        };
      }

      return { success: true, data: { refreshToken: data.session.access_token } };
    } catch (error) {
      logger.error("Supabase token refresh failed", { error });
      return {
        success: false,
        errors: [
          {
            code: "TOKEN_REFRESH_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
    }
  };