# Expense Tracker

A full-stack expense tracking application built with React, Express, and PostgreSQL.

## Features

- **User Authentication**: Secure registration and login with JWT
- **Expense Tracking**: Add, update, and delete transactions
- **Categories**: Manage transaction categories
- **Budgeting**: Set and monitor budget limits
- **Dashboard**: View spending overview and analytics
- **Responsive UI**: Built with React and TailwindCSS

## Tech Stack

- **Frontend**: React 19, Vite, React Router, TailwindCSS, Axios, React Query
- **Backend**: Node.js, Express 5, PostgreSQL
- **Authentication**: JWT, bcryptjs
- **API**: RESTful API with CORS support

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone and install dependencies:**
   ```bash
   cd expense_tracker
   npm install
   ```

2. **Set up environment variables:**
   - Copy `server/.example.env` to `server/.env`
   - Fill in your configuration:
     ```
     PORT=5000
     DATABASE_URL=your_postgres_database_url
     JWT_SECRET=your_jwt_secret_key
     ```

## Running the Application

### Start the Server
```bash
node server/app.js
```
- Server runs on `http://localhost:5000`
- Ensure PostgreSQL is running and `DATABASE_URL` is configured

### Start the Client
Open a new terminal and run:
```bash
npm run dev
```
- Client runs on `http://localhost:5173`

### Access the Application
Open your browser and go to `http://localhost:5173`

## Project Structure

```
expense_tracker/
├── client/
│   ├── src/
│   │   ├── components/     # React components (Navbar, Forms)
│   │   ├── pages/          # Page components (Login, Dashboard, etc.)
│   │   ├── api/            # API client configuration
│   │   └── App.jsx         # Main app component
│   └── index.html
├── server/
│   ├── api/                # API client utilities
│   ├── controllers/        # Request handlers
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── db/                 # Database pool
│   ├── context/            # React context
│   ├── app.js              # Express server
│   └── .env                # Environment variables
└── package.json            # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Add new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

*All transaction and category endpoints require authentication*

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development Notes

- The server uses CommonJS modules (`require/module.exports`)
- The client uses ES modules (`import/export`)
- All API requests include JWT token via Authorization header
- Protected routes redirect unauthenticated users to login

## Troubleshooting

- **Server won't start**: Check if PostgreSQL is running and `DATABASE_URL` is correct
- **Login fails**: Verify `JWT_SECRET` is set in `.env`
- **API calls fail**: Ensure server is running on port 5000 and client is connecting to `http://localhost:5000/api`
- **CORS errors**: Server has CORS enabled for all origins

## Next Steps

- Set up database schema and migrations
- Add input validation and sanitization
- Implement refresh token rotation
- Add comprehensive error logging
- Write unit and integration tests