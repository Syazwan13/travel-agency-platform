# Copilot Instructions for AI Coding Agents

## Project Overview
This monorepo powers a travel agency platform with automated data scraping, package comparison, and multi-role dashboards. The backend (Node.js/Express/MongoDB) manages scraping, data aggregation, and APIs. The frontend (React/Vite) provides user, agency, and admin dashboards.

## Architecture & Major Components
- **Backend (`backend/`)**
  - `server.js`: Main Express app, loads routes, middleware, and starts the server.
  - `controllers/`, `routes/`, `models/`: Standard MVC structure for REST APIs.
  - `services/scrapingService.js`, `services/cronScheduler.js`: Orchestrate manual/automated scraping, status tracking, and scheduling.
  - `middleware/`: Auth, error handling, and upload logic.
  - `uploads/`: Stores user and feedback images.
- **Frontend (`client/`)**
  - `src/pages/dashboard/`, `src/components/dashboard/`: Dashboards for admin, agency, and users.
  - `src/pages/packages/PackageComparison.jsx`: Main package comparison page.
  - `src/components/packages/`: Search, filter, display, and comparison UI.

## Data Flows & Integration
- **Scraping**: Admins trigger scraping via dashboard or cron. Status and logs are tracked in `scrapingLogModel.js` and surfaced via API.
- **Package Data**: Aggregated from multiple providers (AmiTravel, HolidayGoGo, PulauMalaysia) using dedicated models/controllers. Unified API for search, filter, and analytics.
- **Dashboards**: Role-based dashboards fetch analytics and stats from backend endpoints. Access control via middleware.
- **External Links**: All bookings redirect to provider sites; click tracking is implemented for analytics.

## Developer Workflows
- **Start Backend**: `cd backend && npm start` (uses `nodemon server.js`)
- **Start Frontend**: `cd client && npm run dev`
- **Environment**: Configure `.env` in `backend/` (see `AUTOMATED_SCRAPING_SYSTEM.md` for required vars)
- **Testing**: Manual via dashboard UIs and API endpoints; see dashboard and package comparison docs for test checklists.

## Project-Specific Patterns
- **Scraping Safety**: Only one scraping operation at a time (mutex lock, status checks).
- **Role-Based Access**: All sensitive endpoints require authentication and role checks (see `middleware/`).
- **Analytics**: Clicks, searches, and comparisons are tracked for business intelligence.
- **No Internal Booking**: All package bookings are external; platform is comparison-only.
- **Batch Processing**: Scraping and data updates use batch sizes and retry logic (configurable in `.env`).

## Key Files & Docs
- `AUTOMATED_SCRAPING_SYSTEM.md`: Scraping architecture, workflows, and troubleshooting.
- `PACKAGE_COMPARISON_IMPLEMENTATION.md`: Package comparison features and integration.
- `DASHBOARD_IMPLEMENTATION.md`: Dashboard features, endpoints, and component structure.
- `backend/services/`, `backend/controllers/`, `client/src/components/`

## Examples
- To add a new scraping source: update `scrapingService.js`, add model/controller, and expose via API/routes.
- To extend dashboard analytics: update controller logic and corresponding frontend components.
- To change scraping schedule: update cron config in `.env` and use `/api/scraping/cron/schedule` endpoint.

---
For more details, see the referenced markdown docs and explore the `backend/` and `client/` directories for implementation patterns.
