import type { SupabaseConfig } from '../client';
import type { Logger } from '../../types';

export type AccountRegisterInfra = (params: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) => Promise<
  | { success: true; data: { user: { id: string; email: string } } }
  | { success: false; errors: Array<{ code: string; message?: string }> }
>;

type SupabaseAuthConfig = {
  logger: Logger;
  supabase: SupabaseConfig;
};

export const supabaseAccountRegisterInfra =
  ({ supabase, logger }: SupabaseAuthConfig): AccountRegisterInfra =>
  async ({ email, password, firstName, lastName }) => {
    try {
      const { createSupabaseClient } = await import('../client');
      const client = createSupabaseClient(supabase);
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error || !data.user) {
        logger.error("Supabase account register failed", { error });
        return {
          success: false,
          errors: [
            {
              code: "ACCOUNT_REGISTER_ERROR",
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
      logger.error("Supabase account register failed", { error });
      return {
        success: false,
        errors: [
          {
            code: "ACCOUNT_REGISTER_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
    }
  };