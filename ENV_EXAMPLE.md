# Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication (same as main site)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Main Website API URL
# For local development: http://localhost:3000/api
# For production: https://www.leli.rentals/api
NEXT_PUBLIC_MAIN_API_URL=http://localhost:3000/api

# Admin Dashboard URL (for CORS reference)
# For local development: http://localhost:3001
# For production: https://admin.leli.rentals
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001
```

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

