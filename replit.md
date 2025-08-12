# Overview

This project, "দোকান হিসাব" (Dokan Hisab), is a Bengali business management application designed for Bangladeshi shopkeepers. Its primary purpose is to provide comprehensive features for managing daily business operations, including sales tracking, customer management, inventory control, expense tracking, and profit/loss analysis. The application aims to be a world-class solution with superior UX/UI, optimized for mobile devices, and with full Bengali language support. It is deployed as a Progressive Web App (PWA), though currently operates exclusively online with real-time Supabase integration. The vision is to exceed the capabilities of existing market solutions like TaliKhata, HishabPati, Khatabook, and Vyapar by incorporating features such as universal QR payments, advanced analytics, and integrated communication tools.

**AUTHENTICATION STATUS**: ✅ Complete - Full Bangladesh phone number authentication system with multi-tenant architecture implemented and ready for deployment.

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
- **Authentication**: ✅ COMPLETE - Multi-tenant Supabase Auth with Bangladesh phone number OTP system. Supports all major BD operators (গ্রামীণফোন, রবি, বাংলালিংক, টেলিটক, এয়ারটেল, সিটিসেল).
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

### Security Implementation (Added 2025-08-12):
- **Row Level Security (RLS)**: All 19 tables have RLS enabled with 43 comprehensive policies
- **Demo User Support**: Special policies allow anonymous access to demo user data (UUID: 11111111-1111-1111-1111-111111111111)
- **Multi-tenant Isolation**: Each user can only access their own data through user_id filtering
- **API Integration Security**: Sensitive API keys are encrypted and have restricted access policies
- **Cross-table Security**: Purchase order items are secured through parent purchase order user_id validation
- **Graduated Access**: API integrations have read-only access for anonymous users, full access for authenticated users

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

# Recent Changes

## Authentication System Completion (2025-08-12)
✅ **AUTHENTICATION SYSTEM FULLY IMPLEMENTED** - Complete multi-tenant authentication system specifically optimized for Bangladesh users:

### Core Authentication Features:
- **Bangladesh Phone Number Validation**: Comprehensive support for all major operators (Grameenphone 017/013, Robi 018, Banglalink 019/014, Teletalk 015, Airtel 016, Citycell 011)
- **Real-time Operator Detection**: Auto-detects mobile operator and displays colored badges during input
- **Smart Phone Formatting**: Intelligent formatting handles various input formats (+88, 88, 01, 1, etc.)
- **OTP Authentication**: 6-digit SMS OTP with 60-second countdown and resend functionality
- **Session Management**: Persistent sessions with auto-refresh and secure token handling

### Multi-tenant Architecture:
- **AuthContext**: Comprehensive authentication state management with user sessions
- **AuthGuard**: Route protection system that redirects unauthenticated users
- **User Profile System**: Complete user profile management with business information
- **Subscription Management**: Tiered subscription system with feature access control

### Database Schema:
- **Enhanced Users Table**: Business-focused user profiles with Bangladesh-specific fields
- **Subscriptions Table**: Multi-tier subscription system (free trial, basic, pro, enterprise)
- **Subscription Features**: Granular feature control per subscription tier
- **RLS Policies**: Row-level security ensuring complete data isolation between tenants

### Bangladesh-Specific Optimizations:
- **Phone Number Utils**: Complete utility library for Bangladesh phone number handling
- **Business Categories**: Pre-configured categories popular in Bangladesh market
- **Currency Formatting**: Bengali numeral support and Taka formatting
- **Mobile Banking**: Support for bKash, Nagad, Rocket payment integration prep
- **Operator Detection**: Real-time mobile operator identification with market share data

### Authentication Files:
- `client/src/contexts/AuthContext.tsx` - Main authentication context
- `client/src/components/auth/AuthGuard.tsx` - Route protection
- `client/src/pages/auth/PhoneAuthMobile.tsx` - Mobile-optimized phone auth
- `client/src/pages/auth/SubscriptionSelectMobile.tsx` - Subscription selection
- `client/src/hooks/useUserProfile.tsx` - User profile management
- `client/src/lib/supabase-auth-service.ts` - Enhanced auth service functions
- `client/src/lib/bangladesh-phone-utils.ts` - Bangladesh phone number utilities
- `client/src/lib/bangladesh-specific-features.ts` - Bangladesh business features
- `client/src/lib/database-schema.sql` - Complete auth-ready database schema

### Ready for Deployment:
The authentication system is production-ready and specifically designed for the Bangladesh market. All major Bangladesh mobile operators are supported, and the system includes comprehensive error handling, user feedback, and security measures appropriate for financial/business applications.

## Android APK Conversion Complete (2025-08-12)
✅ **ANDROID DEPLOYMENT READY** - Complete Android APK conversion using Capacitor framework:

### Core Android Features:
- **Native Android Project**: Complete Android project structure generated in `/android` folder
- **APK Signing Configuration**: Proper debug keystore and signing configuration for installation
- **Bengali App Configuration**: App name "দোকান হিসাব" with package ID `com.dokan.hisab`
- **Gradle Build Optimization**: Fixed all build warnings including flatDir and unchecked operations
- **Android Permissions**: Camera, storage, internet access properly configured for business app features

### Build Process:
- **Clean Gradle Configuration**: Resolved flatDir warnings and unchecked operations
- **Proper Java Compatibility**: Standardized Java 11 across all modules
- **APK Generation**: Debug APK builds successfully for installation on Android devices
- **Installation Fix**: Resolved "Package appears to be invalid" error through proper signing

### Deployment Options:
- **Android APK**: Native mobile app for offline use and device integration
- **Progressive Web App**: Web-based deployment for instant access across all devices  
- **Replit Hosting**: Direct access via web URL with add-to-home-screen capability
- **Professional Deployment**: Vercel/Netlify hosting for production use

### Android Build Files:
- `android/` - Complete Capacitor-generated Android project
- `android/app/build.gradle` - Main app configuration with signing
- `android/app/src/main/AndroidManifest.xml` - App permissions and metadata
- `capacitor.config.json` - Capacitor configuration for web-to-native conversion
- `ANDROID_BUILD_SOLUTION.md` - Complete build and troubleshooting guide

### Ready for Distribution:
The app can now be distributed as a native Android APK, published to Google Play Store, or deployed as a Progressive Web App. All build warnings have been resolved and the APK installs successfully on Android devices.