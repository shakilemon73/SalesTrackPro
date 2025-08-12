# Overview

This project, "দোকান হিসাব" (Dokan Hisab), is a Bengali business management application designed for Bangladeshi shopkeepers. Its primary purpose is to provide comprehensive features for managing daily business operations, including sales tracking, customer management, inventory control, expense tracking, and profit/loss analysis. The application aims to be a world-class solution with superior UX/UI, optimized for mobile devices, and with full Bengali language support. It is deployed as a Progressive Web App (PWA), though currently operates exclusively online with real-time Supabase integration. The vision is to exceed the capabilities of existing market solutions like TaliKhata, HishabPati, Khatabook, and Vyapar by incorporating features such as universal QR payments, advanced analytics, and integrated communication tools.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, built using Vite.
- **Routing**: Wouter for client-side navigation.
- **State Management**: TanStack Query (React Query) handles server state.
- **UI Framework**: Shadcn/UI components, built on Radix UI primitives, styled with Tailwind CSS.
- **Styling**: Tailwind CSS, integrating custom Bengali fonts (Noto Sans Bengali).
- **Forms**: React Hook Form with Zod for type-safe validation.
- **Mobile Design**: Employs a bottom navigation pattern, consistent mobile-first UX across all pages, single-screen visibility, compact card layouts, progressive disclosure, and touch-optimized controls. Color psychology (trust greens, reliability blues) and modern typography (Inter + Noto Sans Bengali) are applied.

## Backend Architecture
- **Framework**: Supabase, leveraging its serverless PostgreSQL and built-in APIs.
- **Database Access**: Direct interactions via the Supabase client SDK for type-safe operations.
- **API Design**: Direct database calls.
- **Authentication**: Supabase Auth is integrated and ready for use.
- **Development Setup**: Frontend-only architecture running on a Vite development server.

## Data Storage Solutions
- **Primary Database**: Supabase PostgreSQL.
- **Database Provider**: Supabase, offering real-time features.
- **Session Management**: Supabase Auth sessions (when authentication is active).

## Database Schema Design
The application features a multi-tenant architecture with comprehensive entities:

### Core Business Tables:
- **Users**: Shop owner accounts and business information (enhanced with business_name, email fields)
- **Customers**: Records for customer management and credit tracking
- **Products**: Inventory items with enhanced fields (supplier_id, barcode, expiry_date, location)
- **Sales**: Transaction details with item and payment information
- **Expenses**: Tracking of business expenditures
- **Collections**: Records for payment collection

### Advanced Feature Tables (Added 2025-08-12):
- **Loyalty Points**: Customer loyalty program with points, tiers, lifetime spending tracking
- **Point Transactions**: Detailed log of points earned, redeemed, expired with reasons
- **Rewards**: Configurable rewards system with tier-based eligibility
- **Reward Redemptions**: Track reward usage with coupon codes and expiry
- **Suppliers**: Vendor management with performance ratings and payment terms
- **Purchase Orders**: Supply chain management with order tracking
- **Purchase Order Items**: Line items for purchase orders with received quantities
- **Notifications**: Multi-channel notification system (SMS, WhatsApp, email, system)
- **User Preferences**: Flexible key-value configuration storage
- **Business Insights**: Cached analytics and AI-generated insights
- **API Integrations**: Third-party service configurations (WhatsApp, SMS, payment gateways)
- **Payment Methods**: Multiple payment options including mobile banking (bKash, Rocket, Nagad)
- **Customer Communications**: Log of all customer interactions across channels

## Internationalization
- **Primary Language**: Bengali (Bangla), with custom utilities for numeral conversion, date/time formatting, and Taka currency display.
- **Timezone**: Proper handling for Asia/Dhaka timezone across all date/time operations and database queries.

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