# AnnDaata data and database commands

## Where the data is stored

AnnDaata stores application records in PostgreSQL. The backend reads its connection string from `backend/.env` (`DATABASE_URL`); the database configured for this workspace is `anndata` on `localhost:5432`.

The main PostgreSQL tables are:

| Table | Data |
| --- | --- |
| `users` | Account names, email addresses, roles, and password hashes |
| `farmers` | Farm profiles and verification state |
| `categories` | Product categories |
| `products` | Product details, stock, price, and image paths |
| `orders` | Customer orders and delivery details |
| `order_items` | Products, quantities, and prices recorded on each order |
| `reviews` | Customer ratings and reviews |

Product image files are stored separately in `backend/uploads`; the `products.images` column contains their paths. Do not share or commit `backend/.env`, database passwords, or user password hashes.

## Connect to the configured database (PowerShell)

Run these commands from the project root. They read the connection details from `backend/.env`, display no password, and ask for the PostgreSQL password:

```powershell
$connectionString = (Get-Content .\backend\.env | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1) -replace '^DATABASE_URL=', ''
$databaseUri = [Uri]$connectionString
$databaseUser = [Uri]::UnescapeDataString($databaseUri.UserInfo.Split(':')[0])
$databaseName = [Uri]::UnescapeDataString($databaseUri.AbsolutePath.TrimStart('/'))
psql -h $databaseUri.Host -p $databaseUri.Port -U $databaseUser -d $databaseName -W
```

If PowerShell says that `psql` is not recognized, run it with the PostgreSQL installation path. For example:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h $databaseUri.Host -p $databaseUri.Port -U $databaseUser -d $databaseName -W
```

At the `anndata=#` prompt, enter any SQL below. Finish a query with `;`. To leave `psql`, enter `\q`.

## Useful SQL queries

Show all tables:

```sql
\dt
```

Count rows in every application table:

```sql
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL SELECT 'farmers', COUNT(*) FROM farmers
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews;
```

List users without exposing password hashes:

```sql
SELECT id, name, email, role, "createdAt"
FROM users
ORDER BY "createdAt" DESC;
```

List farm profiles and their account email:

```sql
SELECT f.id, f."farmName", f."farmLocation", f."isVerified",
       u.name AS account_name, u.email
FROM farmers AS f
JOIN users AS u ON u.id = f."userId"
ORDER BY f."createdAt" DESC;
```

List products with their farm and category:

```sql
SELECT p.id, p.name, p.price, p.unit, p."quantityAvailable",
       p."isAvailable", f."farmName", c.name AS category
FROM products AS p
JOIN farmers AS f ON f.id = p."farmerId"
JOIN categories AS c ON c.id = p."categoryId"
ORDER BY p."createdAt" DESC;
```

List orders with customer and farm:

```sql
SELECT o.id, o.status, o."totalAmount", o."deliverySlot",
       u.name AS customer, f."farmName"
FROM orders AS o
JOIN users AS u ON u.id = o."consumerId"
JOIN farmers AS f ON f.id = o."farmerId"
ORDER BY o."createdAt" DESC;
```

List the items in each order:

```sql
SELECT oi."orderId", p.name AS product, oi.quantity, oi.price
FROM order_items AS oi
JOIN products AS p ON p.id = oi."productId"
ORDER BY oi."orderId";
```

List product reviews:

```sql
SELECT r.id, r.rating, r.comment, p.name AS product, u.name AS customer
FROM reviews AS r
JOIN products AS p ON p.id = r."productId"
JOIN users AS u ON u.id = r."consumerId"
ORDER BY r."createdAt" DESC;
```

## Check records through the API

When the API is running, these public endpoints can be opened in a browser or queried from PowerShell:

```powershell
Invoke-RestMethod http://localhost:5001/api/health
Invoke-RestMethod http://localhost:5001/api/v1/admin/categories
Invoke-RestMethod http://localhost:5001/api/v1/products
Invoke-RestMethod http://localhost:5001/api/v1/farmers
```

The API port may differ in another environment. Check `PORT` in `backend/.env`. Farmer inventory and orders require a farmer login; the dashboard uses the authenticated `/api/v1/products/mine`, `/api/v1/orders/farmer-orders`, and `/api/v1/farmers/sales-summary` endpoints.

## Database setup commands

From the project root:

```powershell
docker compose up -d db
npm run seed
```

The Docker Compose database uses host port `5433`; if using that database, configure `DATABASE_URL` in `backend/.env` with port `5433`. This workspace currently points to its local PostgreSQL on port `5432`. Check the `DATABASE_URL` value locally if you need to confirm which instance the running backend uses.
