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

## Table: transactions

The transaction table stores income and expense records owned by Supabase Auth users. A transaction references one category by `category_id`; the API returns its category name by joining the user's category record.

### Columns

- `id` — generated UUID transaction identifier
- `user_id` — owner, linked to `auth.users.id`
- `category_id` — optional linked category; set to null if the category is deleted
- `type` — either `income` or `expense`
- `amount` — positive amount in GHS
- `description` — short transaction description
- `date` — date the activity occurred
- `method` — optional payment method
- `notes` — optional notes
- `created_at` and `updated_at` — record timestamps

Each transaction belongs to one user. The API scopes reads, updates, and deletes to the authenticated user. Migration `001_transactions.sql` preserves existing transaction columns/data and adds optional `method` and `notes` fields.

## Table: budgets

The budgets table stores category spending limits for an individual calendar month.

### Columns

- `id` — generated budget identifier
- `user_id` — owner, linked to `auth.users.id`
- `category_id` — the user's expense category
- `month` — first calendar day of the budget month
- `amount` — positive monthly spending limit in GHS
- `created_at` and `updated_at` — record timestamps

Each user can have one budget per expense category per month. The API calculates spending from matching expense transactions in that month. The migration uses the existing category-linked budget schema.

## Design notes

- Each category belongs to one user.
- A user can create many categories.
- Category names are simple text values.
- The system validates that category type is either `income` or `expense`.

## Future expansion

This database design can be extended later with tables for:

- recurring expenses
- monthly summaries
- reports

## Summary

The database supports user profiles, categories, and the income/expense records used by transaction management and dashboard summaries.
