# Bizmind Frontend (React)

This is a minimal React frontend scaffold to connect to the Rails API (JWT-based auth).

Quick start

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run the dev server:

```bash
npm start
```

3. Configure API URL (if your Rails server is not on localhost:3000): edit `.env` and update `REACT_APP_API_URL`.

How it works

- On successful sign-in / sign-up the Rails API should return a JWT in the `Authorization` response header (e.g. `Authorization: Bearer <token>`).
- The React app stores that token in `localStorage` and attaches it to subsequent requests in the `Authorization` header.

Files created

- `src/services/api.js` - axios instance + interceptors (attaches token to requests and stores token returned from responses).
- `src/pages/Login.js` - login form that posts to the Rails sign-in endpoint.
- `src/pages/Signup.js` - signup form example.
- `src/pages/Dashboard.js` - protected page that fetches user data.
- `src/components/PrivateRoute.js` - a simple private-route wrapper using react-router.

Notes

- This scaffold assumes Devise/Devise-JWT style endpoints under `/api/v1`. Adjust endpoints in `api.js` and pages if your routes differ.
- For security, consider more secure storage than `localStorage` (httpOnly cookies) for production.

