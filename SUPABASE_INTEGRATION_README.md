# Supabase Integration

This project now includes a complete Supabase integration copied from the storefront project. The integration provides authentication, user management, order tracking, and profile services.

## Setup

1. **Environment Variables**: Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2. **Database Schema**: Set up the following tables in your Supabase database:

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT, -- References Sanity product ID
  quantity INTEGER,
  price_snapshot DECIMAL(10,2),
  total DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Carts Table
```sql
CREATE TABLE carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **Row Level Security (RLS)**: Enable RLS on all tables and create appropriate policies.

## Services

### Authentication Service
```typescript
import { createSupabaseServiceRegistry } from '@/services/supabase';

const services = createSupabaseServiceRegistry({
  logger: logger,
  supabase: { url: '...', anonKey: '...' },
});

// Sign up
const result = await services.auth.accountRegister({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Sign in (using existing supabase client)
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Token refresh
const refreshResult = await services.auth.tokenRefresh({
  refreshToken: 'refresh-token-here'
});
```

### User Service
```typescript
// Get current user
const userResult = await services.user.userGet({
  accessToken: 'user-access-token'
});

// Get user orders
const ordersResult = await services.user.ordersGet({
  accessToken: 'user-access-token'
});

// Update account
const updateResult = await services.user.accountUpdate({
  accessToken: 'user-access-token',
  accountInput: {
    firstName: 'Jane',
    lastName: 'Smith'
  }
});

// Change password
const passwordResult = await services.user.passwordChange({
  accessToken: 'user-access-token',
  newPassword: 'newpassword123'
});
```

## React Hooks

The existing hooks in `src/hooks/useSupabase.ts` work with the new infrastructure. You can also create new hooks using the service registry:

```typescript
import { createSupabaseServiceRegistry } from '@/services/supabase';
import { logger } from '@/lib/logger';

const services = createSupabaseServiceRegistry({
  logger,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  sanity: {
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,
    apiVersion: import.meta.env.VITE_SANITY_API_VERSION
  }
});

// Use in components
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const result = await services.user.userGet({ accessToken: userId });
      if (result.success) {
        setUser(result.data);
      }
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>Welcome {user?.firstName}!</div>;
}
```

## File Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client (existing)
│   └── logger.ts            # Simple logger utility
├── services/
│   └── supabase/
│       ├── index.ts         # Service registry
│       ├── client.ts        # Supabase client factories
│       ├── auth/
│       │   ├── provider.ts  # Auth service
│       │   ├── token-refresh-infra.ts
│       │   ├── account-register-infra.ts
│       │   ├── confirm-account-infra.ts
│       │   ├── password-set-infra.ts
│       │   └── request-password-reset-infra.ts
│       └── user/
│           └── provider.ts  # User service
└── hooks/
    └── useSupabase.ts       # React hooks (existing, enhanced)
```

## Integration with Sanity

The user service integrates with Sanity to fetch product information for orders. Make sure your Sanity configuration is set up correctly.

## Migration Notes

- The existing `supabase-service.ts` contains basic CRUD operations that can be used alongside the new infrastructure
- The new services follow a more robust error handling pattern with Result types
- Authentication still uses the existing Supabase client for simplicity
- User management now includes order history with Sanity product integration

## Error Handling

All services return results in the format:
```typescript
{
  success: boolean;
  data?: T;
  errors?: Array<{ code: string; message?: string }>;
}
```

Check `result.success` before accessing `result.data`, and handle errors appropriately in your UI.