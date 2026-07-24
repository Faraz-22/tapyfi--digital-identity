# tapyfi Deployment Guide

## Recommended production stack

- Frontend: Vercel, Netlify, Cloudflare Pages, or S3/CloudFront
- API: Render, Fly.io, Railway, ECS, or Kubernetes
- Database: Neon, Supabase Postgres, RDS, or Cloud SQL
- Assets: S3-compatible storage
- Payments: Stripe and Razorpay webhooks
- Email: Resend, Postmark, SendGrid, or SES

## Environment variables

Use `.env.example` as the source of truth. Production must define:

- `DATABASE_URL`
- `JWT_SECRET`
- `APP_URL`
- `API_URL`
- `STRIPE_SECRET_KEY` or `RAZORPAY_KEY_SECRET`
- SMTP or transactional email credentials

## Build

```bash
npm run build
```

## API deployment

Run the Express server with:

```bash
npm run api
```

For production, place it behind HTTPS, enable request logging, configure CORS for the deployed frontend domain, and run Prisma migrations before release.

## SEO and metadata

Public profile pages should be server-rendered or pre-rendered in a production Next.js/Remix migration if rich dynamic metadata previews are required at large scale. This Vite prototype includes metadata foundations and client routing.

## Security checklist

- Enforce strong `JWT_SECRET`
- Store passwords with bcrypt or Argon2
- Validate all route bodies with Zod
- Keep rate limiting on all public routes
- Verify Stripe/Razorpay webhooks
- Sign uploads and store media outside the API server
- Add audit logs for admin actions
- Use row-level authorization checks on every profile, team, product, and order mutation
