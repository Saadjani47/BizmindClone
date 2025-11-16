# BackendReadme — apis_bizmind_ai

This document explains how the backend Rails API (located at the repository root) works. It walks through architecture, important gems, models, migrations, controllers, routes, initializers, environment configuration, and the full JWT/token lifecycle used for authentication and authorization. It also notes important behavior, edge cases, and suggested improvements.

## Table of contents

- Project overview
- Key gems and why they're used
- Database & migrations (what each migration does)
 - Database & migrations (what each migration does)
- Models (fields, relations, responsibilities)
- Authentication: Devise + Devise-JWT + custom handling
  - JWT payload format used in this app
  - Token issuance (login/signup/omniauth)
  - Token revocation / denylist
  - Custom JwtAuthenticatable concern
- Controllers (what each API controller does and why)
- Routes (how endpoints are structured)
- Initializers and configuration (Devise, CORS)
- Environments (development.rb highlights)
- API examples and what each endpoint returns/does
- Security considerations and recommended improvements
- Quick reference: files to look at

---

## Project overview

This Rails app is an API-only backend that provides account management and user preferences endpoints consumed by a frontend (the repository contains a `frontend/` folder). The authentication system is built on Devise and extended for JSON Web Token (JWT) issuance and revocation using `devise-jwt` and a denylist approach.

High-level responsibilities:
- Manage users (signup, login, logout, password reset)
- Allow OAuth sign-in with Google (verify Google token server-side, create/find local user, issue local JWT)
- Store and expose a small `UserPreference` resource (theme/language)
- Protect endpoints via token-based authentication

The API groups endpoints under `/api/v1`.

## Key gems and why they're used

- devise: Standard Rails authentication framework providing user model integrations, password hashing, recoverable, validatable, etc.
- devise-jwt: Integrates JWT into Devise, enabling token dispatch on login/signup and revocation strategies.
- omniauth / omniauth-google-oauth2 / google-apis-oauth2_v2: Allow Google sign-in; this app verifies tokens server-side using Google's `oauth2` API rather than relying purely on frontend claims.
- rack-cors: Allows the frontend (likely served at a different origin) to call this API and receive the Authorization header.
- pg: PostgreSQL adapter for ActiveRecord.

## Database & migrations (what each migration does)

Files (in `db/migrate`) and summary:

- `20251107193425_devise_create_users.rb`
  - Creates `users` table with columns used by Devise:
    - `email` (string, not null, default "")
    - `encrypted_password` (string, not null, default "")
    - `reset_password_token`, `reset_password_sent_at` (recoverable)
    - `remember_created_at`
    - timestamps
  - Adds unique indexes on `email` and `reset_password_token`.

- `20251107193518_add_jti_to_users.rb`
  - Adds `jti` (string) column to `users` with an index.
  - `jti` stands for JWT ID: a per-token unique identifier; used to track tokens issued to a user.

- `20251107194314_create_jwt_denylists.rb`
  - Creates `jwt_denylists` table with `jti` (string) and timestamps.
  - Adds an index on `jti` for efficient revocation checks.
  - This table is used by the Devise JWT denylist revocation strategy to store revoked token `jti`s.

- `20251107201609_create_user_preferences.rb`
  - Creates `user_preferences` table with columns:
    - `theme` (string)
    - `language` (string)
    - `user_id` (foreign key, non-null) via `t.belongs_to :user, null: false, foreign_key: true`
    - timestamps
  - Allows storing per-user UI preferences.

- `20251107210000_add_exp_to_jwt_denylists.rb`
  - Adds an `exp` (datetime) column to `jwt_denylists` with an index.
  - Storing `exp` lets the app optionally garbage-collect old denylist entries after expiry to keep the table small.

- `20251116082549_create_user_profiles.rb`
  - Creates `user_profiles` table with a 1:1 relation to `users` and fields for a professional profile:
    - `first_name` (string, required), `last_name` (string), `full_name` (string, required)
    - `headline`, `job_title`, `company`, `location`, `website`, `linkedin_url`
    - `summary` (text)
    - `skills` (jsonb, default: []) for an array of skills
  - Adds unique index on `user_id` (enforces at most one profile per user).
  - Adds index on `full_name` and a GIN index on `skills` for efficient lookups.

- `20251116082706_create_active_storage_tables.active_storage.rb`
  - Adds standard Active Storage tables (`active_storage_blobs`, `active_storage_attachments`, `active_storage_variant_records`).
  - Required for file attachments such as profile images.

Why these exist and how they work together:
- `devise-jwt` issues tokens (JWTs) on login/signup. Each token includes a `jti` (unique id) so the system can identify individual tokens.
- To revoke tokens (logout), the app writes the token `jti` to `jwt_denylists`. The middleware or custom logic checks if a token `jti` exists in that table and refuses requests if it does.
- The `exp` field lets the app remove denylist records after the token lifetime has passed.

## Models (fields, relations, responsibilities)

### `User` (app/models/user.rb)
- Included modules via Devise: `:database_authenticatable, :registerable, :recoverable, :validatable, :jwt_authenticatable`
  - `jwt_revocation_strategy: JwtDenylist` — instructs Devise-JWT to use the `JwtDenylist` model to check and record revoked tokens.
- Associations: `has_one :user_preference, dependent: :destroy`
 - Associations: `has_one :user_preference, dependent: :destroy`
 - Associations: `has_one :user_profile, dependent: :destroy`
- Class method `self.from_omniauth(auth_hash)`
  - Finds or creates a user from auth hash (used by the Google callback controller).
  - Creates a user with a random password if none exists (suitable for OAuth-only signin).

Notes:
- `jti` column was added to users — not strictly required when using an external denylist model, but useful if you want to track a 'current token id' per user (this app indexes it, possibly used in other logic).

### `JwtDenylist` (app/models/jwt_denylist.rb)
- Includes `Devise::JWT::RevocationStrategies::Denylist` which implements the API Devise-JWT expects for a denylist store.
- Table `jwt_denylists` stores `jti` and `exp` (after migrations).

### `UserPreference` (app/models/user_preference.rb)
- Fields `theme`, `language`, and `user_id`.
- `belongs_to :user`.
- Simple storage object surfaced under `/api/v1/user_preference` routes.

### `UserProfile` (app/models/user_profile.rb)
- Belongs to `User` (1:1) and validates presence of `first_name` and `full_name`; enforces uniqueness of `user_id` (one profile per user).
- Stores `skills` as a jsonb array. Provides optional professional metadata fields like `headline`, `job_title`, `company`, etc.
- Attachment: `has_one_attached :profile_image` (via Active Storage) for an avatar/photo.
- URL validation for `website` and `linkedin_url`.
- Convenience methods:
  - `profile_image_url` exposes a fully qualified URL for the attached image (uses `rails_blob_url`).
  - `as_json` includes `profile_image_url` in serialized output.

## Authentication: Devise + Devise-JWT + custom handling

High level flow:
- User signs up (POST /api/v1/signup) -> `Api::V1::Users::RegistrationsController#create`
  - Creates a user in DB via Devise's helper methods but avoids session-based sign-in (API). Instead, the controller issues a JWT and returns it in the Authorization header and JSON body.
- User logs in (POST /api/v1/login) -> `Api::V1::Users::SessionsController#create`
  - Validates password and issues a JWT (same format) in Authorization header and JSON response.
- User logs out (DELETE /api/v1/logout) -> `Api::V1::Users::SessionsController#destroy`
  - Reads incoming token from Authorization header, decodes it, extracts `jti`, and creates a `JwtDenylist` entry for that `jti` (and optionally `exp`). This effectively revokes that token.

Where tokens are created:
- Registration and session controllers call `jwt_for(user)` helper which either uses `Warden::JWT::Auth::Token.from_user(user)` (if available) or builds a JWT via ::JWT.encode with a payload that includes:
  - `sub` — subject claim containing user id as string
  - `jti` — generated via `SecureRandom.uuid`
  - `exp` — expiration timestamp (e.g., `1.hour.from_now.to_i` set by controllers when not using warden helper)
  - `scp` — scope claim set to `'api_v1_user'` in this app

Devise initializer config (important bits in `config/initializers/devise.rb`):
- `config.jwt.secret` — secret key for signing tokens. Pulled from `Rails.application.credentials.devise_jwt_secret_key`, `Rails.application.secret_key_base`, or ENV['SECRET_KEY_BASE'].
- `config.jwt.algorithm = 'HS256'` — ensures a deterministic algorithm for both encoding and decoding.
- `config.jwt.dispatch_requests` — regex list used by `devise-jwt` middleware to automatically dispatch tokens for certain requests. In this app it includes POST to `/api/v1/login` and `/api/v1/signup`.
- `config.jwt.revocation_requests` — includes DELETE to `/api/v1/logout` so the middleware can revoke or the controller can handle revocation.

Token verification and current user resolution:
- The repo has a `JwtAuthenticatable` concern (`app/controllers/concerns/jwt_authenticatable.rb`) with a method `authenticate_user!` that:
  - Reads `Authorization` header (or `params[:token]`)
  - Decodes the token using the same secret and `HS256` algorithm
  - Finds `User` by `id` from the payload `sub` claim and sets `@current_user`.
  - Returns 401 if token missing/invalid or user not found.
- This is a simple, manual approach for controllers that want to bypass Devise/Warden or need custom logic. It's suitable for API-only controllers where you prefer explicit header parsing.

Revocation details:
- When logging out, the `SessionsController#destroy` decodes the incoming token, extracts `jti`, and creates a `JwtDenylist` entry. The `Devise::JWT` middleware/strategy (or custom checks) consults that table to refuse tokens whose `jti` appears there.
- `jwt_denylists.exp` exists to store the token expiry; a background job or rake task can delete denylist rows where `exp` < now to keep the table from growing indefinitely.

JWT payload example used by the controllers (when encoding manually):
```
{ sub: "123", jti: "some-uuid", exp: 1.hour.from_now.to_i, scp: 'api_v1_user' }
```

Claims meaning:
- `sub`: identifies the subject — user ID (string).
- `jti`: JWT ID — unique per token; required for per-token revocation.
- `exp`: expiration timestamp (UNIX seconds) — required to stop accepting tokens after expiry.
- `scp`: a custom scope claim used by the app to indicate token purpose.

## Controllers (what each API controller does and why)

The API controllers live under `app/controllers/api/v1`.

Key controllers and responsibilities:

- `Api::V1::Users::RegistrationsController` (inherits from `Devise::RegistrationsController`):
  - Overrides `create` to build the resource from params, `save` it, and issue a JWT to the client (instead of relying on session cookies). The token is returned in both the response body and `Authorization` header.

- `Api::V1::Users::SessionsController` (inherits from `Devise::SessionsController`):
  - `create`: authenticates credentials, issues a JWT and returns user data.
  - `destroy`: parses Authorization header, decodes token, and writes its `jti` to `JwtDenylist` to revoke it. Returns success response.
  - Contains `jwt_for(user)` helper that uses Warden helper if available, otherwise constructs JWT manually.

- `Api::V1::Users::PasswordsController` (inherits from `Devise::PasswordsController`):
  - `create`: sends reset password instructions; deliberately returns a generic success message when email not found so clients can't enumerate users.
  - `edit`: validates reset token and returns associated email.
  - `update`: resets the password using Devise's `reset_password_by_token` and returns appropriate messages.

- `Api::V1::OmniauthCallbacksController`:
  - `google` action accepts a Google access token in the request body (`params[:token]`).
  - It verifies the token server-side using Google API client (`Google::Apis::Oauth2V2::Oauth2Service#get_tokeninfo`).
  - On success, it finds or creates a `User` with `User.from_omniauth` and issues a local JWT (so our backend controls session lifetime and revocation). The token is set in `Authorization` header and a success JSON body is returned.

- `Api::V1::UserPreferencesController` (routes map `resource :user_preference` to controller `user_preferences`):
  - Standard CRUD actions for a single resource per user (show/create/update/destroy). Expected to be protected with some authentication (`JwtAuthenticatable` or Devise helpers depending on implementation).

- `Api::V1::UserProfilesController`:
  - Endpoints for managing the authenticated user's professional profile at `/api/v1/user_profile`.
  - Actions: `show`, `create`, and `update` (1:1 profile per user, no `destroy`).
  - Accepts optional `profile_image` file upload (Active Storage); when provided, the image is attached/updated.
  - Normalizes incoming fields (`first_name`, `last_name`, `full_name`, `headline`, `job_title`, `company`, `location`), cleans up `summary`, basic URL normalization for `website` and `linkedin_url`, and titleizes/uniqs `skills`.
  - Requires authentication via `before_action :authenticate_user!` (from `JwtAuthenticatable`).

Custom concerns/middlewares:
- `JwtAuthenticatable` (concern) provides `authenticate_user!` and `current_user` for controllers that need a simple token-based auth flow without Warden middleware.

## Routes (how endpoints are structured)

Key route definitions (in `config/routes.rb`):
- Devise routes under `/api/v1` and path names altered to API-friendly endpoints:
  - POST `/api/v1/login` -> sessions#create
  - DELETE `/api/v1/logout` -> sessions#destroy
  - POST `/api/v1/signup` -> registrations#create
  - POST `/api/v1/forgot_password` (path name `password`) -> passwords#create (depending on Devise path configuration)

- POST `/api/v1/auth/google` -> `omniauth_callbacks#google` (expects a Google access token and returns our JWT)

- Resource: `resource :user_preference` mapped to `Api::V1::UserPreferencesController` with `show, create, update, destroy`.
 - Resource: `resource :user_profile` mapped to `Api::V1::UserProfilesController` with `show, create, update`.

Everything is namespaced under `api/v1`, so controllers live at `app/controllers/api/v1/*`.

## Initializers and configuration

### `config/initializers/devise.rb`
- Configures Devise mailer, ORM integration, and importantly the `jwt` configuration block.
- The JWT block sets secret, algorithm, dispatch and revocation requests.
- `config.skip_session_storage = [:http_auth, :params_auth]` is set so that Devise doesn't rely on sessions for API requests.
- `config.navigational_formats = []` makes Devise error handling return JSON (not HTML redirects) in API contexts.

Important notes:
- JWT secret is pulled robustly from `Rails.application.credentials.devise_jwt_secret_key` or `secret_key_base`. In production, make sure `credentials` or environment variables are set securely.

### `config/initializers/cors.rb`
- Uses `Rack::Cors` to allow frontend origins (localhost:3000, 127.0.0.1:3000, 5173) to call the API and exposes the `Authorization` header (so the frontend can read the header if the token is set in it by server responses).
- Allows credentials; be careful with `credentials: true` as CORS combined with cookies requires matching server/frontend origins and secure settings in production.

### Active Storage configuration
- `config/environments/development.rb` sets `config.active_storage.service = :local`.
- `config/storage.yml` defines `local` and `test` Disk services. For production, configure S3/GCS/Azure and set credentials.
- URL generation: `UserProfile#profile_image_url` uses `rails_blob_url`, which needs default URL options set. In development, this repo sets:
  - `Rails.application.routes.default_url_options[:host] = "localhost"` and `[:port] = 3000` in `development.rb`.

## Environments (development.rb highlights)

Key settings in `config/environments/development.rb`:
- `config.enable_reloading = true` and `config.eager_load = false` — makes development reload code without server restart.
- `config.action_mailer.default_url_options` set to `localhost:3000` — used by Devise email links (password reset links).
- `config.active_record.migration_error = :page_load` — raises an error if migrations are pending.
- `config.action_controller.raise_on_missing_callback_actions = true` — helpful to catch controller callback/only/except mistakes.

These are standard Rails dev settings, helpful for Devise and mailer behavior locally.

## API examples and what each endpoint returns/does

1) Signup
- Endpoint: POST `/api/v1/signup`
- Body: { user: { email: "a@b.com", password: "secret", password_confirmation: "secret" } }
- Behavior: Creates user, issues JWT. Returns JSON with `user`, `id`, and `token`. Also includes `Authorization: Bearer <token>` header.

2) Login
- Endpoint: POST `/api/v1/login`
- Body: { user: { email: "a@b.com", password: "secret" } }
- Behavior: Validates creds, issues JWT. Returns JSON with `user`, `id`, and `token`. Also includes `Authorization: Bearer <token>` header.

3) Logout
- Endpoint: DELETE `/api/v1/logout`
- Header: `Authorization: Bearer <token>`
- Behavior: Parses token, decodes to extract `jti` and creates `JwtDenylist` entry (revokes token). Returns success JSON.

4) Password reset
- POST `/api/v1/password` with `email` -> sends reset instructions (generic message returned to prevent email enumeration).
- GET `/api/v1/password/edit?reset_password_token=...` -> verifies token validity.
- PUT/PATCH `/api/v1/password` -> resets password using token.

5) Google OAuth (Omniauth callback endpoint)
- Endpoint: POST `/api/v1/auth/google`
- Body: { token: "<google_access_token>" }
- Behavior: Verifies token with Google servers, finds/creates local user, then issues a local JWT and returns success JSON and `Authorization` header.

6) User preference
- GET/POST/PUT/DELETE `/api/v1/user_preference`
- Behavior: Show/create/update/destroy user preference for the current authenticated user. Controllers should use token-based auth to identify the user.

7) User profile
- GET `/api/v1/user_profile`
  - Returns the current user's profile JSON (or `null` if not created yet). Includes `profile_image_url` when an image is attached.
- POST `/api/v1/user_profile`
  - Creates the profile for the current user. Accepts JSON or multipart form data.
  - Body (JSON example):
    `{ "first_name": "Jane", "last_name": "Doe", "headline": "Senior Engineer", "skills": ["ruby", "rails"] }`
  - Multipart example (with image): set `Content-Type: multipart/form-data` and include `profile_image` file field.
- PUT/PATCH `/api/v1/user_profile`
  - Updates fields and optionally replaces `profile_image`.
  - Any provided `website`/`linkedin_url` will be normalized; `skills` will be deduped/titleized.

Permitted fields:
`first_name, last_name, full_name, headline, job_title, company, location, website, linkedin_url, summary, profile_image, skills: []`

Notes on uploads:
- When sending a `profile_image`, use multipart form data. Example with curl (simplified):
  - Headers: `Authorization: Bearer <token>`
  - `-F first_name=Jane -F last_name=Doe -F profile_image=@/path/to/photo.jpg`

## Token handling: lifecycle and checks (detailed)

Issuance:
- Controllers call `jwt_for(user)` which produces a JWT either via Warden helper or manual construction.
- When `devise-jwt` is used and `dispatch_requests` matches, the middleware may also dispatch tokens automatically.

Storage client-side:
- The server returns JWT in the Authorization header and sometimes in the JSON body as `token`. Frontend should store it in a safe place (ideally memory store or an httpOnly cookie set by server; localStorage has XSS risk). This project exposes it in header and body; choose frontend storage strategy carefully.

Usage server-side:
- Requests include header `Authorization: Bearer <token>`.
- The `JwtAuthenticatable` concern decodes and verifies token signature and `exp`. It uses same secret as encoding.
- After decoding, `sub` is used as user id. The app can then load the user.
- Additionally, the `devise-jwt` middleware or application code should check the denylist to ensure `jti` is not revoked.

Revocation:
- Logout uses the `jti` from the token to add to `jwt_denylists`.
- A revoked `jti` causes subsequent requests to be rejected.
- Expired tokens naturally fail verification after `exp` time.

Garbage collection of denylist:
- As `jwt_denylists` accumulates `jti` rows, add a periodic job (cron or ActiveJob) to delete rows whose `exp` < now. This prevents the table from growing indefinitely.

Maintenance task:
- A rake task is provided at `lib/tasks/jwt_denylist_gc.rake`:
  - Run with `bin/rake jwt:gc` to delete expired denylist rows (`exp < now`).

## Security considerations and recommended improvements

- Secret management: Ensure `Rails.application.credentials.devise_jwt_secret_key` or `ENV['SECRET_KEY_BASE']` is set in production. Do not fall back to hard-coded secrets.
- Token lifetime: Current controllers show example `exp: 1.hour.from_now`. Choose appropriate lifetimes and refresh token strategies for UX vs security tradeoffs.
- Refresh tokens: This app issues short-lived JWTs. Consider adding a refresh token mechanism (rotate, store hashed refresh token per user) if you need long sessions without forcing frequent logins.
- Storage on client: Avoid storing JWT in localStorage (XSS risk). Prefer httpOnly cookies (with CSRF protections) or secure memory stores.
- Revoke on password reset: When users reset passwords or change credentials, consider revoking existing tokens by writing to denylist for any outstanding JTIs.
- Rate limiting and brute force: Add request throttling (Rack::Attack) to slow down login attempts.
- Denylist cleanup: Implement a periodic task to remove denylist entries older than token expiry. Currently the migration added `exp`; use it.
- Validate Google tokens audience: When verifying Google token, ensure the token's `aud` matches your Google client id so tokens intended for another client can't be replayed.

## Quick reference: files to look at

- Models
  - `app/models/user.rb`
  - `app/models/jwt_denylist.rb`
  - `app/models/user_preference.rb`
  - `app/models/user_profile.rb`

- Controllers
  - `app/controllers/api/v1/users/sessions_controller.rb`
  - `app/controllers/api/v1/users/registrations_controller.rb`
  - `app/controllers/api/v1/users/passwords_controller.rb`
  - `app/controllers/api/v1/omniauth_callbacks_controller.rb`
  - `app/controllers/concerns/jwt_authenticatable.rb`
  - `app/controllers/api/v1/user_profiles_controller.rb`

- Routes: `config/routes.rb`
- Devise config: `config/initializers/devise.rb`
- CORS config: `config/initializers/cors.rb`
- Active Storage config: `config/storage.yml`, `config/environments/development.rb`
- Migrations: `db/migrate/*` (see migration filenames for details)
- Environment config: `config/environments/development.rb`

## Environment variables

- `FRONTEND_URL` — used for CORS and any cross-origin coordination. Example `.env`:
  - `FRONTEND_URL=http://localhost:5173`

Ensure secrets for JWT and mailer in production are set via Rails credentials or environment variables:
- `Rails.application.credentials.devise_jwt_secret_key` or `ENV["SECRET_KEY_BASE"]`
- `Rails.application.credentials.dig(:mailer, :sender)` or `ENV["DEFAULT_FROM_EMAIL"]`

## Next steps / small improvements you can apply now

- Add a small rake task or ActiveJob that cleans `JwtDenylist` rows where `exp < Time.current`.
- Add a test to ensure revoked tokens cannot access `user_preference` endpoints.
- Enforce `aud` and `iss` checks in Google token verification to prevent token replay across projects.
- Consider returning only `Authorization` header (and not the token in JSON body) to encourage safe storage patterns on frontend.

---

If you'd like, I can:
- Add the denylist GC rake task and a unit test for revocation.
- Produce an ERB template showing exact HTTP request/response examples for the frontend developer (curl and JS fetch examples).
- Expand any particular section with code pointers, sequence diagrams, or add a developer checklist for deploying secrets to production.

If you want me to create the GC task and tests now, tell me and I will add them and run the test suite.
