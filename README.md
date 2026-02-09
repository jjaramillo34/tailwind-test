# District 79 Arts Grant Events

A Next.js application for managing and registering for District 79 Arts Grant events, including Broadway shows and cultural experiences throughout New York City.

## Features

### 🎭 Event Management
- **Event Listings**: Beautiful homepage displaying available events with real-time ticket availability
- **Event Categories**: Separate sections for Broadway shows and cultural experiences
- **Real-time Availability**: Automatically calculates and displays available tickets based on registrations
- **Sold-out Filtering**: Events with no available tickets are automatically hidden from the homepage

### 📝 Registration System
- **Single Event Registration**: Register for individual events
- **Bulk Registration**: Register for multiple events in one transaction
- **Program Types**: Separate registration flows for AdultEd and general programs
- **Smart Validation**:
  - Maximum 10 tickets per user per event
  - Maximum 10 tickets per school per event
  - Email domain validation (@schools.nyc.gov)
  - Real-time availability checking
- **School Dropdown**: Predefined list of schools for consistent data entry
- **Registration Success Page**: Detailed confirmation with registration summary

### 🔐 Admin Dashboard
- **Secure Authentication**: Password-protected admin access
- **Event Management**:
  - Create new events
  - Update existing events
  - Delete events
  - View all events with details
- **Registration Management**:
  - View all registrations in a searchable table
  - Filter by event, school, or email
  - Delete registrations with confirmation
  - Export registrations to CSV
- **Settings**:
  - Change admin password
  - System information
- **Tabbed Interface**: Organized sections for Events, Registrations, and Settings

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI built with Tailwind CSS
- **Icons**: Lucide React icons throughout the interface
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Footer**: Contact information and quick links

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Session-based with HTTP-only cookies

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or cloud instance like MongoDB Atlas)
- Environment variables configured (see below)

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```
   
   **Note**: You can also use `DATABASE_URL` instead of `MONGODB_URI`.

4. **Seed the database** (optional):
   ```bash
   npm run seed
   ```
   This will populate the database with initial event data.

5. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `DATABASE_URL` | Alternative to MONGODB_URI | No | - |
| `ADMIN_PASSWORD` | Admin dashboard password | Yes | `admin123` |

## Database Setup

### MongoDB Connection
The application uses MongoDB with Mongoose for data management. Ensure your MongoDB instance is running and accessible.

### Database Models

#### Event
- `title`: Event name
- `description`: Event description
- `date`: Event date and time
- `location`: Event venue address
- `maxSeats`: Maximum number of tickets available
- `program`: Event program type (`AdultEd` or `No-AdultEd`)

#### EventsRegistration
- `firstName`: Registrant's first name
- `lastName`: Registrant's last name
- `email`: Registrant's email (must be @schools.nyc.gov)
- `school`: School name (from predefined list)
- `position`: Registrant's position
- `eventId`: Reference to the event
- `ticketQuantity`: Number of tickets requested

## Usage

### Public Pages

- **Homepage** (`/`): View all available events with ticket availability
- **Register for Programs** (`/register-programs`): Registration form for general programs
- **Register for AdultEd** (`/register-adulted`): Registration form for AdultEd programs
- **Registration Success** (`/registration-success`): Confirmation page after successful registration

### Admin Dashboard

1. **Access the dashboard**: Navigate to `/dashboard`
2. **Login**: Enter the admin password (set in `ADMIN_PASSWORD` environment variable)
3. **Manage Events**: Create, update, or delete events in the "Events Management" tab
4. **View Registrations**: Browse and manage registrations in the "Registrations" tab
5. **Settings**: Change password and view system info in the "Settings" tab

## API Endpoints

### Registration
- `POST /api/register` - Register for a single event
- `POST /api/register/bulk` - Register for multiple events
- `GET /api/registration/[id]` - Get registration details

### Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/events` - Get all events
- `POST /api/admin/events` - Create new event
- `GET /api/admin/events/[id]` - Get single event
- `PUT /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event
- `DELETE /api/admin/registrations/[id]` - Delete registration
- `POST /api/admin/change-password` - Change admin password

## Registration Rules

1. **Email Validation**: Must be from `@schools.nyc.gov` domain
2. **Per-User Limit**: Maximum 10 tickets per user per event
3. **Per-School Limit**: Maximum 10 tickets per school per event
4. **Availability Check**: Cannot exceed available tickets for the event
5. **Duplicate Prevention**: One registration per email per event (can be updated)

## Available Schools

The following schools are available in the registration dropdown:
- P2G MANHATTAN
- P2G BROOKLYN
- P2G QUEENS
- P2G STATEN ISLAND
- P2G BRONX
- LYFE
- RESTART
- COOP TECH
- PASSAGES BRONX
- PASSAGES BROOKLYN
- ALC QUEENS

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── admin/        # Admin endpoints
│   │   │   └── register/      # Registration endpoints
│   │   ├── dashboard/         # Admin dashboard pages
│   │   ├── register/         # Registration components
│   │   └── page.tsx          # Homepage
│   ├── lib/
│   │   ├── models/           # Mongoose models
│   │   ├── auth.ts           # Authentication utilities
│   │   └── mongodb.ts        # MongoDB connection
│   └── ...
├── prisma/
│   └── seed.ts              # Database seed script
└── ...
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with initial events

## Contact

For questions about events and registration:
- **Nyesha Green**: NGreene4@schools.nyc.gov
- **Javier Jaramillo**: jjaramillo7@schools.nyc.gov

## License

This project is for District 79 Arts Grant Events management.

---

Built with [Next.js](https://nextjs.org) and [MongoDB](https://www.mongodb.com)
