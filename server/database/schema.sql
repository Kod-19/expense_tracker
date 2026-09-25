-- =========================================
-- EXPENSE TRACKER DATABASE SCHEMA
-- =========================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey
        FOREIGN KEY (id)
        REFERENCES auth.users(id)
);


-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL
        CHECK (type IN ('income', 'expense')),
    created_at timestamp with time zone DEFAULT now(),

    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
);


-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    category_id uuid,
    type text NOT NULL
        CHECK (type IN ('income', 'expense')),
    amount numeric NOT NULL
        CHECK (amount > 0),
    description text,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id),

    CONSTRAINT transactions_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES public.categories(id)
);


-- BUDGETS
CREATE TABLE IF NOT EXISTS public.budgets (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    category_id uuid NOT NULL,
    amount numeric NOT NULL
        CHECK (amount > 0),
    month date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    CONSTRAINT budgets_pkey PRIMARY KEY (id),
    CONSTRAINT budgets_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id),

    CONSTRAINT budgets_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES public.categories(id)
);


-- AI INSIGHTS
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    type text NOT NULL
        CHECK (
            type IN (
                'monthly_summary',
                'anomaly',
                'forecast',
                'category_insight',
                'budget_warning'
            )
        ),
    title text NOT NULL,
    content text NOT NULL,
    metadata jsonb,
    period_start date,
    period_end date,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),

    CONSTRAINT ai_insights_pkey PRIMARY KEY (id),
    CONSTRAINT ai_insights_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
);