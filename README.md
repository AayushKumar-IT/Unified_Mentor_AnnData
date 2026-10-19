# AnnDaata

AnnDaata is a farmer-to-consumer marketplace that helps shoppers discover fresh local produce and enables farmers to manage their farms, inventory, and incoming orders. Administrators review farm applications and manage the marketplace.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Quick start without Docker](#quick-start-without-docker)
- [Optional: use Docker for PostgreSQL](#optional-use-docker-for-postgresql)
- [Application URLs and accounts](#application-urls-and-accounts)
- [Project commands](#project-commands)
- [Project structure](#project-structure)
- [Database and uploaded files](#database-and-uploaded-files)
- [API overview](#api-overview)
- [Production notes](#production-notes)
- [Troubleshooting](#troubleshooting)

## Features

### Shoppers

- Browse and search available products by category, farm, and location.
- View product and farmer details.
- Add products to a cart and place orders with a delivery address and slot.
- Save delivery addresses with an order and reuse them at checkout.
- View order history and leave reviews for eligible purchases.

### Farmers

- Register as a farmer and create or update a farm profile.
- Track farm verification status from the farmer dashboard.
- Create, edit, publish, unlist, and restock products.
- Review incoming orders and update their status.
- View inventory, low-stock indicators, sales, and order summaries.

### Administrators

- Review, approve, or reject pending farm applications.
- Browse verified and pending farmer profiles.
- View consumers, marketplace orders, and revenue information from the overview.
- Manage product categories and inspect marketplace analytics.

## Technology stack

- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Sequelize
- **Authentication:** JSON Web Tokens
- **Product photos:** Local files in `backend/uploads` during development

## Requirements

- Node.js 20.19 or newer
- npm (included with Node.js)
- PostgreSQL 14 or newer
- Docker Desktop is optional (only needed if you want Docker to run PostgreSQL)

## Quick start without Docker

This is the recommended setup if Docker is not installed. You need PostgreSQL installed and running on your computer. Run commands in your IDE's terminal (for example, **Terminal > New Terminal** in VS Code), from the project root - the folder containing this `README.md`.

### 1. Install and start PostgreSQL

Install PostgreSQL 14 or newer for your operating system. On Windows, the PostgreSQL installer includes pgAdmin. During installation, remember the password you set for the `postgres` user. Make sure the PostgreSQL server is running.

In pgAdmin, create a database named `anndata`:

1. Connect to your local PostgreSQL server.
2. Right-click **Databases** and choose **Create > Database...**.
3. Enter `anndata` as the database name and save.

The default local PostgreSQL port is `5432`.

### 2. Configure the backend

If `backend/.env` already exists, edit it; do not overwrite it. Otherwise, create it by copying `backend/.env.example` to `backend/.env`. In PowerShell, run from the project root:

```powershell
Copy-Item backend\.env.example backend\.env
```

In Command Prompt, use:

```bat
copy backend\.env.example backend\.env
```

Open `backend/.env` and set `DATABASE_URL` to match your PostgreSQL username, password, host, port, and database. For the default Windows installation, use this format and replace `YOUR_POSTGRES_PASSWORD` with the password you chose during installation:

```text
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/anndata
```

Also replace the example `JWT_SECRET` with a private value. Do not share or commit your `.env` file.

### 3. Install and prepare the app

Run these commands from the project root. Install dependencies the first time (or after changing them):

```sh
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run seed
```

The seed command creates the database tables and development admin account.

### 4. Start the app in two terminals

Open two terminal tabs in your IDE. In both tabs, make sure the current folder is the project root (the folder containing `README.md`).

In **Terminal 1**, run the backend:

```sh
npm --prefix backend run dev
```

In **Terminal 2**, run the website:

```sh
npm --prefix frontend run dev
```

Keep both terminals open while using the app. Open the **Local** address printed in Terminal 2 in your browser (usually `http://localhost:5173`).

## Optional: use Docker for PostgreSQL

You do not need Docker if you followed the quick start above. If you prefer Docker, install and start Docker Desktop, then run this command from the project root:

```sh
docker compose up -d db
```

Docker Compose runs PostgreSQL on port `5433`. Set `DATABASE_URL` in `backend/.env` to the Docker database URL shown in `backend/.env.example`, then continue from step 3 in the quick start.

## Application URLs and accounts

With the default development ports:

| Service | URL |
| --- | --- |
| Web application | `http://localhost:5173` |
| API health check | `http://localhost:5000/api/health` |
| API base URL | `http://localhost:5000/api/v1` |

The API port is controlled by `PORT` in `backend/.env`. If you change it, set `VITE_API_URL` in `frontend/.env.local` to the matching API base URL, for example `http://localhost:5001/api/v1`.

The seed script ensures this **development-only** administrator account can log in. Each time you run the seed script, it sets the admin email and password below. You can optionally set `ADMIN_EMAIL` in `backend/.env` to use a different email for your local development account.

- Email: `admin@anndata.com`
- Password: `Admin@1234`

Use the account to open the admin overview and review farmer applications. This development password is reset whenever the seed script runs; change it before deployment.

Farmers and shoppers can register through the web application. New farmer profiles remain pending until an administrator approves them.

## Project commands

Run these from the repository root unless the command says otherwise:

| Command | Description |
| --- | --- |
| `npm --prefix backend install` | Install backend dependencies |
| `npm --prefix frontend install` | Install frontend dependencies |
| `npm --prefix backend run dev` | Start the API in watch mode |
| `npm --prefix frontend run dev` | Start the Vite development server |
| `npm --prefix frontend run build` | Create the frontend production build in `frontend/dist` |
| `npm --prefix backend start` | Start the backend API without watch mode |
| `npm --prefix backend run seed` | Ensure database tables, default categories, and the development admin exist |
| `docker compose up -d db` | (Optional) Start PostgreSQL with Docker |
| `docker compose down` | (Optional) Stop the Docker Compose services (keeps the named database volume) |

For SQL commands and examples to inspect application records, see [DATA_COMMANDS.md](./DATA_COMMANDS.md).

## Project structure

```text
.
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ config/          # PostgreSQL and Sequelize configuration
â”‚   â”œâ”€â”€ controllers/     # Request handlers and business logic
â”‚   â”œâ”€â”€ middleware/      # Authentication, authorization, and error handling
â”‚   â”œâ”€â”€ models/          # Sequelize models and relationships
â”‚   â”œâ”€â”€ routes/          # REST API routes
â”‚   â”œâ”€â”€ uploads/         # Product photos uploaded during development
â”‚   â”œâ”€â”€ .env.example     # Backend environment template
â”‚   â”œâ”€â”€ seeder.js        # Development categories and administrator seed
â”‚   â””â”€â”€ server.js        # Express application and startup
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ public/          # Static assets
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ assets/
â”‚       â”œâ”€â”€ components/  # Shared UI components
â”‚       â”œâ”€â”€ context/     # Authentication and cart state
â”‚       â”œâ”€â”€ hooks/
â”‚       â”œâ”€â”€ pages/       # Consumer, farmer, admin, and auth screens
â”‚       â”œâ”€â”€ services/    # API client and service methods
â”‚       â””â”€â”€ utils/
â”œâ”€â”€ docker-compose.yml
â”œâ”€â”€ DATA_COMMANDS.md
â””â”€â”€ README.md
```

## Database and uploaded files

The backend reads its PostgreSQL connection from `DATABASE_URL` in `backend/.env`. The main relational tables are `users`, `farmers`, `categories`, `products`, `orders`, `order_items`, `saved_addresses`, and `reviews`. Sequelize creates missing tables at API startup for local development.

Product photo files are written to `backend/uploads`; product records store their file paths. These local uploads are suitable for development. Use durable object storage for deployment.

The Docker Compose database persists in the named `anndata-postgres-data` volume. Stopping the containers does not delete the volume. Avoid `docker compose down -v` unless you intentionally want to delete the local database volume and its data.

## API overview

All versioned routes use the `/api/v1` prefix.

| Resource | Route examples | Access |
| --- | --- | --- |
| Authentication | `/auth/register`, `/auth/login`, `/auth/me` | Public or signed-in |
| Farmers | `/farmers`, `/farmers/:id`, `/farmers/profile` | Public profile routes; profile management requires farmer login |
| Products | `/products`, `/products/:id`, `/products/mine` | Public listings; inventory management requires farmer login |
| Orders | `/orders`, `/orders/my-orders`, `/orders/farmer-orders` | Authenticated shopper or farmer, depending on route |
| Saved addresses | `GET /addresses` | Authenticated shopper; returns saved delivery addresses and imports addresses from past orders |
| Reviews | `/reviews` | Authenticated shopper |
| Admin | `/admin/farmers`, `/admin/consumers`, `/admin/orders`, `/admin/analytics` | Admin only |

The unversioned `GET /api/health` endpoint reports whether the API process is running.

## Production notes

- Replace the development administrator credentials and use a strong, unique `JWT_SECRET`.
- Configure `FRONTEND_URL` to the deployed frontend origin and configure database TLS/SSL as required by the provider.
- Do not use the example Docker password in production. Protect environment variables and database backups.
- Use reviewed database migrations for production schema changes; automatic Sequelize synchronization is intended for local development.
- Configure durable object storage for uploaded product images.
- Add appropriate monitoring, backups, and operational error reporting before public deployment.

## Troubleshooting

### The API does not start

- Confirm PostgreSQL is running and reachable.
- Check that `backend/.env` exists and that `DATABASE_URL` points to the correct database and port.
- Confirm `JWT_SECRET` is configured.
- For Docker, use `docker compose ps` to check the database container and review its logs with `docker compose logs db`.

### The browser cannot reach the API

- Confirm the API is running and open `http://localhost:5000/api/health` (adjust the port if `PORT` was changed).
- Ensure `VITE_API_URL` in `frontend/.env.local`, if set, matches the API port and ends in `/api/v1`.
- Restart the Vite development server after changing frontend environment variables.

### Admin login does not work

- Run `npm --prefix backend run seed` from the project root with the correct database configured in `backend/.env`.
- Running the seed script sets the development admin email and password shown in Application URLs and accounts. If `ADMIN_EMAIL` is set, it uses that address instead of the default.
- Confirm that you are signing into the same database that the running API uses.
