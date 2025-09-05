# Cascade Bruins Volleyball — Dinner & Tournament Sign‑Up

This repo contains a single‑file site (`index.html`) that talks to a Google Apps Script backend to store signups in a Google Sheet and send email confirmations.

## Quick Start

1) **Apps Script (backend)**
   - In your Google Sheet, go to **Extensions → Apps Script**.
   - Paste `backend/Code.gs` into the editor.
   - Set your emails at the top:
     ```js
     const ORGANIZER_EMAIL = 'you@yourdomain.com';
     const COACH_EMAIL = 'coach@school.org';
     ```
   - **Deploy → New deployment → Web app**
     - Execute as: **Me**
     - Who has access: **Anyone with the link** (or your domain)
   - Copy the **Web App URL**.

2) **Frontend**
   - Open `index.html` and paste your Web App URL into:
     ```js
     const GAS_URL = "YOUR_GAS_WEB_APP_URL";
     ```
   - (Optional) Update `COACH_EMAIL` and `ORGANIZER_EMAIL` in `index.html` for display only.

3) **Vercel**
   - Create a new GitHub repo, add these files, and push.
   - In Vercel: **New Project → Import** the repo. Leave build settings empty (static site).

## Dates Included
- Home games: Sept 9, 22, 24; Oct 1, 7, 13 (Dig for the Cure), 20 (Spikefest), 28, 30 (Senior Night)
- Tournaments: Sept 13 (Varsity @ Everett HS), Sept 20 (Varsity/C‑Team @ Glacier Peak & Jackson HS)

## Pre‑reserve Sept 9 (Walkers)
- Use the live page to sign up for Sept 9, or add a row directly in the Sheet with `date_id=2025-09-09` and `name=Walkers`.

## Admin ideas (optional)
- Add a separate admin page to release/override dates.
- Add reminder emails 24–48h before each signup date.
- Increase capacity for tournaments.
