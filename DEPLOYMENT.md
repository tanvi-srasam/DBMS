# Deployment Guide for ViteCare DBMS

Since your project uses a full-stack configuration (React Frontend + Express/SQLite Backend), deploying it requires a provider that supports Node.js and persistent storage (for the SQLite database).

The most accessible free service for this is **Render.com**. Follow these simple steps to deploy your application:

## 1. Prepare your project for Render
We have already updated your `package.json` to properly serve the application in production and built the API routing dynamically. No code changes are required!

All you need to do is commit your repository.

## 2. Push to GitHub
If you haven't already, push this code to a GitHub repository:
1. Open your terminal in the `DBMS` folder.
2. Initialize git: `git init`
3. Add changes: `git add .`
4. Commit: `git commit -m "Ready for production"`
5. Setup your GitHub repository following GitHub's instructions and push the code: `git push -u origin main`

## 3. Deploy to Render.com
1. Go to [Render.com](https://render.com) and create a free account.
2. Click **New** and select **Web Service**.
3. Connect your GitHub account and select your `DBMS` repository.
4. Fill out the application settings:
   - **Name:** `vitecare-dbms` (or whatever you prefer)
   - **Region:** Choose whichever is closest to you
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. **Very Important (Database Persistence):** Scroll down to "Advanced" and add a **Disk**.
   - **Name:** `sqlite-data`
   - **Mount Path:** `/opt/render/project/src/server` 
   - *(This ensures your hospital.db file isn't wiped out when the server goes to sleep!)*
6. Click **Create Web Service**.

Render will now build and deploy both your frontend and backend on the same URL! Your teacher will be able to test it publicly online.
