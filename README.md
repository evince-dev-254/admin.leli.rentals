# Leli Admin Dashboard

> Professional admin dashboard for managing the Leli Rentals platform with a beautiful gradient UI and comprehensive management tools.

## 🚀 Features

### Core Functionality
- **User Management** - View, search, and manage all platform users
- **Verification System** - Approve or reject user ID verifications with document review
- **Listings Oversight** - Monitor and moderate platform listings
- **Booking Management** - Track and manage all bookings
- **Platform Analytics** - Comprehensive insights and statistics
- **Super Admin Settings** - Configure platform-wide settings and preferences

### User Interface
- **Modern Gradient Design** - Beautiful blue-purple-plum gradient background
- **Frosted Glass Cards** - Semi-transparent cards with backdrop blur effect
- **Responsive Layout** - Adapts seamlessly from mobile to desktop
- **Dark Mode Ready** - Gradient design works in all lighting conditions
- **Interactive Elements** - Clickable stats cards and smooth transitions

### Technical Features
- **Real-time Data** - Connect to main website API for live data
- **Secure Authentication** - Clerk integration with middleware protection
- **Toast Notifications** - User-friendly feedback for all actions
- **Loading States** - Elegant loading spinners throughout
- **Error Handling** - Comprehensive error management

## 📸 Screenshots

The dashboard features:
- Gradient blue-purple-plum background
- Frosted glass effect cards
- Black text for optimal readability
- Responsive grid layouts

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk v6 with middleware
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI (shadcn/ui)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod (ready for implementation)

## 📋 Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- Main Leli Rentals website running (for API connectivity)
- Clerk account with API keys

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/evince-dev-254/admin.leli.rentals.git
cd admin.leli.rentals
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Environment Configuration

Copy the environment example file:

```bash
cp ENV_EXAMPLE.md .env.local
```

Edit `.env.local` and add your credentials:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Main Website API URL
# Local: http://localhost:3000/api
# Production: https://www.leli.rentals/api
NEXT_PUBLIC_MAIN_API_URL=http://localhost:3000/api

# Admin Dashboard URL
# Local: http://localhost:3001
# Production: https://admin.leli.rentals
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001
```

**Note**: For production deployment on Vercel, set `NEXT_PUBLIC_MAIN_API_URL=https://www.leli.rentals/api`. The API client automatically uses the production URL when `NODE_ENV=production`.

### 4. Run Development Server

```bash
npm run dev
```

The dashboard will be available at [http://localhost:3001](http://localhost:3001)

## 🏗 Project Structure

```
leli-admin-dashboard/
├── app/
│   ├── dashboard/              # Main dashboard pages
│   │   ├── page.tsx           # Dashboard home with stats
│   │   ├── users/             # User management
│   │   ├── verifications/     # Verification management
│   │   ├── listings/          # Listing oversight
│   │   ├── bookings/          # Booking management
│   │   ├── analytics/         # Analytics dashboard
│   │   └── settings/          # Super admin settings
│   ├── sign-in/               # Clerk authentication
│   ├── globals.css            # Global styles & gradient
│   ├── layout.tsx             # Root layout
│   └── icon.svg               # Favicon
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   └── loading-spinner.tsx   # Custom loading component
├── lib/
│   ├── api-client.ts          # Axios configuration
│   └── services/              # API service functions
│       ├── users.ts
│       ├── listings.ts
│       ├── bookings.ts
│       ├── stats.ts
│       └── verification.ts
├── hooks/
│   └── use-toast.ts           # Toast notifications
├── middleware.ts               # Clerk authentication middleware
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── API_SETUP_GUIDE.md         # API connection guide
└── RESPONSIVE_DESIGN_GUIDE.md # Responsive design docs
```

## 🔌 API Integration

The dashboard connects to your main website's backend API. See **[API_SETUP_GUIDE.md](API_SETUP_GUIDE.md)** for complete setup instructions.

### Required Endpoints

- `GET /api/admin/users/list` - Fetch all users
- `POST /api/admin/search-user` - Search user by email
- `GET /api/admin/listings` - Fetch all listings
- `GET /api/admin/bookings` - Fetch all bookings
- `GET /api/admin/stats` - Platform statistics
- `POST /api/admin/verifications/approve/:userId` - Approve verification
- `POST /api/admin/verifications/reject/:userId` - Reject verification

## 📱 Responsive Design

The dashboard is fully responsive with breakpoint-based layouts:

- **Mobile (< 768px)**: Single column layouts
- **Tablet (768px-1024px)**: 2-column grids
- **Desktop (≥ 1024px)**: 3-4 column grids

See **[RESPONSIVE_DESIGN_GUIDE.md](RESPONSIVE_DESIGN_GUIDE.md)** for detailed information.

## 🎨 Design System

### Colors

- **Background**: Gradient (blue → purple → plum)
- **Cards**: Frosted glass with white/20 opacity
- **Text**: Black for maximum readability
- **Accents**: Blue, purple, green, yellow, red

### Components

- **Buttons**: Multiple variants (default, outline, ghost, destructive)
- **Cards**: Frosted glass with hover effects
- **Badges**: Status indicators with color coding
- **Inputs**: Consistent styling throughout

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
vercel
```

### Other Platforms

The dashboard can be deployed to any Node.js hosting platform:

- Vercel (recommended for Next.js)
- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## 🔐 Security

- Clerk authentication with middleware protection
- API requests include credentials (cookie-based auth)
- Protected routes via middleware
- Environment variables for sensitive data

## 📊 Key Pages

### Dashboard Home
- Platform statistics overview
- Quick action buttons
- User, listing, and booking tabs
- Revenue tracking

### Verification Management
- Browse all users with verification status
- Search and filter users
- Click to view verification documents
- Approve or reject with reasons

### User Management
- View all platform users
- Search by name or email
- Filter by account type
- View user details

### Analytics Dashboard
- Platform statistics
- User growth metrics
- Revenue tracking
- Listing analytics

### Super Admin Settings
- General platform settings
- Notification preferences
- Business rules configuration
- Security settings
- Performance optimization

## 🤝 Contributing

This is a private project for the Leli Rentals platform. For questions or issues, contact the development team.

## 📝 License

MIT License - See [LICENSE.md](LICENSE.md) for details

## 🔗 Links

- **Production Admin Dashboard**: [admin.leli.rentals](https://admin.leli.rentals)
- **Main Website**: [www.leli.rentals](https://www.leli.rentals)
- **GitHub Repository**: [evince-dev-254/admin.leli.rentals](https://github.com/evince-dev-254/admin.leli.rentals)
- **Documentation**: See API_SETUP_GUIDE.md and RESPONSIVE_DESIGN_GUIDE.md

## 📞 Support

For support:
1. Check the API_SETUP_GUIDE.md for connection issues
2. Review the RESPONSIVE_DESIGN_GUIDE.md for UI questions
3. Check environment variables configuration
4. Ensure main website API is running

## 🎯 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with Clerk keys
- [ ] Main website running on port 3000
- [ ] API endpoints accessible
- [ ] Development server started (`npm run dev`)
- [ ] Dashboard accessible at http://localhost:3001

---

**Built with ❤️ for Leli Rentals**
