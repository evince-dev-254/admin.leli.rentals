# Environment Variables

Create a `.env.local` file for local development or set these in your deployment platform (Vercel, etc.) for production.

## Local Development

```env
# Clerk Authentication (same as main site)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Main Website API URL (local)
NEXT_PUBLIC_MAIN_API_URL=http://localhost:3000/api

# Admin Dashboard URL (for CORS reference)
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001
```

## Production

For production deployment, set these environment variables in your hosting platform:

```env
# Clerk Authentication (production keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# Main Website API URL (production)
NEXT_PUBLIC_MAIN_API_URL=https://www.leli.rentals/api

# Admin Dashboard URL (production domain)
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals
```

**Important**: The admin dashboard at `https://admin.leli.rentals` connects to the main app API at `https://www.leli.rentals/api`

## Setup Instructions

1. Copy this file to `.env.local` in the project root
2. Replace all placeholder values (`xxx`) with your actual Clerk keys
3. Set `NEXT_PUBLIC_MAIN_API_URL` to point to your main website's API endpoint
4. For local development, ensure your main site runs on port 3000
5. For production, use the production URLs

## Notes

- The Clerk keys should be the same as used in the main website
- The API URL should point to `/api` endpoint of the main site
- CORS must be configured on the main site to allow requests from the admin dashboard domain

