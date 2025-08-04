# TKD API

REST API for Taekwondo studio management built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Authentication System**
  - JWT-based authentication
  - User registration and login
  - Role-based access control (member, admin)
  - Protected routes with middleware

- **Database**
  - PostgreSQL with connection pooling
  - Zod schemas for runtime validation
  - Migration system for schema changes
  - Indexed queries for performance

- **Security**
  - Password hashing with bcrypt
  - Parameterized queries (SQL injection protection)
  - JWT token validation
  - Environment variable configuration

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Validation**: Zod schemas
- **Development**: ts-node with watch mode

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tkd-api.git
cd tkd-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

4. Run database migrations
```bash
psql "your-database-url" -f src/database/migrations/001-initial-schema.sql
```

5. Start development server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Health Check
- `GET /health` - Database connectivity check

### Protected Routes
- `GET /protected` - Test endpoint (requires authentication)

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

## Database Schema

### Users Table
- `id` - Auto-incrementing primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `name` - User's full name
- `role` - User role (member, admin)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Project Structure
```
src/
├── index.ts              # Main application entry point
├── routes/               # API route handlers
│   └── auth.ts
├── middleware/           # Express middleware
│   └── authMiddleware.ts
├── types/                # TypeScript type definitions
│   └── user.ts
└── database/
    ├── schema.sql        # Initial database schema
    └── migrations/       # Database migration files
        └── 001-initial-schema.sql
```

## Deployment

This API is designed to be deployed on Railway, Heroku, or similar platforms with PostgreSQL support.

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables in Railway dashboard
4. Deploy automatically on git push

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the ISC License.