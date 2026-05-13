# ReTechExchange

<p align="center">
  <img src="docs/images/retechex-hero.png" alt="ReTechExchange full stack e-waste recycling and ecommerce platform" width="100%">
</p>

<p align="center">
  <strong>Full-stack e-waste recycling and ecommerce platform for sustainable refurbished electronics workflows.</strong>
</p>

<p align="center">
  <a href="https://retechex-ecommerce-recycling.vercel.app">Live Frontend</a>
  ·
  <a href="https://server-afn-max.vercel.app">Backend API</a>
  ·
  <a href="https://server-afn-max.vercel.app/health">Health Check</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-API-111827?logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white">
</p>

ReTechExchange is a full-stack e-waste recycling and ecommerce platform built with React, Vite, Express, MongoDB, and Tailwind CSS. The application supports customer recycling appointments, marketplace purchases, cart and wishlist flows, order tracking, admin management, staff operations, discounts, contact messages, persistent uploads, and PDF report generation.

## Academic Project Details

This repository was developed as a student group project for the Information Technology Project module.

| Detail | Information |
|---|---|
| Module | IT2080 - Information Technology Project |
| Project Type | Group Project |
| Project Title | ReTechExchange Ecommerce Recycling Platform |
| Student Registration Number | IT23833548 |
| Student Name | Afnath Ahamed |
| GitHub Repository | https://github.com/Afnath-max/Retechex-ecommerce-recycling |
| Live Frontend | https://retechex-ecommerce-recycling.vercel.app |
| Backend API | https://server-afn-max.vercel.app |
| Backend Health Check | https://server-afn-max.vercel.app/health |

## Group Project Scope

ReTechEx focuses on building a practical web based solution for e-waste recycling and refurbished electronics ecommerce. The system includes separate user experiences for customers, staff members, and administrators, allowing the group project to demonstrate project planning, full stack development, role based workflows, database design, and real world usability considerations.

## Project Showcase

ReTechExchange combines a customer marketplace, appointment based e-waste collection, and operational dashboards for staff and administrators. The platform is designed around three role based workflows:

| Role | Experience |
|---|---|
| Customer | Browse refurbished electronics, manage cart and wishlist, place orders, and book recycling appointments |
| Staff | Process appointments, manage operational orders, and update inventory stock |
| Admin | Manage users, products, discounts, orders, appointments, reports, and contact messages |

## Project Overview

The project is split into two apps:

- `client` - React frontend powered by Vite and Tailwind CSS.
- `server` - Express backend with MongoDB, JWT authentication, file uploads, email utilities, and PDF generation.

The frontend runs on port `5173` and proxies API requests to the backend on port `3000`.

## Live Deployment

| Service | URL | Status |
|---|---|---|
| Frontend | https://retechex-ecommerce-recycling.vercel.app | Deployed on Vercel |
| Backend API | https://server-afn-max.vercel.app | Deployed on Vercel |
| Health Check | https://server-afn-max.vercel.app/health | Returns backend status |

The production frontend is configured with:

```env
VITE_API_URL=https://server-afn-max.vercel.app/api
```

The backend uses MongoDB Atlas for production data and Vercel Blob for persistent uploaded product and profile images.

## Main Features

- Customer registration, login, profile editing, and password reset flow
- Role based access for customer, staff, and admin users
- Product marketplace with product details, cart, checkout, wishlist, and order history
- E-waste appointment booking and appointment tracking
- Admin dashboard with user, product, order, appointment, discount, and contact message management
- Staff dashboard for operational order, inventory, and appointment workflows
- PDF downloads for orders, appointments, and admin reports
- SMTP email support for OTPs, password reset, order confirmation, and appointment notifications
- MongoDB Atlas or local MongoDB support

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Styling | Tailwind CSS, Lucide React |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Email | Nodemailer |
| Files | Multer, Vercel Blob |
| Reports | PDFKit |

## Folder Structure

```text
ReTechEx_Afn/
+-- client/
|   +-- src/
|   +-- package.json
|   +-- vite.config.js
+-- server/
|   +-- config/
|   +-- controllers/
|   +-- middleware/
|   +-- models/
|   +-- routes/
|   +-- utils/
|   +-- .env.example
|   +-- createAdmin.js
|   +-- package.json
|   +-- server.js
+-- .gitignore
+-- README.md
```

## Fresh Clone Setup

Follow these steps after cloning the repository on a new machine.

### 1. Clone the Repository

```powershell
git clone https://github.com/Afnath-max/Retechex-ecommerce-recycling.git
cd Retechex-ecommerce-recycling
```

### 2. Install Requirements

Install Node.js first. Recommended version:

```text
Node.js 20.19+ or Node.js 22.12+
```

Check your versions:

```powershell
node -v
npm -v
```

### 3. Install Backend Dependencies

```powershell
cd server
npm install
```

### 4. Create Backend Environment File

Create `server/.env` from the example file:

```powershell
Copy-Item .env.example .env
```

Open `server/.env` and update the values.

Minimum required values:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/retechex
JWT_SECRET=change-this-to-a-long-random-secret
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/retechex?retryWrites=true&w=majority
```

Important:

- Do not commit `server/.env`.
- If using MongoDB Atlas, allow your current IP address in Atlas Network Access.
- If your password contains special characters, URL encode it before adding it to the URI.

Optional email values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="ReTechEx" <your-email@gmail.com>
```

Optional upload storage for Vercel:

```env
BLOB_READ_WRITE_TOKEN=your-vercel-blob-read-write-token
```

If `BLOB_READ_WRITE_TOKEN` is present, uploads are stored in Vercel Blob. If it is missing, uploads are stored locally in `server/uploads`.

### 5. Install Frontend Dependencies

Open a new terminal from the project root:

```powershell
cd client
npm install
```

### 6. Start MongoDB

Use one of these options:

- Local MongoDB: make sure the MongoDB service is running.
- MongoDB Atlas: make sure the Atlas URI in `server/.env` is correct and your IP is allowed.

### 7. Create the Admin User

From the `server` folder, run:

```powershell
node createAdmin.js
```

This creates the default admin account:

```text
Email: admin@retechex.com
Password: admin123
```

### 8. Run the Backend

From the `server` folder:

```powershell
npm run dev
```

Expected output:

```text
MongoDB Connected
Server running on http://localhost:3000
```

### 9. Run the Frontend

Open another terminal:

```powershell
cd client
npm run dev
```

Open the app:

```text
http://localhost:5173
```

## Login URLs

```text
Customer login: http://localhost:5173/login
Staff login:    http://localhost:5173/staff/login
Admin login:    http://localhost:5173/admin/login
```

## Default Accounts

The admin account can be created with `node createAdmin.js`.

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@retechex.com` | `admin123` | Created by `server/createAdmin.js` |
| Staff | `staff@retechex.com` | `staff123` | Available only if this staff user exists in your database |

Customer accounts are normally created through the registration page.

## Useful Scripts

Backend scripts:

```powershell
cd server
npm run dev      # Start backend with nodemon
npm start        # Start backend with node
node createAdmin.js
```

Frontend scripts:

```powershell
cd client
npm run dev      # Start Vite development server
npm run build    # Build production frontend
npm run preview  # Preview production build
```

## Environment Notes

The backend reads these environment variables:

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | No | App environment |
| `PORT` | No | Backend port, default is `3000` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens |
| `JWT_EXPIRE` | No | Token expiry, default is `7d` |
| `CORS_ORIGIN` | No | Frontend URL allowed by CORS |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP server port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password or app password |
| `SMTP_FROM` | No | Verified sender address |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for persistent production uploads |
| `ADMIN_SECRET` | No | Optional key for protected discount config route |

## Troubleshooting

### Port 3000 Already in Use

If the backend shows:

```text
Error: listen EADDRINUSE: address already in use :::3000
```

Find and stop the process using port `3000`:

```powershell
$conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
foreach ($c in $conns) {
  Stop-Process -Id $c.OwningProcess -Force
}
```

Then restart:

```powershell
npm run dev
```

### MongoDB Atlas SRV DNS Error

If you see:

```text
querySrv ECONNREFUSED _mongodb._tcp...
```

The project already configures Node to use public DNS servers in `server/server.js`. If the issue continues:

- Check your internet connection.
- Check Atlas Network Access and allow your IP.
- Verify the `MONGODB_URI` in `server/.env`.
- Try restarting the backend terminal.

### Frontend Warnings About Browserslist

Warnings like these do not stop the app:

```text
Browserslist: browsers data is old
baseline-browser-mapping is over two months old
```

To update browser data:

```powershell
cd client
npx update-browserslist-db@latest
npm i baseline-browser-mapping@latest -D
```

### Frontend Cannot Reach Backend

Make sure:

- Backend is running on `http://localhost:3000`.
- Frontend is running on `http://localhost:5173`.
- `server/.env` has `CORS_ORIGIN=http://localhost:5173`.
- `client/vite.config.js` proxy points `/api` to `http://localhost:3000`.

For the deployed frontend, make sure Vercel has:

```env
VITE_API_URL=https://server-afn-max.vercel.app/api
```

### MongoDB Atlas Blocks Production Backend

If the deployed backend returns `500` and Vercel logs show that MongoDB Atlas cannot connect, open MongoDB Atlas and add a Network Access entry:

```text
0.0.0.0/0
```

Use a strong database password when allowing access from anywhere.

### Uploaded Images Do Not Appear in Production

Local files in `server/uploads` are not automatically available on Vercel. Production uploads should use Vercel Blob through `BLOB_READ_WRITE_TOKEN`. Existing local images may need to be uploaded again from the app or admin panel.

## Production Notes

Before deploying:

- Rotate any database password that was shared publicly.
- Use a strong `JWT_SECRET`.
- Store environment variables in the hosting provider, not in Git.
- Configure production CORS to the deployed frontend URL.
- Use a managed MongoDB database such as MongoDB Atlas.
- Use Vercel Blob or another object storage service for persistent uploaded images.
- Configure a verified SMTP sender for email delivery.

## Repository

```text
https://github.com/Afnath-max/Retechex-ecommerce-recycling
```
