# Overview

This is a Bengali business management application called "দোকান হিসাব" (Dokan Hisab) designed specifically for Bangladeshi shopkeepers. The application provides comprehensive business management features including sales tracking, customer management, inventory control, expense tracking, and profit/loss analysis. The app is built as a Progressive Web App (PWA) with offline capabilities and is optimized for mobile devices with Bengali language support.

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
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with structured route handlers
- **Session Management**: Express sessions with PostgreSQL session store
- **Development Setup**: Vite development server with HMR integration

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Offline Storage**: IndexedDB for client-side caching and offline functionality
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

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
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migrations and schema management

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
- **Express Session**: Server-side session management
- **Connect PG Simple**: PostgreSQL session store integration

## Form Validation
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## PWA and Offline Features
- **Workbox**: Service worker generation and caching strategies
- **IndexedDB**: Client-side database for offline data storage