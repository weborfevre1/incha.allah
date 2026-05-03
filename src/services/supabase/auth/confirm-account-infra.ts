import type { SupabaseConfig } from '../client';
import type { Logger } from '../../types';

export type ConfirmAccountInfra = (params: {
  token: string;
}) => Promise<
  | { success: true; data: { user: { id: string; email: string } } }
  | { success: false; errors: Array<{ code: string; message?: string }> }
>;

type SupabaseAuthConfig = {
  logger: Logger;
  supabase: SupabaseConfig;
};

export const supabaseConfirmAccountInfra =
  ({ supabase, logger }: SupabaseAuthConfig): ConfirmAccountInfra =>
  async ({ token }) => {
    try {
      const { createSupabaseClient } = await import('../client');
      const client = createSupabaseClient(supabase);
      const { data, error } = await client.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      if (error || !data.user) {
        logger.error("Supabase confirm account failed", { error });
        return {
          success: false,
          errors: [
            {
              code: "CONFIRM_ACCOUNT_ERROR",
              message: error?.message,
            },
          ],
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email ?? "",
          },
        },
      };
    } catch (error) {
      logger.error("Supabase confirm account failed", { error });
      return {
        success: false,
        errors: [
          {
            code: "CONFIRM_ACCOUNT_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
    }
  };