# API Specification

This project uses a REST API built with Express. The API accepts and returns JSON data.

## Base URL

```text
http://localhost:5000
```

## General response format

Successful requests usually return:

```json
{
  "success": true,
  "message": "Request completed successfully"
}
```

Error responses usually return:

```json
{
  "success": false,
  "message": "A clear error message"
}
```

## Routes

### 1. Root route

- Method: GET
- URL: `/`
- Purpose: returns a basic API status message

Example response:

```json
{
  "success": true,
  "message": "Expense Tracker API is running. Use /api/health to check the server.",
  "frontend": "http://localhost:5173"
}
```

### 2. Health check

- Method: GET
- URL: `/api/health`
- Purpose: checks whether the API is running

### 3. Database health check

- Method: GET
- URL: `/api/health/database`
- Purpose: checks whether the PostgreSQL database connection is successful

### 4. Register user

- Method: POST
- URL: `/api/auth/register`
- Body:

```json
{
  "email": "user@example.com",
  "password": "strongpassword123",
  "full_name": "Jane Doe"
}
```

- Purpose: creates a new user account and profile

### 5. Login user

- Method: POST
- URL: `/api/auth/login`
- Body:

```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```

- Purpose: logs in the user and returns a session token

### 6. Refresh session

- Method: POST
- URL: `/api/auth/refresh`
- Body:

```json
{
  "refresh_token": "supabase_refresh_token"
}
```

- Purpose: refreshes the Supabase session and returns a new access token

### 7. Get current auth user

- Method: GET
- URL: `/api/auth/me`
- Auth required: Yes
- Purpose: returns the current authenticated Supabase user

### 8. Logout user

- Method: POST
- URL: `/api/auth/logout`
- Auth required: Yes
- Purpose: revokes the current Supabase session
- Note: requires `SUPABASE_SERVICE_ROLE_KEY` on the backend

### 9. Get current user profile

- Method: GET
- URL: `/api/profile/me`
- Auth required: Yes
- Purpose: returns the current logged-in user's profile information

### 10. Create category

- Method: POST
- URL: `/api/categories`
- Auth required: Yes
- Body:

```json
{
  "name": "Groceries",
  "type": "expense"
}
```

- Purpose: creates a new spending or income category for the logged-in user

Other authenticated category endpoints:

- `GET /api/categories` — lists categories belonging to the logged-in user
- `PUT /api/categories/:id` — updates a category belonging to the logged-in user
- `DELETE /api/categories/:id` — deletes a category belonging to the logged-in user

Category create and update requests use the same `{ "name": "Groceries", "type": "expense" }` body. The type must be `income` or `expense`. Deleting a category does not change the saved category labels on existing transactions.

### 11. Transactions

All transaction endpoints require a bearer access token. Transaction records are scoped to the authenticated user.

- `GET /api/transactions` — lists the user's transactions, newest activity date first
- `POST /api/transactions` — creates a transaction
- `PUT /api/transactions/:id` — updates a transaction
- `DELETE /api/transactions/:id` — deletes a transaction

Create and update requests use the following JSON fields:

```json
{
  "name": "Grocery shopping",
  "category": "Food",
  "type": "expense",
  "amount": 156.4,
  "date": "2026-10-04",
  "method": "Debit card",
  "notes": "Weekly groceries"
}
```

`method` and `notes` are optional. `amount` must be greater than zero, `type` must be `income` or `expense`, and `date` must be a valid `YYYY-MM-DD` date. Apply `server/migrations/001_transactions.sql` to the database before calling these endpoints.

### 12. Budgets

All budget endpoints require a bearer access token and are scoped to the authenticated user.

- `GET /api/budgets?month=YYYY-MM` — lists budgets for the selected month with calculated spent and remaining amounts
- `POST /api/budgets` — creates a monthly category budget
- `PUT /api/budgets/:id` — updates a budget
- `DELETE /api/budgets/:id` — deletes a budget

Create and update requests use:

```json
{
  "category": "Food",
  "limit": 600,
  "month": "2026-10"
}
```

The category must be an expense category owned by the user. Each category can have one budget per month. Apply `server/migrations/002_budgets.sql` before using these endpoints.

## Notes

- The backend uses bearer-token authentication for protected routes.
- `type` values for categories are currently limited to `income` or `expense`.
- Requests without required data or valid tokens return clear error messages.
