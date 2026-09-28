# Expense Tracker

Expense Tracker is a simple full-stack web app for managing personal money activity. It helps users create an account, sign in, view their profile, and organize spending and income categories.

## What this project does

This app is built to help a person:

- create a personal account
- log in securely
- keep a profile with their name
- add and manage categories such as food, rent, salary, or savings
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
- health checks for the API and database

The frontend is still a basic starter and does not yet contain the full dashboard and expense flow.

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

The frontend usually runs on:

- http://localhost:5173

The backend usually runs on:

- http://localhost:5000

## API overview

### Health checks

- `GET /` — API status page
- `GET /api/health` — checks if the API is running
- `GET /api/health/database` — checks database connectivity

### Authentication

- `POST /api/auth/register` — creates a new user and profile
- `POST /api/auth/login` — signs in and returns a session token

### Profile

- `GET /api/profile/me` — gets the logged-in user profile

### Categories

- `POST /api/categories` — creates a category for the logged-in user

## Example user flow

1. A new user signs up with email, password, and full name.
2. The server creates a Supabase auth user and inserts a profile record.
3. The user logs in and receives an access token.
4. The user creates categories like "Food" or "Salary".
5. The backend stores those categories under the logged-in user.

## Security notes

- API requests use Helmet for basic HTTP protection.
- CORS is enabled for the frontend origin.
- Authenticated routes require a bearer token.
- Passwords are handled through Supabase Auth.

## Future improvements

The app can grow to support:

- income and expense transactions
- monthly summaries and analytics
- budget limits
- charts and reports
- editing and deleting records
- better dashboard UI

## Documentation

The project docs in the `docs/` folder explain the requirements, scope, API behavior, database design, and user stories in more detail.
