# Product Management

A minimal product CRUD application with a React, TypeScript, Vite, and Material UI frontend; an Express API; and a MySQL database.

## Requirements

- Node.js 18 or newer
- MySQL 8 or compatible

## Database setup

Run the schema from the project root using a MySQL client:

```sh
mysql -u your_mysql_user -p < database.sql
```

This creates the `product_management` database and `products` table.

## Configure environment

Create `backend/.env` from `backend/.env.example` and enter your MySQL connection details:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=product_management
DB_CONNECTION_LIMIT=10
```

Create `frontend/.env` from `frontend/.env.example`. The default URL is:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit either `.env` file.

## Install and run

In one terminal:

```sh
cd backend
npm install
npm run dev
```

The API starts at `http://localhost:5000` after it connects to MySQL. For a production-style run, use `npm start`.

In another terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Build the frontend with `npm run build`.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get a product |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Replace a product's editable fields |
| DELETE | `/api/products/:id` | Delete a product |

Create and update requests accept `name`, `description`, `price`, and `quantity`. Names must be non-empty; prices and quantities must be non-negative, and quantities must be whole numbers.
