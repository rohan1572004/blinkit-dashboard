# Deployment Guide

This project can be deployed to Render (backend) and Vercel (frontend) or hosted fully on Render.

## Render (recommended for full app)

- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Node 18+

Notes: The project uses a local SQLite DB (`blinkit.db`). Render's filesystem is ephemeral — use a managed DB for production.

## Vercel (frontend only)

- Split frontend files into `frontend/` and deploy as static site.
- Point API calls to your Render service URL.
