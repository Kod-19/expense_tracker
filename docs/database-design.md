# Database Design

The project uses PostgreSQL for application data and Supabase Auth for user authentication.

## Database approach

The app separates authentication from app data:

- Supabase Auth handles user login and session management
- PostgreSQL stores business data such as profiles and categories

## Table: profiles

This table stores the user profile information.

### Columns

- `id` — unique user ID, linked to the Supabase auth user
- `full_name` — the user's full name
- `created_at` — when the profile was created
- `updated_at` — when the profile was last updated

### Purpose

This table keeps basic user identity information separate from the auth system.

## Table: categories

This table stores income and expense categories created by each user.

### Columns

- `id` — unique category ID
- `user_id` — the user who owns the category
- `name` — category name such as Food or Salary
- `type` — category type, either `income` or `expense`
- `created_at` — when the category was created

### Purpose

Categories help organize a user's money activity by type.

## Design notes

- Each category belongs to one user.
- A user can create many categories.
- Category names are simple text values.
- The system validates that category type is either `income` or `expense`.

## Future expansion

This database design can be extended later with tables for:

- transactions
- budgets
- recurring expenses
- monthly summaries
- reports

## Summary

The database is currently designed to support the core personal finance foundation: user identity and money category management.
