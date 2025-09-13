# Buyer Leads Management App

A comprehensive Next.js application for capturing, listing, and managing buyer leads with validation, search/filter capabilities, and CSV import/export functionality.

## 🚀 Features

### Core Functionality
- **Lead Management**: Create, view, edit, and delete buyer leads
- **Advanced Search & Filtering**: Search by name, phone, email, or notes with URL-synced filters
- **CSV Import/Export**: Bulk import leads from CSV files and export filtered lists
- **Lead History Tracking**: Track all changes to leads with detailed audit trail
- **Real-time Validation**: Client and server-side validation with Zod schemas

### Data Model
- **Buyers Table**: Complete lead information with all required fields
- **History Tracking**: Automatic change tracking with user attribution
- **Ownership Control**: Users can only edit their own leads
- **Concurrent Update Protection**: Prevents data conflicts with optimistic locking

### User Experience
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Error Handling**: Comprehensive error boundaries and user-friendly messages
- **Loading States**: Optimistic updates with proper loading indicators

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Database**: SQLite with Drizzle ORM
- **Validation**: Zod schemas with React Hook Form
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Heroicons
- **Testing**: Jest + React Testing Library
- **Authentication**: Simple demo authentication system

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd buyer_lead
npm install
\`\`\`

### 2. Environment Setup

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="file:./local.db"

# Auth (for demo purposes)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Demo users
DEMO_USER_ID="demo-user-1"
DEMO_USER_EMAIL="demo@example.com"
\`\`\`

### 3. Database Setup

The database will be automatically initialized when you first run the application. The SQLite database file (\`local.db\`) will be created in the project root.

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Data Schema

### Buyers Table
\`\`\`sql
- id (uuid, primary key)
- fullName (string, 2-80 chars)
- email (string, optional)
- phone (string, 10-15 digits)
- city (enum: Chandigarh|Mohali|Zirakpur|Panchkula|Other)
- propertyType (enum: Apartment|Villa|Plot|Office|Retail)
- bhk (enum: 1|2|3|4|Studio, required for Apartment/Villa)
- purpose (enum: Buy|Rent)
- budgetMin/budgetMax (integer, INR)
- timeline (enum: 0-3m|3-6m|>6m|Exploring)
- source (enum: Website|Referral|Walk-in|Call|Other)
- status (enum: New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped)
- notes (text, max 1000 chars)
- tags (string array)
- ownerId (user reference)
- createdAt/updatedAt (timestamps)
\`\`\`

### Buyer History Table
\`\`\`sql
- id (uuid, primary key)
- buyerId (foreign key)
- changedBy (user reference)
- changedAt (timestamp)
- diff (JSON of changed fields)
\`\`\`

## 🎯 API Endpoints

### Buyers
- \`GET /api/buyers/export\` - Export filtered buyers as CSV
- \`GET /api/buyers/[id]\` - Get buyer by ID
- \`PUT /api/buyers/[id]\` - Update buyer
- \`DELETE /api/buyers/[id]\` - Delete buyer

### Rate Limiting
- Create: 10 requests/minute
- Update: 20 requests/minute
- CSV Import: 5 requests/minute

## 🧪 Testing

Run the test suite:

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check
\`\`\`

### Test Coverage
- **Validation Schemas**: Zod schema validation tests
- **CSV Processing**: Import/export functionality tests
- **Budget Validation**: Cross-field validation tests
- **BHK Requirements**: Conditional field validation tests

## 📁 Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router pages
│   ├── buyers/            # Buyer management pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── buyers/            # Buyer-specific components
│   ├── csv/               # CSV import/export components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── db/                # Database configuration
│   ├── auth.ts            # Authentication utilities
│   ├── buyers.ts          # Buyer CRUD operations
│   ├── csv.ts             # CSV processing utilities
│   ├── rate-limit.ts      # Rate limiting
│   ├── validations.ts     # Zod schemas
│   └── utils.ts           # General utilities
└── __tests__/             # Test files
\`\`\`

## 🔧 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm test\` - Run test suite
- \`npm run db:generate\` - Generate database migrations
- \`npm run type-check\` - Run TypeScript type checking

## 🎨 Design Decisions

### Validation Strategy
- **Client-side**: Immediate feedback with React Hook Form + Zod
- **Server-side**: API route validation with proper error responses
- **Cross-field validation**: Budget min/max and BHK requirements

### SSR vs Client-side
- **Server-side**: Initial page loads, search results, and data fetching
- **Client-side**: Form interactions, real-time search, and optimistic updates

### Ownership Enforcement
- All CRUD operations check \`ownerId\` against current user
- Users can read all leads but only modify their own
- History tracking includes user attribution for all changes

### Concurrency Control
- \`updatedAt\` timestamps prevent concurrent modification conflicts
- Optimistic locking with user-friendly error messages
- Automatic retry mechanisms for transient failures

## ✅ Completed Features

### Must-Have Features ✅
- [x] Next.js App Router with TypeScript
- [x] SQLite database with Drizzle ORM and migrations
- [x] Zod validation schemas
- [x] Simple authentication system
- [x] Complete CRUD operations with ownership
- [x] Create/Edit forms with validation
- [x] List view with search, filters, and pagination
- [x] CSV import/export functionality
- [x] Buyer history tracking
- [x] Unit tests for validation and CSV processing
- [x] Error boundaries and accessibility
- [x] Rate limiting on API endpoints

### Nice-to-Have Features ✅
- [x] Tag chips with add/remove functionality
- [x] Status quick-actions in table view
- [x] Full-text search across multiple fields
- [x] Optimistic updates with error handling

## 🚫 Skipped Features

### Optional Features Not Implemented
- **File Upload**: Single attachment per buyer (not implemented due to scope)
- **Advanced Admin Role**: Simple user model without role differentiation
- **Email Notifications**: No email integration (would require email service)
- **Advanced Analytics**: Basic dashboard only (would need chart libraries)
- **Real-time Updates**: No WebSocket implementation

### Reasoning
- Focused on core functionality as specified in requirements
- File upload adds complexity without clear value for lead management
- Admin roles not specified in requirements
- Email integration requires external service setup
- Analytics beyond basic counts not specified

## 🐛 Known Issues

- SQLite database file created in project root (should be in data directory)
- Rate limiting uses in-memory storage (not suitable for production scaling)
- Demo authentication only (no real auth provider integration)
- No data backup/restore functionality

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
\`\`\`env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="your-production-url"
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js, Drizzle ORM, and Tailwind CSS
- Icons provided by Heroicons
- UI components from Radix UI
- Validation powered by Zod