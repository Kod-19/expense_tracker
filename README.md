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
