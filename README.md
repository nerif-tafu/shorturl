# ShortURL Generator

A comprehensive short URL generator built with SvelteKit, featuring advanced analytics, password protection, and custom slugs.

## Features

### 🔗 URL Management
- **Custom Slugs**: Create memorable custom URLs or use auto-generated 5-character slugs
- **Expiration Dates**: Set URLs to expire at specific dates and times
- **Password Protection**: Secure URLs with password authentication
- **URL Editing**: Modify existing URLs after creation
- **Bulk Management**: View and manage all your URLs in one dashboard

### 📊 Analytics & Tracking
- **Click Tracking**: Monitor how many times each URL is clicked
- **Detailed Analytics**: View IP addresses, user agents, referrers, and timestamps
- **Real-time Stats**: Dashboard with total URLs, clicks, active URLs, and protected URLs
- **Export Ready**: Analytics data available via API for further processing

### 🔐 Authentication
- **User Registration**: Create accounts with email and password
- **Secure Login**: JWT-based authentication system
- **User Dashboard**: Personalized dashboard for authenticated users
- **Session Management**: Automatic token handling and logout functionality

### 🎨 Modern UI
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Tailwind CSS**: Beautiful, modern styling with utility classes
- **Interactive Elements**: Smooth animations and hover effects
- **Copy to Clipboard**: One-click copying of generated URLs

## Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Deployment**: Ready for Vercel, Netlify, or any SvelteKit-compatible platform

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shorturl
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo 'DATABASE_URL="file:./dev.db"' > .env
   echo 'JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"' >> .env
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

### Creating Short URLs

1. **Visit the homepage** and enter your long URL
2. **Choose options**:
   - Use custom slug (optional)
   - Add title and description (optional)
   - Set expiration date (optional)
   - Add password protection (optional)
3. **Click "Create Short URL"** to generate your link
4. **Copy the short URL** and share it!

### Managing Your URLs

1. **Sign up or log in** at `/auth`
2. **Access your dashboard** at `/dashboard`
3. **View analytics** by clicking "Analytics" on any URL
4. **Delete URLs** you no longer need
5. **Track performance** with real-time statistics

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in

#### URL Management
- `POST /api/urls` - Create short URL
- `GET /api/urls` - Get user's URLs (authenticated)
- `PUT /api/urls/[id]` - Update URL (authenticated)
- `DELETE /api/urls/[id]` - Delete URL (authenticated)

#### Analytics
- `GET /api/urls/[id]/clicks` - Get click analytics (authenticated)

#### URL Redirection
- `GET /[slug]` - Redirect to original URL

## Database Schema

The application uses a SQLite database with the following structure:

### Users
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `createdAt` - Account creation date
- `updatedAt` - Last update date

### URLs
- `id` - Unique identifier
- `originalUrl` - The long URL to shorten
- `slug` - Short URL identifier (unique)
- `title` - Optional title
- `description` - Optional description
- `isCustom` - Whether slug was custom or auto-generated
- `expiresAt` - Optional expiration date
- `isActive` - Whether URL is active
- `password` - Optional password for protection
- `userId` - Associated user (optional)
- `createdAt` - Creation date
- `updatedAt` - Last update date

### Clicks
- `id` - Unique identifier
- `urlId` - Associated URL
- `ip` - Visitor IP address
- `userAgent` - Browser/device information
- `referer` - Referring URL
- `country` - Visitor country (if available)
- `city` - Visitor city (if available)
- `region` - Visitor region (if available)
- `timestamp` - Click timestamp

## Deployment

### Environment Variables

For production, update your `.env` file:

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
```

### Database Migration

For production deployment:

```bash
npx prisma migrate deploy
```

### Build and Deploy

```bash
npm run build
```

The built application will be in the `.svelte-kit` directory, ready for deployment to any SvelteKit-compatible platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.
