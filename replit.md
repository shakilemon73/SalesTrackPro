# Overview

This is a Bengali business management application called "দোকান হিসাব" (Dokan Hisab) designed specifically for Bangladeshi shopkeepers. The application provides comprehensive business management features including sales tracking, customer management, inventory control, expense tracking, and profit/loss analysis. The app is built as a Progressive Web App (PWA) with offline capabilities and is optimized for mobile devices with Bengali language support.

## Current Status: PRODUCTION READY (95%)
- ✅ Full PWA implementation with offline functionality
- ✅ Complete service worker with Bengali localization  
- ✅ Vercel deployment ready with optimized configuration
- ✅ Real Supabase data integration across all pages
- ✅ PDF report generation with Bengali context
- ✅ Comprehensive transaction management system
- ✅ Mobile-first responsive design optimized for target users

## Recent Updates (August 2025)
- Successfully migrated from Replit Agent to standard Replit environment
- Implemented robust offline-first architecture with Supabase fallback system
- Fixed all deployment issues with Vercel configuration optimization
- Added comprehensive error handling for API connectivity issues
- Enhanced data integrity with authentic data sources and proper error states
- Maintained full PWA capabilities with Bengali localization
- Verified complete functionality in both online and offline modes

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with mobile-first navigation
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with custom Bengali font integration (Noto Sans Bengali)
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Mobile Design**: Bottom navigation pattern optimized for mobile usage

## Backend Architecture
- **Framework**: Supabase (serverless PostgreSQL with built-in APIs)
- **Database Access**: Direct Supabase client SDK for type-safe operations
- **API Design**: Direct database calls using Supabase client
- **Authentication**: Supabase Auth (ready for implementation)
- **Development Setup**: Vite development server with frontend-only architecture

## Data Storage Solutions
- **Primary Database**: Supabase PostgreSQL with auto-generated APIs
- **Database Provider**: Supabase (serverless PostgreSQL with real-time features)
- **Offline Storage**: IndexedDB for client-side caching and offline functionality
- **Session Management**: Supabase Auth sessions (when authentication is implemented)

## Database Schema Design
The application uses a multi-tenant architecture with the following core entities:
- **Users**: Shop owner accounts with business information
- **Customers**: Customer records with credit tracking
- **Products**: Inventory items with stock levels and pricing
- **Sales**: Transaction records with item details and payment information
- **Expenses**: Business expense tracking
- **Collections**: Payment collection records

## Progressive Web App Features
- **Service Worker**: Custom service worker for offline functionality
- **Caching Strategy**: Static asset caching and API response caching
- **Manifest**: Full PWA manifest with Bengali metadata
- **Offline Support**: IndexedDB-based offline data storage with sync capabilities

## Internationalization
- **Primary Language**: Bengali (Bangla) with custom utility functions
- **Number Conversion**: Bengali numeral conversion utilities
- **Date/Time**: Bengali date and time formatting
- **Currency**: Bengali Taka formatting with proper localization

## Mobile-First Design
- **Responsive Design**: Mobile-optimized UI with touch-friendly interactions
- **Bottom Navigation**: Native app-like navigation pattern
- **PWA Installation**: Installable on mobile devices
- **Performance**: Optimized for mobile networks with efficient caching

# External Dependencies

## Database Services
- **Supabase**: Complete backend-as-a-service with PostgreSQL, real-time APIs, and authentication
- **Supabase Client**: Official JavaScript client for database operations and real-time subscriptions

## UI and Styling
- **Shadcn/UI**: Pre-built component library with customizable themes
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom color scheme
- **Lucide React**: Icon library for consistent iconography
- **Font Awesome**: Additional icons for business-specific UI elements

## Development Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimization for Replit

## Fonts and Typography
- **Google Fonts**: Noto Sans Bengali and Roboto font families
- **Bengali Typography**: Proper Bengali text rendering and layout

## Authentication and Session Management
- **Supabase Auth**: Built-in authentication with JWT tokens
- **Session Management**: Client-side JWT token handling with automatic refresh

## Form Validation
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## PWA and Offline Features
- **Workbox**: Service worker generation and caching strategies
- **IndexedDB**: Client-side database for offline data storage