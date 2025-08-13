# Overview
This project, "দোকান হিসাব" (Dokan Hisab), is a Bengali business management application for Bangladeshi shopkeepers. It provides comprehensive features for managing daily business operations, including sales tracking, customer management, inventory control, expense tracking, and profit/loss analysis. The application is designed as a world-class solution with superior UX/UI, optimized for mobile devices, and with full Bengali language support. It operates as a Progressive Web App (PWA) with real-time Supabase integration. The vision is to exceed existing market solutions by incorporating features such as universal QR payments, advanced analytics, and integrated communication tools. A full Bangladesh phone number authentication system with multi-tenant architecture is implemented and ready for deployment.

# User Preferences
Preferred communication style: Simple, everyday language.

# Recent Changes
- **August 13, 2025**: FINAL MIGRATION COMPLETED - Successfully migrated project from Replit Agent to standard Replit environment
- **Customer Navigation Fixed**: Resolved 404 error page issue when clicking customer profiles by adding proper authentication loading states and null checks
- **Database Query Optimization**: Fixed null user ID database errors by implementing proper query guards and loading states
- **TypeScript Errors Resolved**: Fixed all parseFloat type issues and null reference errors across customer components
- **Authentication Flow Improved**: Added proper loading states to prevent premature query execution before user authentication
- **Skeleton Screens Implemented**: Added beautiful skeleton loading screens for better UX across customer pages and dashboard
- **Customer Edit/Delete System**: Implemented complete customer edit and delete functionality with proper routing, forms, and confirmation dialogs
- **Route Order Fixed**: Resolved 404 error for customer edit page by reordering routes (specific routes must come before general routes in Wouter)
- **Parameter Order Fixed**: Corrected customer edit page API calls to use proper userId/customerId parameter order
- **TypeScript Errors Resolved**: Fixed all parseFloat type issues and null reference errors across customer components
- **Authentication Flow Improved**: Added proper loading states to prevent premature query execution before user authentication
- **Migration Completed**: Fixed all authentication issues, RLS policy violations resolved, TypeScript errors addressed
- **Authentication Fixed**: Removed DEMO_USER_ID fallback, added proper null checks for userId across all components
- **Database Integration Verified**: Supabase connection working properly with real user authentication
- **RLS Policy Issue Fixed**: Added user profile creation during customer creation to resolve RLS policy violations
- **Auto Customer Creation Fixed**: Enhanced customer creation with proper user profile verification
- **Authentication System Updated**: Changed from Bangladesh phone OTP to email-based user registration and login system
- **Real User Authentication**: Implemented proper Supabase authentication with email/password, including automatic user profile creation
- **User Isolation Complete**: All CURRENT_USER_ID references replaced with dynamic useAuth hook across all components
- **Database Connection Verified**: Supabase integration working with real user data isolation and multi-tenant architecture
- **DOM Nesting Error Fixed**: Resolved invalid HTML structure in dashboard header by changing `<p>` tags to `<div>` tags
- **Business Metrics Removed**: Removed business metrics bar from dashboard header as requested by user
- **Floating Action Button Alignment Fixed**: Corrected text alignment issues for Bengali labels (বিক্রয়, গ্রাহক, খরচ) with their corresponding icons
- **CSS ROOT PROBLEM FIXED**: Identified and permanently resolved persistent styling issues by eliminating CSS conflicts, duplications, and mismatched configurations
- **Unified Design System**: Consolidated CSS variables, removed duplicate loading/animation definitions, and synchronized SHADCN/Tailwind configurations
- **Mobile Optimization Complete**: Fully optimized dashboard "ব্যবসার খবর" section and all mobile layouts for 917x412 screen resolution
- **Automatic Customer Creation**: Fixed and implemented automatic customer creation when entering new customer names
- **Sales Entry Optimization**: Removed bottom navigation from sales entry page and optimized all form elements
- **Mobile UI Enhancements**: Reduced form padding from p-4 to p-3/p-2, compacted input heights from h-11 to h-9/h-10, optimized spacing
- **Navigation Improvements**: Bottom navigation now hidden on entry pages (/sales/new, /customers/new, /expenses/new) for better UX
- **Visual Feedback**: Added "স্বয়ংক্রিয় যোগ" (Auto Add) indicator when new customers will be auto-created
- **Styling System Stability**: Fixed root causes: removed CSS conflicts, unified mobile breakpoints, synchronized component configurations, eliminated duplicate selectors

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
- **Authentication**: Multi-tenant Supabase Auth with email-based user registration and login system, including automatic user profile creation.
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