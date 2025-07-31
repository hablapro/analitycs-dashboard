# Analytics Dashboard

A React dashboard for displaying Google Analytics 4 data using service account authentication.

## Architecture

- **Frontend**: React app (port 3000)
- **Backend**: Express.js API server (port 3001)
- **Authentication**: Google service account (server-side only)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Analytics Data API
4. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Give it a name and description
   - Download the JSON key file
5. Add the service account email to your Google Analytics property:
   - Go to Google Analytics > Admin > Property > Property Access Management
   - Click "+" and add the service account email with "Viewer" permissions

### 3. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and set the path to your service account JSON file:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
PORT=3001
```

### 4. Running the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

#### Run Backend Only
```bash
npm run server
```

#### Run Frontend Only
```bash
npm start
```

## Usage

1. Start the application with `npm run dev`
2. Open http://localhost:3000 in your browser
3. The backend will automatically authenticate using the service account
4. Enter a Google Analytics 4 Property ID (9+ digits)
5. Click "Fetch Data" to load analytics data

## API Endpoints

### Backend API (http://localhost:3001)

- `GET /health` - Health check and service status
- `POST /api/analytics` - Fetch custom GA4 data
- `POST /api/analytics/overview` - Fetch dashboard overview data

### Example API Request

```javascript
// Fetch custom metrics
fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    propertyId: '123456789',
    metrics: ['totalUsers', 'sessions'],
    dimensions: ['date'],
    startDate: '30daysAgo',
    endDate: 'today'
  })
})
```

## Troubleshooting

### Common Issues

1. **"Backend service is not available"**
   - Make sure the backend server is running on port 3001
   - Check that `GOOGLE_APPLICATION_CREDENTIALS` is set correctly

2. **"Permission denied"**
   - Verify the service account email has access to the GA4 property
   - Check that the Property ID is correct (9+ digits)

3. **"Property not found"**
   - Verify the Property ID is correct
   - Make sure it's a GA4 property, not Universal Analytics

### Health Check

Visit http://localhost:3001/health to check backend status:
```json
{
  "status": "ok",
  "hasAnalyticsClient": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security Notes

- Service account credentials are stored server-side only
- Never expose service account keys in the frontend
- The React app communicates only with your backend API
- No Google credentials are sent to the browser

## Features

- Real-time GA4 data fetching
- Overview dashboard with key metrics
- Traffic trend analysis
- Top pages and traffic sources
- Responsive design for mobile/desktop
- Natural language query interface

---

## Original Create React App Documentation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Additional Scripts

- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

For more information about Create React App, see the [documentation](https://facebook.github.io/create-react-app/docs/getting-started).# analitycs-dashboard
