# MessHub

Multi-tenant Mess Attendance & Management Platform.

## Architecture

This project is a MERN stack application.

- **Frontend**: React (Vite), Tailwind CSS, React Router, Context API.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), ES6 Modules.

## Folder Structure

- `/frontend` - Vite React App
  - `/src/components` - Reusable UI components
  - `/src/pages` - Page components (Home, Login, Dashboard)
  - `/src/context` - React Context (AuthContext)
  - `/src/hooks` - Custom React hooks
  - `/src/services` - API integration (Axios)
  - `/src/utils` - Helper functions
  - `/src/assets` - Static assets
  - `/src/config` - Configuration variables

- `/backend` - Express API
  - `/controllers` - Request handlers
  - `/models` - Mongoose schemas
  - `/routes` - API route definitions
  - `/middleware` - Custom Express middleware (Error handling, Auth)
  - `/services` - Business logic layer
  - `/utils` - Utility functions
  - `/config` - Database connection and configuration

## Setup

1. Install dependencies for frontend and backend:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Configure `.env` in `backend` folder.
3. Run the development servers:
   - Frontend: `npm run dev` in `/frontend`
   - Backend: `node server.js` in `/backend`
