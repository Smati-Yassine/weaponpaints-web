# CS2 WeaponPaints Web Interface

Modern web interface for the CS2 WeaponPaints plugin, allowing players to customize their in-game cosmetic items through a browser-based interface.

## Features

- 🔐 Steam Authentication
- 🔫 Weapon Skin Selection & Configuration
- 🔪 Knife Selection (Team-specific)
- 🧤 Glove Selection (Team-specific)
- 👤 Agent Selection (Team-specific)
- 🎵 Music Kit Selection (Team-specific)
- 📌 Pin Selection (Team-specific)
- 📊 StatTrak Configuration
- 🏷️ Weapon Nametags
- 🎨 Sticker Application (up to 5 per weapon)
- 🔑 Keychain Configuration
- 📱 Responsive Modern UI

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- TanStack Query for server state
- Zustand for client state

### Backend
- Node.js with Express
- TypeScript
- MySQL database
- Passport.js for Steam authentication
- Zod for validation

## Project Structure

```
cs2-weaponpaints-web-interface/
├── backend/          # Backend API server
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── models/   # Data models
│   │   ├── routes/   # API routes
│   │   ├── middleware/ # Express middleware
│   │   ├── services/ # Business logic
│   │   └── utils/    # Utility functions
│   └── package.json
├── frontend/         # Frontend React SPA
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/    # Page components
│   │   ├── hooks/    # Custom hooks
│   │   ├── services/ # API services
│   │   ├── types/    # TypeScript types
│   │   └── utils/    # Utility functions
│   └── package.json
└── package.json      # Root package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL database
- Steam API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. Set up the database:
   - Create a MySQL database
   - The plugin will create the necessary tables

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend (runs on port 5000)
npm run dev --workspace=backend

# Frontend (runs on port 3000)
npm run dev --workspace=frontend
```

### Testing

Run all tests:
```bash
npm test
```

Run tests for specific workspace:
```bash
npm test --workspace=backend
npm test --workspace=frontend
```

### Building

Build for production:
```bash
npm run build
```

### Linting & Formatting

```bash
# Lint all code
npm run lint

# Format all code
npm run format
```

## API Documentation

The backend API provides RESTful endpoints for:
- Authentication (`/api/auth/*`)
- Item data (`/api/items/*`)
- Player configurations (`/api/player/*`)

See the design document for detailed API specifications.

## Testing Strategy

The project uses a dual testing approach:
- **Unit Tests**: Specific examples and edge cases
- **Property-Based Tests**: Universal correctness properties using fast-check

All tests must pass before deployment.

## License

This project is part of the CS2 WeaponPaints plugin ecosystem.
