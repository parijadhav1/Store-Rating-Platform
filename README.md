# Store Rating Platform

A full-stack web application built as part of the Full Stack Developer Coding Challenge. The application allows users to register, log in, rate stores, and provides separate dashboards for Admin, User, and Store Owner roles.

---

## Features

### User

* Sign up and log in
* Search stores by name or address
* View store ratings
* Submit ratings (1–5)
* Update previously submitted ratings
* Change password

### Admin

* Log in securely
* View dashboard statistics
* Create and manage users
* Create and manage stores
* View all registered users and stores
* Filter and sort users and stores

### Store Owner

* Log in securely
* View assigned store details
* View average store rating
* View ratings submitted by users

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

---

## Project Structure

```
Store Rating Platform/
│
├── backend/
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

Make sure the following are installed on your system:

* Node.js (v18 or later recommended)
* npm
* PostgreSQL

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/parijadhav1/Store-Rating-Platform
```

```bash
cd Store-Rating-Platform
```

---

### 2. Install dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd ../frontend
npm install
```

---

### 3. Configure Environment Variables

Create a file named `.env` inside the **backend** folder.

Example:

```env
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/store_rating_platform
JWT_SECRET=your-secret-key
FRONTEND_ORIGIN=http://localhost:5174
```

---

### 4. Create the Database

Create a PostgreSQL database named:

```
store_rating_platform
```

Run the database schema and seed files if required.

---

### 5. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs on:

```
http://localhost:4000
```

---

### 6. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```
http://localhost:5174
```

---

## Demo Accounts

### Admin

Email

```
admin@stores.test
```

Password

```
Admin@123
```

---

### User

Email

```
user@stores.test
```

Password

```
User@123
```

---

### Store Owner

Email

```
owner@stores.test
```

Password

```
Owner@123
```

---

## API

Base URL

```
http://localhost:4000/api
```
---

## Author

Parineeta Jadhav

---

## Notes

* Role-based authentication is implemented for Admin, User, and Store Owner.
* Passwords are securely stored using hashing.
* JWT is used for user authentication.
* Users can update their existing ratings instead of creating duplicate entries.
* Store ratings are calculated automatically based on user submissions.
