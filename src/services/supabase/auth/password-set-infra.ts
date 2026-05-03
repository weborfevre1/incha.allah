import type { SupabaseConfig } from '../client';
import type { Logger } from '../../types';

export type PasswordSetInfra = (params: {
  token: string;
  password: string;
}) => Promise<
  | { success: true; data: { user: { id: string; email: string } } }
  | { success: false; errors: Array<{ code: string; message?: string }> }
>;

type SupabaseAuthConfig = {
  logger: Logger;
  supabase: SupabaseConfig;
};

export const supabasePasswordSetInfra =
  ({ supabase, logger }: SupabaseAuthConfig): PasswordSetInfra =>
  async ({ token, password }) => {
    try {
      const { createSupabaseClient } = await import('../client');
      const client = createSupabaseClient(supabase);
      const { data, error } = await client.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });

      if (error || !data.user) {
        logger.error("Supabase password set failed", { error });
        return {
          success: false,
          errors: [
            {
              code: "PASSWORD_SET_ERROR",
              message: error?.message,
            },
          ],
        };
      }

      // Update password
      const { error: updateError } = await client.auth.updateUser({
        password,
      });

      if (updateError) {
        logger.error("Supabase password update failed", { error: updateError });
        return {
          success: false,
          errors: [
            {
              code: "PASSWORD_SET_ERROR",
              message: updateError.message,
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
      logger.error("Supabase password set failed", { error });
      return {
        success: false,
        errors: [
          {
            code: "PASSWORD_SET_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
    }
  };