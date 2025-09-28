# Capstone Insurance

Full‑stack Insurance Management System with an Angular 20 frontend and a Node.js (Express 5 + Apollo Server 5) backend on MongoDB.

### What this project does
- Role‑based app for three personas: admin, agent, and customer
- Policy products catalogue (public and authenticated views)
- Customer policy purchase and management
- Claims workflow (submit, approve/reject) with priority and category
- Payments tracking and receipts
- Email notifications (SMTP, with safe dev fallback)
- File uploads via Cloudinary (e.g., claim proofs)
- GraphQL API and REST API (both available)

### Tech stack
- Frontend: Angular 20, NgRx, Apollo Angular, Tailwind
- Backend: Node.js, Express 5, Apollo Server 5, Mongoose
- Database: MongoDB
- Infra/other: Cloudinary (uploads), Nodemailer (SMTP), Nginx config (for static hosting)

---

## Monorepo layout
```
./frontend   # Angular app (dev server on 4200)
./backend    # Express + Apollo Server + Mongoose (default on 4000)
./mongo-init.js  # Optional: initialize DB collections/indexes
./env.example    # Example environment variables (use as a template)
```

## Prerequisites
- Node.js 20+ and npm 10+
- MongoDB 6+ (local or hosted, e.g., Atlas)
- Git
- Optional: Cloudinary account (for uploads), SMTP creds (for real emails)

## 1) Clone the repo
```bash
git clone https://github.com/<your-org>/capstoneinsurance.git
cd capstoneinsurance
```

## 2) Configure environment variables
Backend loads variables with `dotenv` from its working directory. Create `backend/.env` based on `env.example`.

```bash
cp env.example backend/.env
# open backend/.env and adjust values
```

Key variables (see `env.example` for full list):
- `PORT`: backend port (default 4000)
- `MONGO_URI`: your MongoDB connection string
- `JWT_SECRET`: secret for JWT auth
- `CLOUDINARY_*`: Cloudinary credentials (uploads). If not set, image uploads will fail
- `FRONTEND_URL`: frontend origin (useful for CORS in prod setups)
- `BACKEND_URL`: backend base URL
- `SMTP_*`, `MAIL_FROM`: SMTP settings. If not provided, emails are logged to console (safe dev mode)

Notes:
- `backend/src/config/email.js` falls back to a dev logger when SMTP is not fully configured
- `backend/src/config/cloudinary.js` requires the Cloudinary variables to be present for uploads

## 3) Install dependencies
From the repository root, you can install all at once:
```bash
npm run install:all
```

Alternatively:
```bash
cd frontend && npm install
cd ../backend && npm install
```

## 4) Start in development
Run frontend and backend together from the root:
```bash
npm run dev
```

Services:
- Frontend (Angular dev server): `http://localhost:4200`
- Backend (Express + GraphQL): `http://localhost:4000`
  - REST base: `http://localhost:4000/api/v1`
  - GraphQL endpoint: `http://localhost:4000/graphql`

Start individually if needed:
```bash
# Backend only (watch)
cd backend && npm run dev

# Backend only (prod mode)
cd backend && npm start

# Frontend only
cd frontend && npm start
```

## 5) Initialize MongoDB (optional but recommended)
`mongo-init.js` creates collections and indexes for better performance.

Example with a local instance and example creds (adjust as needed):
```bash
# If you use the example admin/password in env.example
mongosh "mongodb://admin:password123@localhost:27017/admin" --file mongo-init.js

# Or connect first, then load:
mongosh
> load('mongo-init.js')
```

## Frontend configuration notes
- Dev API base is set in `frontend/src/environments/environment.ts` → `apiUrl: 'http://localhost:4000/api/v1'`
- Prod API base is set in `frontend/src/environments/environment.prod.ts`. Update this for your deployed backend
- The app uses both REST (`/api/v1/...`) and GraphQL (`/graphql`). Ensure the backend is reachable from the browser

## Backend API overview
- REST routers:
  - Admin: `/api/v1/admin/...`
  - Agent: `/api/v1/agent/...`
  - Customer: `/api/v1/customer/...`
- Public unauthenticated route: `GET /public/policies` (policy catalogue)
- GraphQL endpoint: `POST /graphql` (Apollo Server 5)

### Authentication
- JWT Bearer tokens are expected in the `Authorization` header (`Bearer <token>`) for protected routes
- GraphQL context also extracts the token if present

### Emails
- If SMTP is configured (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.), real emails are sent
- If not configured, emails are logged to the console (dev safe mode)

### File uploads
- Cloudinary is used; set `CLOUDINARY_*` variables to enable

## Common scripts
Root:
```bash
npm run install:all   # install deps for frontend and backend
npm run dev           # run frontend and backend concurrently (dev)
npm start             # start backend only (prod)
```

Frontend:
```bash
npm start             # Angular dev server (http://localhost:4200)
npm run build         # production build → dist/frontend/browser
npm test              # unit tests
```

Backend:
```bash
npm run dev           # nodemon src/server.js
npm start             # node src/server.js
```

## Production builds and deployment
### Frontend (static hosting)
```bash
cd frontend
npm run build
# Deploy dist/frontend/browser to Netlify/Vercel/S3/CloudFront/Nginx, etc.
```

For Nginx, see `frontend/nginx.conf` for an SPA‑friendly server config (history API fallback, asset caching).

Update `frontend/src/environments/environment.prod.ts` to point `apiUrl` at your backend before building.

### Backend (e.g., Render, Railway, VPS)
1) Set environment variables (copy from `env.example`)
2) Install and start commands:
```bash
# Build step
npm install
# Start
npm start
```
3) Ensure `PORT` is set by the platform or in env; backend listens on `process.env.PORT`
4) Use a hosted MongoDB connection string for `MONGO_URI`

## Troubleshooting
- MongoDB connection errors: verify `MONGO_URI` and that Mongo is reachable
- 401/403 responses: ensure you include `Authorization: Bearer <token>` for protected routes
- Upload failures: verify Cloudinary variables and network access
- Emails not arriving: set SMTP vars; otherwise messages are logged to the server console
- CORS in production: consider restricting `cors()` origins and set `FRONTEND_URL`/`BACKEND_URL` as appropriate

## License
MIT

