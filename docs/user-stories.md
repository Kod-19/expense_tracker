# User Stories

These stories describe the main user needs for the app.

## 1. Account creation

As a new user, I want to create an account so I can start tracking my money.

Acceptance criteria:

- the user enters an email, password, and name
- the account is created successfully
- the app stores the profile information

## 2. Login

As a returning user, I want to sign in so I can access my information securely.

Acceptance criteria:

- the user provides valid email and password
- the app returns a valid session token
- protected routes work for the logged-in user

## 3. View profile

As a logged-in user, I want to view my profile so I can confirm my account details.

Acceptance criteria:

- the user can fetch their profile data
- the response contains the correct user information

## 4. Add categories

As a user, I want to create categories like Food or Salary so I can organize my expenses and income.

Acceptance criteria:

- the user submits a category name and type
- the type is either `income` or `expense`
- the category is saved under the logged-in user

## 5. Check system health

As a developer, I want API and database health checks so I can confirm the app is running correctly.

Acceptance criteria:

- the API returns a healthy status
- the database check confirms the connection is working

## 6. Future user goals

As a user, I want to eventually see my monthly budget and spending summaries so I can manage my money better.

This is a future improvement, not part of the current MVP.
