# WatchMoni

WatchMoni is a simple full-stack web app for managing personal money activity. It helps users create an account, sign in, view their profile, organize categories, and manage income and expense transactions.

## What this project does

This app is built to help a person:

- create a personal account
- log in securely
- keep a profile with their name
- add and manage categories such as food, rent, salary, or savings
- create, review, search, filter, edit, and delete transactions
- check that the backend and database are working

## Tech stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database and auth

- PostgreSQL
- Supabase Auth
- Supabase client

## Project structure

```text
expense-tracker/
├── client/                # React frontend app
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend API
│   ├── src/
│   ├── package.json
│   └── .env.example (if added later)
├── docs/                  # project documentation
├── README.md
├── .gitignore
└── .prettierrc
```

## Current app status

The project is in an early stage. The backend already includes:

- user registration
- login with Supabase auth
- profile retrieval
- category creation
- authenticated transaction CRUD
- health checks for the API and database

The frontend includes the protected transaction workflow for recording and managing income and expenses. Dashboard totals and chart data are still sample content.

## Local setup

### 1. Install frontend dependencies

```bash
cd client
npm install
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Add environment variables

Create a `.env` file inside the `server` folder with values like:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=your_postgres_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Create `client/.env` from `client/.env.example` and set:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

The Supabase URL and publishable/anon key are intended for browser use. Never put the Supabase service-role key in the client environment.

### 4. Start the apps

Run the frontend:

```bash
cd client
npm run dev
```

Run the backend:

```bash
cd server
npm run dev
```

Apply all transaction and budget table migrations to the configured PostgreSQL/Supabase database:

```bash
cd server
npm run db:setup
```

Check the backend's PostgreSQL connection from the terminal:

```bash
cd server
npm run db:check
```

The frontend usually runs on:

- http://localhost:5173

The backend usually runs on:

- http://localhost:5000

## Enable Google sign-in with Supabase

The login and registration pages include Google buttons. Supabase Auth handles the Google OAuth flow using PKCE and creates an account the first time someone signs in; the callback then saves the Supabase session in the app and creates or updates that user's WatchMoni profile. The callback also accepts an implicit-flow token response to complete an older in-flight login.

1. In the [Google Cloud Console](https://console.cloud.google.com/), choose or create a project and configure the OAuth consent screen. Use **External** for consumer accounts; while the app is in testing mode, add the Google accounts that need to test it.
2. Create an OAuth client ID with application type **Web application**.
3. In Supabase, open **Authentication → Providers → Google** and enable Google. Copy the client ID and client secret from Google Cloud into the provider settings and save.
4. In the Supabase Google provider settings, copy the Supabase callback URL (it looks like `https://<project-ref>.supabase.co/auth/v1/callback`). In Google Cloud, add that exact URL under the OAuth client's **Authorized redirect URIs**.
5. In Supabase, open **Authentication → URL Configuration**. Set the **Site URL** to your frontend origin, for example `http://localhost:5173`, and add each app callback URL to **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `https://your-deployed-frontend.example/auth/callback`
6. Put the Supabase project URL and publishable/anon key in `client/.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart the Vite development server after editing environment variables.
7. Open `/login` or `/register`, choose the Google button, and authorize with a Google account. For production, replace the example deployed URL in both Supabase's Redirect URLs and the frontend environment with the real HTTPS frontend URL.

The Google **Authorized redirect URI** is Supabase's `/auth/v1/callback` URL; the Supabase **Redirect URLs** are the app's `/auth/callback` URLs. They are different steps in the OAuth return path. OAuth credentials belong in Supabase's provider settings, not in frontend environment variables. Only the publishable/anon key should be exposed to the browser.

## Deploying the backend to Vercel

The Express application is exported from `server/src/app.js`, which Vercel detects and runs as a serverless Function. `server/src/server.js` remains the local development entry point and starts the same app with `app.listen()`.

To deploy the API separately from the Vite frontend:

1. Import this repository as a Vercel project and set its **Root Directory** to `server`.
2. Leave the detected Express framework and build settings at their defaults. The server project uses `server/package.json`.
3. Add these environment variables in the Vercel project settings:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLIENT_URL` set to the exact deployed frontend origin, such as `https://your-frontend.vercel.app`.
4. Deploy and check `https://your-backend.vercel.app/api/health`.
5. Set `VITE_API_BASE_URL` in the frontend Vercel project to the backend origin, without a trailing slash, then redeploy the frontend.
6. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the frontend Vercel project, then redeploy. Also add the production frontend's `/auth/callback` URL to Supabase **Authentication → URL Configuration → Redirect URLs**.

Use production database credentials only in the backend project's environment settings. Do not expose `DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` as frontend environment variables. Apply reviewed database migrations to the production database separately before using the deployed app.

## API overview

### Health checks

- `GET /` — API status page
- `GET /api/health` — checks if the API is running
- `GET /api/health/database` — checks database connectivity

### Authentication

- `POST /api/auth/register` — creates a new user and profile
- `POST /api/auth/login` — signs in and returns a session token
- `POST /api/auth/refresh` — refreshes a Supabase session
- `GET /api/auth/me` — returns the authenticated Supabase user
- `POST /api/auth/logout` — revokes the current Supabase session

### Profile

- `GET /api/profile/me` — gets the logged-in user profile

### Categories

- `GET /api/categories` — lists categories belonging to the logged-in user
- `POST /api/categories` — creates a category for the logged-in user
- `PUT /api/categories/:id` — updates a category belonging to the logged-in user
- `DELETE /api/categories/:id` — deletes a category belonging to the logged-in user

### Transactions

- `GET /api/transactions` — lists transactions belonging to the logged-in user
- `POST /api/transactions` — creates a transaction
- `PUT /api/transactions/:id` — updates a transaction
- `DELETE /api/transactions/:id` — deletes a transaction

### Budgets

- `GET /api/budgets?month=YYYY-MM` — lists monthly category limits with actual spending and remaining amounts
- `POST /api/budgets` — creates a monthly budget
- `PUT /api/budgets/:id` — updates a budget
- `DELETE /api/budgets/:id` — deletes a budget

Before using these endpoints, run `npm run db:setup` from `server/` to apply the SQL migrations in `server/migrations/` to the configured PostgreSQL/Supabase database. The command is safe to rerun.

## Example user flow

1. A new user signs up with email, password, and full name.
2. The server creates a Supabase auth user and inserts a profile record.
3. The user logs in and receives an access token.
4. The user creates categories like "Food" or "Salary".
5. The user records, filters, edits, and deletes income and expense transactions.
6. The backend stores those records under the logged-in user.

## Security notes

- API requests use Helmet for basic HTTP protection.
- CORS is enabled for the frontend origin.
- Authenticated routes require a bearer token.
- Passwords are handled through Supabase Auth.

## Future improvements

The app can grow to support:

- monthly summaries and analytics
- budget limits
- charts and reports
- editing and deleting records
- monthly reports and richer financial analytics

## Documentation

The project docs in the `docs/` folder explain the requirements, scope, API behavior, database design, and user stories in more detail.
