# tapyfi Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

## Local install

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

The frontend runs on `http://localhost:5173`.

## API server

```bash
npm run api
```

The API runs on `http://localhost:4000`.

## Database

Set `DATABASE_URL` in `.env`, then run:

```bash
npm run prisma:migrate
```

## Demo routes

- `/` cinematic landing
- `/login` authentication shell
- `/dashboard` identity dashboard
- `/profile/faraz` dynamic public profile
- `/shop` NFC marketplace
- `/admin` admin operations panel

## NFC workflow

The NFC chip stores only the dynamic public profile URL, such as:

```text
https://your-domain.com/profile/faraz
```

When a profile changes, the card does not need to be rewritten unless the profile URL changes.

Web NFC currently works primarily in Chrome on Android. For unsupported browsers, copy the generated URL and write it with NFC Tools.
