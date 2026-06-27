# Store Rating Platform

Full-stack solution for the intern coding challenge. It uses React for the frontend, Express for the backend, and PostgreSQL for persistence.

## Features

- Single login system with `ADMIN`, `USER`, and `OWNER` roles.
- Normal users can sign up, search stores by name/address, submit ratings from 1 to 5, and update previous ratings.
- Admins can create users and stores, view dashboard totals, filter/sort users and stores, and see owner ratings.
- Store owners can view their store average rating and the users who submitted ratings.
- Shared backend validations for name, email, address, password, role, and rating constraints.

## Project Structure

- `backend/`: Express API, PostgreSQL schema, seed script, auth, role-based routes.
- `frontend/`: Vite + React dashboard UI.
- `backend/src/schema.sql`: database tables, constraints, indexes, and relationships.

## Setup

1. Create a PostgreSQL database named `store_rating_platform`.

   With Docker, you can start one with:

```bash
docker compose up -d
```

2. Copy the backend env file:

```bash
cp backend/.env.example backend/.env
```

3. Update `backend/.env` if your PostgreSQL user/password is different.
4. Install dependencies:

```bash
npm install
npm run install:all
```

5. Seed the database:

```bash
npm run seed
```

6. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000/api`

## Demo Accounts

- Admin: `admin@stores.test` / `Admin@123`
- User: `user@stores.test` / `User@123`
- Owner: `owner@stores.test` / `Owner@123`

## Interview Explanation

I built the app around three clear layers. The React frontend handles screens for each role after login. The Express API owns business rules, authentication, validation, filtering, sorting, and authorization. PostgreSQL stores normalized users, stores, and ratings.

The database has three main tables:

- `users`: stores login identity, hashed password, profile fields, and role.
- `stores`: stores registered store details and optionally links to a store owner.
- `ratings`: stores each user's rating for a store with a unique `(user_id, store_id)` constraint, so the same user can update a rating instead of creating duplicates.

Authentication uses JWTs. On login/signup, the backend returns a token containing the user id and role. Protected routes use middleware to verify the token, then role middleware limits access to admin, user, or owner endpoints.

Ratings use an upsert query. When a normal user rates a store, the backend inserts the rating. If that user already rated the same store, PostgreSQL updates the existing row. Average ratings are calculated with SQL aggregation, which keeps the source of truth in the database.

Validation is enforced on the backend because frontend validation alone can be bypassed. The backend checks the challenge constraints: name length, address length, email format, password complexity, role values, and 1-5 ratings.

## Useful Commands

```bash
npm run test --prefix backend
npm run build --prefix frontend
```
