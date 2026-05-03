import type { SupabaseConfig } from '../client';
import type { Logger } from '../../types';

export type RequestPasswordResetInfra = (params: {
  email: string;
}) => Promise<
  | { success: true; data: null }
  | { success: false; errors: Array<{ code: string; message?: string }> }
>;

type SupabaseAuthConfig = {
  logger: Logger;
  supabase: SupabaseConfig;
};

export const supabaseRequestPasswordResetInfra =
  ({ supabase, logger }: SupabaseAuthConfig): RequestPasswordResetInfra =>
  async ({ email }) => {
    try {
      const { createSupabaseClient } = await import('../client');
      const client = createSupabaseClient(supabase);
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        logger.error("Supabase request password reset failed", { error });
        return {
          success: false,
          errors: [
            {
              code: "REQUEST_PASSWORD_RESET_ERROR",
              message: error.message,
            },
          ],
        };
      }

      return { success: true, data: null };
    } catch (error) {
      logger.error("Supabase request password reset failed", { error });
      return {
        success: false,
        errors: [
          {
            code: "REQUEST_PASSWORD_RESET_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
    }
  };