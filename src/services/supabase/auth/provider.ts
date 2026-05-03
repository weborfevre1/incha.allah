import type { SupabaseConfig } from '../client';
import type { Logger } from '../../types';
import { supabaseTokenRefreshInfra } from './token-refresh-infra';
import { supabaseAccountRegisterInfra } from './account-register-infra';
import { supabaseConfirmAccountInfra } from './confirm-account-infra';
import { supabasePasswordSetInfra } from './password-set-infra';
import { supabaseRequestPasswordResetInfra } from './request-password-reset-infra';

export type AuthService = {
  tokenRefresh: (params: { refreshToken: string }) => Promise<
    | { success: true; data: { refreshToken: string } }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
  accountRegister: (params: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<
    | { success: true; data: { user: { id: string; email: string } } }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
  confirmAccount: (params: { token: string }) => Promise<
    | { success: true; data: { user: { id: string; email: string } } }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
  passwordSet: (params: { token: string; password: string }) => Promise<
    | { success: true; data: { user: { id: string; email: string } } }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
  requestPasswordReset: (params: { email: string }) => Promise<
    | { success: true; data: null }
    | { success: false; errors: Array<{ code: string; message?: string }> }
  >;
};

type SupabaseAuthServiceConfig = {
  logger: Logger;
  supabase: SupabaseConfig;
};

export const createSupabaseAuthService = (
  config: SupabaseAuthServiceConfig,
): AuthService => ({
  tokenRefresh: supabaseTokenRefreshInfra(config),
  accountRegister: supabaseAccountRegisterInfra(config),
  confirmAccount: supabaseConfirmAccountInfra(config),
  passwordSet: supabasePasswordSetInfra(config),
  requestPasswordReset: supabaseRequestPasswordResetInfra(config),
});