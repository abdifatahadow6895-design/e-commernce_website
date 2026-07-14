# NexShop - Premium E-Commerce Platform

A modern, full-stack e-commerce application built with React, TypeScript, Tailwind CSS, Node.js, Express.js, MongoDB, Redis, and Socket.io.

![NexShop](https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200)

## Features

- AI-powered product recommendations and frequently-bought-together suggestions
- Real-time notifications and live order updates with Socket.io
- PWA support with installable mobile experience
- GitHub Actions CI/CD and Docker deployment support
- Redis caching and sales forecasting for analytics
- Advanced admin dashboard, order tracking, and support ticket flow
- Swagger API docs at /api/docs

### Customer Features
- **Shop & Browse** - Product catalog with search, filters, sorting, and pagination
- **Product Details** - Image zoom, reviews, related products, specifications
- **Shopping Cart & Checkout** - Coupon codes, multiple payment methods
- **User Account** - Profile, address management, order history, loyalty points
- **Wishlist & Compare** - Save favorites and compare up to 4 products
- **Multi-language** - English, Spanish, French, Swahili (i18next)
- **Currency Switcher** - USD, EUR, GBP, KES, NGN
- **Dark/Light Mode** - System-wide theme toggle
- **AI Chatbot** - NexBot live support assistant
- **Flash Sales** - Time-limited deals with countdown

### Authentication & Security
- JWT authentication with refresh tokens
- Email verification & password reset
- Two-Factor Authentication (2FA/TOTP)
- Google & GitHub OAuth sign-in
- Role-based authorization (customer, admin, moderator)
- bcrypt password hashing, Helmet, CORS, XSS protection
- MongoDB injection prevention, rate limiting

### Payment Gateways
- Stripe (Visa, Mastercard, Google Pay, Apple Pay)
- PayPal, M-Pesa, Cash on Delivery

### Admin Dashboard
- Sales analytics & revenue charts
- Product, category, brand, order management
- User management, review moderation
- Coupon & banner management
- Low stock alerts, CSV export
- PDF invoice generation

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| State | Zustand, TanStack React Query |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, Passport.js, Speakeasy (2FA) |
| Payments | Stripe, PayPal, M-Pesa |
| Email/SMS | Nodemailer, Twilio (configurable) |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7+ (or Docker)

### Installation

```bash
# Clone and install
cd nexshop
npm run install:all

# Start MongoDB (Docker)
docker-compose up -d

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your settings

# Seed database with sample data
npm run seed

# Start development servers
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexshop.com | Admin123! |
| Customer | customer@nexshop.com | Customer123! |

## Project Structure

```
nexshop/
├── client/          # React frontend (Vite + TypeScript)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route pages
│       ├── services/     # API client
│       ├── store/        # Zustand state
│       ├── i18n/         # Translations
│       └── types/        # TypeScript types
├── server/          # Express backend
│   └── src/
│       ├── config/       # App configuration
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Auth, security, validation
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API routes
│       ├── services/     # Business logic
│       └── seed/         # Database seeder
├── docker-compose.yml
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/products | List products |
| GET | /api/products/:slug | Product details |
| GET/POST | /api/cart | Cart operations |
| POST | /api/orders | Create order |
| GET | /api/admin/dashboard | Admin analytics |

## Environment Variables

See `server/.env.example` for all configuration options including:
- MongoDB URI, JWT secrets
- SMTP email settings
- Stripe, PayPal, M-Pesa credentials
- Google/GitHub OAuth keys
- Twilio SMS settings

## Production Deployment

```bash
# Build
npm run build

# Start production server
NODE_ENV=production npm start
```

### Production Checklist

- Set strong `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET` in `server/.env`
- Configure MongoDB (`MONGODB_URI`), SMTP, Stripe keys, and OAuth credentials
- Set `STRIPE_WEBHOOK_SECRET` and point Stripe webhooks to `/api/payments/stripe/webhook`
- Serve the client build from Express or deploy separately (Vercel/Netlify for frontend, Railway/Render for backend)

### Recent Improvements

- **Secure payments**: Stripe Elements checkout, webhook confirmation, pending payment flow
- **Auth**: Token refresh endpoint, OAuth redirect flow, reset/verify email pages, 2FA UI
- **Admin**: Nested dashboard with product and order management
- **UX**: Compare page, track order, mobile search, cart/wishlist sync, error boundary
- **SEO**: robots.txt, sitemap.xml, structured data on product pages
- **API**: Contact form, image uploads, health check with DB status, graceful shutdown

## License

MIT
