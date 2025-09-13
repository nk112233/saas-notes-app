# Notes SaaS Backend (Express + MongoDB)

## Tenant approach
This project uses a **shared database schema** with a `tenant` ObjectId reference on tenant-scoped resources (Users, Notes, etc). All API endpoints enforce tenant isolation by validating the authenticated user's `tenant` and querying/updating only documents with that `tenant` id.

## Features
- JWT-based authentication
- Roles: admin / member
- Admin endpoints: invite user & upgrade tenant plan
- Free plan: note cap = 3
- Pro plan: unlimited notes
- Required test users seeded:
  - admin@acme.test (Admin, tenant: Acme)
  - user@acme.test (Member, tenant: Acme)
  - admin@globex.test (Admin, tenant: Globex)
  - user@globex.test (Member, tenant: Globex)
  All passwords: `password`

## Endpoints (important)
- `GET /health` → `{ "status":"ok" }`
- `POST /auth/login` { email, password } → `{ token }`
- `POST /tenants/:slug/upgrade` → Admin only
- `POST /tenants/:slug/invite` { email, role } → Admin only
- `POST /notes` → Create note (respects tenant plan)
- `GET /notes` → List tenant notes
- `GET /notes/:id` → Get note (tenant-scoped)
- `PUT /notes/:id` → Update note (tenant-scoped)
- `DELETE /notes/:id` → Delete note (tenant-scoped)

## Quick start
1. `git clone ...`
2. `npm install`
3. copy `.env.example` → `.env` and set values
4. `npm run seed` to create tenants & test users
5. `npm run dev` (or `npm start`)
6. Use `POST /auth/login` to obtain a token for test users.
   - Example token payload contains `tenantId` and `role` used for authorization.
