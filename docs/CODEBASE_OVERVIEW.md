## Capstone Insurance – Codebase Overview

This document explains what each major file and component does across the backend (Node/Express/MongoDB/Apollo GraphQL) and frontend (Angular + NgRx + Apollo). It also maps high‑level data flows, URLs, and roles.

### High-level Architecture
- Backend
  - REST API: Express under `/api/v1/*` with JWT auth and role guards
  - GraphQL API: Apollo Server at `/graphql` for auth (signup/login) and `me`
  - MongoDB via Mongoose models
  - Email (Nodemailer) and Cloudinary integrations
- Frontend
  - Angular standalone components
  - State via NgRx (auth, policy, customer, agent)
  - GraphQL (Apollo) for auth; REST for most business operations

---

## Backend

### `backend/src/server.js`
- Boots Express, loads CORS and JSON body parser.
- Registers REST routers:
  - `/api/v1/admin` → `admin.routes.js`
  - `/api/v1/customer` → `customer.route.js`
  - `/api/v1/agent` → `agent.routes.js`
- Public unauthenticated endpoint: `GET /public/policies` returns all `PolicyProduct`.
- Sets up Apollo Server at `/graphql` with `userTypeDefs` + `userResolvers`.
  - Context reads `Authorization: Bearer <token>`, validates JWT, and loads user for resolvers.
- Connects to MongoDB via `MONGO_URI`; on startup attempts to verify SMTP transporter.

### `backend/src/authMiddleware.js`
- `authMiddleware`: Validates `Authorization` Bearer token, loads `req.user` (without password). Rejects 401 if invalid/absent.
- `isAdmin` / `isAgent` / `isCustomer`: Role guards returning 403 if user role mismatch.

### Routes

#### `backend/src/routes/admin.routes.js`
- Applies `authMiddleware` and `isAdmin` to all routes.
- Policies: `POST /policies`, `GET /policies`, `PUT /policies/:policyId`, `DELETE /policies/:policyId`.
- Users/Agents: `GET /users`, `POST /agents` (create agent).
- Agent assignment: `POST /assign-agent`, `GET /agents/:agentId/customers`.
- Claims: `GET /claims`, `PUT /claims/:id/status`, `GET /agents/:agentId/claims`, analytics `GET /claims-analytics`.
- Audit logs: `GET /audit`; Summary dashboard: `GET /summary`.

#### `backend/src/routes/agent.routes.js`
- Applies `authMiddleware` then `isAgent` to all routes.
- Profile: `GET /profile`, `PUT /profile`.
- Customers: `GET /customers`, policies/claims per customer.
- Claims: `GET /claims`, `GET /claims/pending`, `GET /claims/:claimId`, `PUT /claims/:claimId/review`.
- Stats: `GET /stats`.

#### `backend/src/routes/customer.route.js`
- Applies `authMiddleware` to all routes.
- Policies: `GET /policies` (available with assigned agent info), purchase, list my policies, cancel.
- Claims: submit (with and without active policy), list, details, stats.
- Payments: `POST /payments`, `GET /payments/user`.
- Assignment check: `GET /agent-assignment` returns user’s assigned agent if any.

### Controllers

#### `backend/src/controllers/admin.controller.js`
- Policies CRUD with Cloudinary upload for images and AuditLog entries.
- `listUsers`: returns all users minus `passwordHash`.
- `createAgent`: creates agent with hashed password and logs action.
- Claims admin:
  - `listClaims`, `updateClaimStatus` (validates eligibility and amounts), `getAgentClaims`, `getClaimAnalytics`.
- Agent/customer relations: `assignAgentToCustomer`, `getAgentCustomers`.
- `listAuditLogs`: last 20 audit entries; `summary`: counts for users, agents, claims by status, policies.

#### `backend/src/controllers/agent.controller.js`
- Agent-centric views over their assigned customers:
  - Customers: `getMyCustomers`, `getCustomerPolicies`, `getCustomerClaims`.
  - Claims: `getMyCustomersClaims`, `getPendingClaims`, `getClaimDetails`, `reviewClaim` (approve/reject with validations).
  - Stats: `getMyClaimStats` (counts, sums, monthly aggregation).
  - Profile: `getMyProfile`, `updateMyProfile` with AuditLog.

#### `backend/src/controllers/customer.controller.js`
- Policies:
  - `getAvailablePolicies`: returns products augmented with assigned agent info of current user.
  - `buyPolicy`: validates inputs and today’s start date; creates `UserPolicy` and a `Payment` (simulated success), logs audit, sends confirmation email.
  - `getMyPolicies`, `cancelPolicy`.
- Claims:
  - `submitClaim`: requires assigned agent and active policy; validates inputs and dates; processes images (URL/base64/Cloudinary) and creates pending claim.
  - `submitClaimWithoutPolicy`: allows claim without active policy; flags claim accordingly.
  - `getMyClaims`, `getClaimDetails`, `getClaimStats` (single aggregation for performance).
- Payments:
  - `recordPayment`: validates method/amount, ensures active policy for product; creates `Payment` with unique reference and AuditLog.
  - `getUserPayments`: returns user payments with policy and policy instance details.
- Assignment: `checkAgentAssignment` returns boolean and agent info if set.

### Models

- `backend/src/models/User.js`
  - Fields: name, email (unique), passwordHash, role (`admin|customer|agent`), photo, address, assignedAgentId (self-ref to `User`), timestamps.

- `backend/src/models/PolicyProduct.js`
  - Product catalog: code (unique), title, description, premium, termMonths, minSumInsured, imageUrl.

- `backend/src/models/UserPolicy.js`
  - A user’s purchased policy: links `userId` and `policyProductId`, start/end dates, premiumPaid, status (`ACTIVE|PENDING|EXPIRED|CANCELLED`), nominee.

- `backend/src/models/Payment.js`
  - Payment for a policy instance: `userId`, `policyId` (product), `userPolicyId`, amount, method (`CREDIT_CARD|DEBIT_CARD|BANK_TRANSFER|PAYPAL`), unique `reference`, status (`PENDING|COMPLETED|FAILED|REFUNDED`), dates.
  - Pre-save hook clears card/upi fields and bumps `updatedAt`.

- `backend/src/models/Claim.js`
  - Insurance claims by user: link to `userId`, optional `userPolicyId` (for claims without active policy), incident details, `amountClaimed`, optional `approvedAmount`, `status` (`PENDING|APPROVED|REJECTED`), notes, decision metadata, priority/category, `policyType`, `isWithoutPolicy` flag.

- `backend/src/models/Auditlog.js`
  - Simple audit trail: action, actorId, arbitrary details, ip, timestamp.

### GraphQL

- `backend/src/graphql/userTypeDefs.js`
  - Types: `User`, `AuthPayload`; Inputs: `SignupInput`, `LoginInput`.
  - Queries: `users`, `user(_id)`, `me`.
  - Mutations: `signup`, `login`.

- `backend/src/graphql/userResolvers.js`
  - `signup`: only creates customer accounts; optional photo via Cloudinary; sends welcome email; returns JWT.
  - `login`: verifies password and returns JWT + user.
  - `me`: requires auth via server context.

### Config / Integrations

- `backend/src/config/cloudinary.js`: Loads Cloudinary credentials from env and configures v2 SDK.
- `backend/src/config/email.js`:
  - Creates a nodemailer transporter from env (SMTP_*). If missing, logs emails to console (dev mode).
  - `sendEmail` helper, `verifyEmailTransporter` at startup.
  - Email builders: `buildWelcomeEmail`, `buildPolicyPurchaseEmail`.

### Environment variables (backend)
- `MONGO_URI` – MongoDB connection string
- `JWT_SECRET` – used to sign/verify JWTs
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- `PORT` – server port (defaults to 4000 in code paths)

---

## Frontend (Angular)

### Bootstrapping / App Config

- `frontend/src/main.ts`: Bootstraps `App` with `appConfig`.
- `frontend/src/app/app.ts`: Root component with `RouterOutlet`; title signal.
- `frontend/src/app/app.config.ts`:
  - Provides Router (see `app.routes.ts`), HttpClient, Apollo client (GraphQL `http://localhost:4000/graphql`).
  - NgRx store slices: `auth`, `policy`, `users`, `customer`, `agent`.
  - Effects: `AuthEffects`, `PolicyEffects`, `UserEffects`, `CustomerEffects`, `AgentEffects`.
  - DevTools configuration.
  - APP_INITIALIZER via `AppInitializerService` (initial loading hooks).

### Routing

- `frontend/src/app/app.routes.ts`
  - Public: `''` and `/home` → Home; `/login`; `/signup`.
  - Admin (guarded by `AuthGuard` + `RoleGuard: admin`):
    - `/admin` root → `AdminDashboardComponent` with children:
      - `policy` → `AdminPolicyComponent` (create policy)
      - `policies` → `AdminPolicyList`
      - `view-users-agents` → `UsersAgents`
      - `create-agent` → `CreateAgent`
      - `audit-logs` → `AuditLogsComponent`
      - `summary` → `SummaryDashboardComponent`
  - Customer (guarded; role `customer`):
    - `/customer` root → `CustomerDashboardComponent` with children: `policies`, `claims`, `profile`.
  - Agent (guarded; role `agent`):
    - `/agent` root → `AgentDashbaord` with children: `customers`, `pending-claims`, `stats`, `profile`.
  - Fallback: `**` → `/home`.

### Guards

- `frontend/src/app/guards/auth.guard.ts`:
  - Waits until auth initialization completes, then allows if a user exists in store; otherwise redirects to `/login`.

- `frontend/src/app/guards/role.guard.ts`:
  - Waits for initialization; checks `route.data.role` vs user role; routes to role‑appropriate dashboard or login if mismatch.

### Services

- `frontend/src/app/services/auth.service.ts`
  - Apollo GraphQL for `signup`, `login`, `me` (validate token). Used by `AuthEffects`.

- `frontend/src/app/services/policy.service.ts`
  - Admin policy management via REST against `${environment.apiUrl}/admin/*`.
  - Also exposes `getPublicPolicies()` against `http://localhost:4000/public/policies` (no auth) for public browsing.

- `frontend/src/app/services/customer-policy.ts`
  - Customer façade for REST calls under `${environment.apiUrl}/customer/*` with JWT from localStorage.
  - Exposes: available policies, my policies, buy/cancel policy, submit claim (with/without policy), list claims, claim details, claim stats, check agent assignment.
  - Simple in‑memory cache for claims and stats (30s) to reduce requests.

- `frontend/src/app/services/agent.ts`
  - Agent façade for REST under `http://localhost:4000/api/v1/agent`.
  - Profile (get/update), my customers, their policies/claims, list all my customers’ claims, pending claims, claim details, review claims, and stats.

### State Management (NgRx)

- Auth slice (`store/auth/*`)
  - Actions: `signup/login/logout`, `initializeAuth`, success/failure variants.
  - Effects:
    - Call `AuthService` for GraphQL signup/login and token validation.
    - On success: store token, redirect to dashboard based on role.
    - On logout: remove token and hard redirect to `/login`.
    - On app init: try `me` with stored token; on failure, clear token.
  - Reducer: tracks `user`, `token`, `loading`, `error`. Starts in loading=true to await init.

- Customer slice (`store/customer/*`)
  - Actions for: available policies, my policies, buy/cancel, claims CRUD (submit, list, details), stats.
  - Effects: call `CustomerPolicy` for REST; handles reloading on success (e.g., after purchase/submission).
  - Reducer/State: arrays for `availablePolicies`, `myPolicies`, `myClaims`; `claimDetails`, `claimStats`, `lastPayment`, `loading`, `error`.

- Policy slice (`store/policy/*`)
  - Admin policy CRUD via `PolicyService`.
  - Effects: `createPolicy`, `loadPolicies`, `deletePolicy`, `updatePolicy` with error mapping; auto refresh list after create.
  - Selectors used by admin components.

### Components (by feature)

Admin
- `components/admin/admin-dashboard/*`: Admin landing/dashboard shell with router outlet for admin features.
- `components/admin/admin-policy/admin-policy.component.*`: Form to create policy products (validates fields, image type/size, displays preview, dispatches create, and reloads on success).
- `components/admin/admin-policy-list/*`: Lists policies; hooks into `policy` store to load/delete/update.
- `components/admin/users-agents/*`: Manage/view all users and agents.
- `components/admin/create-agent/*`: Create an agent account (calls admin route to create agent with hashed pwd on backend).
- `components/admin/audit-logs/*`: Shows recent audit logs.
- `components/admin/summary-dashboard/*`: Uses admin summary endpoint for KPIs.

Agent
- `components/agent/agent-dashbaord/*`: Agent landing/dashboard shell.
- `components/agent/agent-customers/*`: Lists customers assigned to the agent; link to details.
- `components/agent/customer-details/*`: Shows selected customer’s policies and claims.
- `components/agent/pending-claims/*`: Shows pending claims for the agent’s customers.
- `components/agent/agent-stats/*`: Visualizes claim counts/amounts and monthly aggregation.
- `components/agent/agent-profile/*`: Agent profile view and update form.

Customer
- `components/customer/customer-dashboard/*`: Customer landing shell with child routes.
- `components/customer/customer-policies/*`: Browse available products (augmented with assigned agent), buy policy, list my policies, cancel.
- `components/customer/customer-claims/*`: Submit claim (with image uploads), list claims, view details, show stats.
- `components/customer/customer-profile/*`: Profile page (read‑only or basic view depending on design).
- `components/customer/customer-crud/*`: Generic customer CRUD/example scaffolding used by tests.

Shared/App
- `components/home/*`: Marketing/home page.
- `components/login/*`: Login form that dispatches `AuthActions.login` (GraphQL).
- `components/signup/*`: Signup form that dispatches `AuthActions.signup` (GraphQL; server forces role=customer).

Spec files (`*.spec.ts`) provide unit tests for components/services.

### Environments and URLs (frontend)
- `environment.apiUrl` should point to the REST base, e.g. `http://localhost:4000/api/v1`.
  - Some services default to `http://localhost:4000` explicitly (e.g., public policies, agent service).
- Apollo GraphQL points at `http://localhost:4000/graphql`.
- JWT is stored in `localStorage` as `token` and attached to REST via `Authorization: Bearer <token>`.

---

## End-to-end Data Flows (Examples)

- Authentication
  1) Frontend dispatches `AuthActions.login` → `AuthService.login` (GraphQL)
  2) Backend `userResolvers.login` returns `{ token, user }`
  3) `AuthEffects` stores token and redirects by role; guards enable protected routes

- Buy Policy (Customer)
  1) UI dispatches `buyPolicy(policyId, body)` → `CustomerPolicy.buyPolicy` (REST)
  2) Backend `customer.controller.buyPolicy`: validates, creates `UserPolicy` + `Payment`, logs audit, emails confirmation
  3) Effects reload policies; state updates and UI reflects purchase

- Submit Claim
  1) UI dispatches `submitClaim` or `submitClaimWithoutPolicy` → `CustomerPolicy` (REST)
  2) Backend validates eligibility, processes images, creates `Claim` with `PENDING`
  3) Customer lists claims; Agent/Admin review via their dashboards

- Agent Reviews Claim
  1) Agent opens pending claims → `agent.controller.getPendingClaims`
  2) Agent approves/rejects via `reviewClaim` (eligibility checks, approved amount cap)
  3) Claim updates with decision metadata and AuditLog entry

---

## Operational Notes
- Audit logging exists for critical actions (create/update policy, agent creation, review claims, buy/cancel policy, payments).
- SMTP may be unconfigured in development; emails are logged to console instead of being sent.
- Cloudinary uploads are used for user photos, policy images, and claim proof images (base64 accepted with fallback behavior).
- Error messages from effects are surfaced and sometimes shown via alerts for UX clarity (e.g., purchase flow).

## Quick File Index

Backend
- `src/server.js`: App initialization, routes, GraphQL, DB connect
- `src/authMiddleware.js`: JWT auth and role guards
- `src/routes/*.js`: REST routes for admin/agent/customer
- `src/controllers/*.js`: Business logic for each role
- `src/models/*.js`: Mongoose schemas: User, PolicyProduct, UserPolicy, Payment, Claim, Auditlog
- `src/graphql/*`: Auth typeDefs/resolvers
- `src/config/*`: Email and Cloudinary setup

Frontend
- `src/main.ts`, `src/app/app.ts`, `src/app/app.config.ts`: Bootstrap, providers, store, apollo
- `src/app/app.routes.ts`: Route tree and guards
- `src/app/guards/*`: Auth and role guards
- `src/app/services/*`: REST/GraphQL facades
- `src/app/store/*`: NgRx slices (auth, policy, customer, agent, user)
- `src/app/components/*`: UI for admin, agent, customer, login/signup/home

---

If you want deeper per-function or per-selector docs or to include screenshots of UI flows, we can extend this document in a follow-up.


