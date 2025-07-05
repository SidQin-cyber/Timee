# Timee API

A NestJS-based backend API for the Timee team scheduling application, designed to replace Supabase with a self-hosted solution for better performance in China.

## Features

- **Event Management**: Create, read, update, and delete scheduling events
- **Response Tracking**: Manage participant availability responses
- **Real-time Updates**: WebSocket-based real-time synchronization
- **Statistics**: Get event participation statistics
- **PostgreSQL Database**: Reliable data persistence with Prisma ORM

## API Endpoints

### Events
- `POST /api/events` - Create a new event
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/by-code/:tcode` - Get event by tcode
- `GET /api/events/:id/statistics` - Get event statistics
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Responses
- `POST /api/responses` - Create a response
- `POST /api/responses/bulk/:eventId/:participantName` - Bulk create/update responses
- `GET /api/responses` - Get all responses
- `GET /api/responses/event/:eventId` - Get responses for an event
- `GET /api/responses/event/:eventId/participant/:participantName` - Get participant's responses
- `PATCH /api/responses/:id` - Update a response
- `DELETE /api/responses/:id` - Delete a response

### WebSocket Events
- `join-event` - Join event room for real-time updates
- `leave-event` - Leave event room
- `event-updated` - Event data changed
- `response-created` - New response added
- `response-updated` - Response modified
- `response-deleted` - Response removed

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://postgres:password@host:port/database"
PORT=8080
```

## Getting Started

### Development
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run start:dev
```

### Production
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment
```bash
# Build Docker image
docker build -t timee-api .

# Run container
docker run -p 8080:8080 --env-file .env timee-api
```

## Database Schema

### Event Table
- `id` - Unique identifier
- `title` - Event title
- `description` - Event description (optional)
- `location` - Event location (optional)
- `timeSlots` - Array of time slots
- `startDate` - Event start date
- `endDate` - Event end date
- `timezone` - Event timezone
- `eventType` - Type of event (DATE_ONLY, TIME_SPECIFIC)
- `paintMode` - Paint mode (CLICK, DRAG)
- `allowMaybe` - Allow maybe responses
- `organizerEmail` - Organizer email (optional)
- `tcode` - Unique event code
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### EventResponse Table
- `id` - Unique identifier
- `eventId` - Foreign key to Event
- `participantName` - Participant name
- `participantEmail` - Participant email (optional)
- `timeSlot` - Time slot
- `availability` - AVAILABLE, MAYBE, UNAVAILABLE
- `note` - Optional note
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **WebSocket**: Socket.IO
- **Validation**: class-validator
- **Runtime**: Node.js 18+

## Deployment

This API is designed to be deployed on Sealos or any Kubernetes-compatible platform. The application runs on port 8080 and requires a PostgreSQL database connection. 