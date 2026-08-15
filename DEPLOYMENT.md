# MERN E-Commerce Deployment Guide

## 1. Database Setup (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Cluster (Shared Free M0 tier or Dedicated).
3. Under **Database Access**, create a database user with read/write privileges.
4. Under **Network Access**, add IP `0.0.0.0/0` (or Vercel/Render IP range).
5. Copy your connection string `MONGO_URI`.

---

## 2. Backend Deployment (Render.com)
1. Push your code to GitHub.
2. Log into [Render](https://render.com) -> New **Web Service**.
3. Connect your repository and choose root directory `/server`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://<user>:<password>@cluster.mongodb.net/mern_ecommerce`
   - `JWT_SECRET` = `<secure-random-32-char-string>`
   - `REFRESH_TOKEN_SECRET` = `<secure-random-32-char-string>`
   - `CLIENT_URL` = `https://your-frontend.vercel.app`
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `CLOUDINARY_CLOUD_NAME` = `...`

---

## 3. Frontend Deployment (Vercel)
1. Log into [Vercel](https://vercel.com) -> **Add New Project**.
2. Select your GitHub repository and set Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Set Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api/v1`
5. Click **Deploy**.
