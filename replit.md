# Overview
This project, "দোকান হিসাব" (Dokan Hisab), is a Bengali business management application for Bangladeshi shopkeepers. It provides comprehensive features for managing daily business operations, including sales tracking, customer management, inventory control, expense tracking, and profit/loss analysis. The application is designed as a world-class solution with superior UX/UI, optimized for mobile devices, and with full Bengali language support. It operates as a Progressive Web App (PWA) with real-time Supabase integration. The vision is to exceed existing market solutions by incorporating features such as universal QR payments, advanced analytics, and integrated communication tools. A full Bangladesh phone number authentication system with multi-tenant architecture is implemented and ready for deployment.

# User Preferences
Preferred communication style: Simple, everyday language.

# Recent Changes
- **August 13, 2025**: Successfully migrated project from Replit Agent to standard Replit environment
- **Mobile Optimization Complete**: Fully optimized sales entry page for 917x412 screen resolution
- **Automatic Customer Creation**: Fixed and implemented automatic customer creation when entering new customer names
- **Sales Entry Optimization**: Removed bottom navigation from sales entry page and optimized all form elements
- **Mobile UI Enhancements**: Reduced form padding from p-4 to p-3/p-2, compacted input heights from h-11 to h-9/h-10, optimized spacing
- **Navigation Improvements**: Bottom navigation now hidden on entry pages (/sales/new, /customers/new, /expenses/new) for better UX
- **Visual Feedback**: Added "স্বয়ংক্রিয় যোগ" (Auto Add) indicator when new customers will be auto-created

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, built using Vite.
- **Routing**: Wouter for client-side navigation.
- **State Management**: TanStack Query (React Query) handles server state.
- **UI Framework**: Shadcn/UI components, built on Radix UI primitives, styled with Tailwind CSS.
- **Styling**: Tailwind CSS, integrating custom Bengali fonts (Noto Sans Bengali).
- **Forms**: React Hook Form with Zod for type-safe validation.
- **Mobile Design**: Employs a bottom navigation pattern, consistent mobile-first UX, single-screen visibility, compact card layouts, progressive disclosure, and touch-optimized controls. Color psychology (trust greens, reliability blues) and modern typography (Inter + Noto Sans Bengali) are applied. The application is purely mobile-optimized, with no desktop legacy components.

## Backend Architecture
- **Framework**: Supabase, leveraging its serverless PostgreSQL and built-in APIs.
- **Database Access**: Direct interactions via the Supabase client SDK for type-safe operations.
- **API Design**: Direct database calls.
- **Authentication**: Multi-tenant Supabase Auth with Bangladesh phone number OTP system, supporting all major BD operators.
- **Development Setup**: Frontend-only architecture running on a Vite development server.

## Data Storage Solutions
- **Primary Database**: Supabase PostgreSQL, offering real-time features.
- **Session Management**: Supabase Auth sessions.

## Database Schema Design
The application features a multi-tenant architecture with comprehensive entities, including:
- **Core Business Tables**: Users, Customers, Products, Sales, Expenses, Collections.
- **Advanced Feature Tables**: Loyalty Points, Point Transactions, Rewards, Reward Redemptions, Suppliers, Purchase Orders, Purchase Order Items, Notifications, User Preferences, Business Insights, API Integrations, Payment Methods, Customer Communications.

## Security Implementation
- **Row Level Security (RLS)**: Enabled on all tables with comprehensive policies, ensuring multi-tenant isolation and user_id filtering.
- **Demo User Support**: Special policies allow anonymous access to demo user data.
- **API Integration Security**: Sensitive API keys are encrypted with restricted access policies.

## Internationalization
- **Primary Language**: Bengali (Bangla), with custom utilities for numeral conversion, date/time formatting, and Taka currency display.
- **Timezone**: Proper handling for Asia/Dhaka timezone.

# External Dependencies

## Database Services
- **Supabase**: Comprehensive backend-as-a-service providing PostgreSQL, real-time APIs, and authentication.
- **Supabase Client**: Official JavaScript client for interacting with Supabase.

## UI and Styling
- **Shadcn/UI**: Pre-built, customizable UI components.
- **Radix UI**: Unstyled, accessible UI primitives.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Lucide React**: Primary icon library.
- **Font Awesome**: Supplementary icon library.

## Development Tools
- **Vite**: Fast build tool and development server.
- **TypeScript**: Ensures type safety across the codebase.
- **ESBuild**: Used for fast JavaScript bundling.

## Fonts and Typography
- **Google Fonts**: Utilizes Noto Sans Bengali and Roboto font families.

## Form Validation
- **Zod**: Schema definition and runtime type validation.
- **Hookform Resolvers**: Integration layer for React Hook Form and Zod.