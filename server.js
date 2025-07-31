const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Google Analytics client with service account
let analyticsDataClient;

try {
  // The service account credentials should be in a JSON file
  // Set GOOGLE_APPLICATION_CREDENTIALS env var to point to your service account JSON file
  analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    // Alternative: use credentials object directly
    // credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  });
  console.log('✅ Google Analytics client initialized with service account');
} catch (error) {
  console.error('❌ Failed to initialize Google Analytics client:', error.message);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    hasAnalyticsClient: !!analyticsDataClient,
    timestamp: new Date().toISOString()
  });
});

// Fetch GA4 data endpoint
app.post('/api/analytics', async (req, res) => {
  try {
    const { propertyId, metrics, dimensions = [], startDate = '30daysAgo', endDate = 'today' } = req.body;

    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return res.status(400).json({ error: 'Metrics array is required' });
    }

    if (!analyticsDataClient) {
      return res.status(500).json({ error: 'Analytics client not initialized. Check service account configuration.' });
    }

    console.log(`Fetching GA4 data for property: ${propertyId}`);

    // Prepare the request
    const request = {
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      metrics: metrics.map(metric => ({ name: metric })),
      dimensions: dimensions.map(dimension => ({ name: dimension })),
    };

    // Make the API call
    const [response] = await analyticsDataClient.runReport(request);

    console.log(`✅ Successfully fetched data for property ${propertyId}`);
    
    res.json({
      success: true,
      data: response,
      propertyId: propertyId,
      dateRange: { startDate, endDate }
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    
    // Handle specific error types
    if (error.code === 7) {
      return res.status(403).json({ 
        error: 'Permission denied. Make sure the service account has access to this property.',
        details: error.message 
      });
    }
    
    if (error.code === 5) {
      return res.status(404).json({ 
        error: 'Property not found. Please check the Property ID.',
        details: error.message 
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error.message 
    });
  }
});

// Multiple metrics endpoint for dashboard overview
app.post('/api/analytics/overview', async (req, res) => {
  try {
    const { propertyId, startDate = '30daysAgo', endDate = 'today' } = req.body;

    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    if (!analyticsDataClient) {
      return res.status(500).json({ error: 'Analytics client not initialized' });
    }

    // Fetch overview metrics
    const overviewMetrics = ['totalUsers', 'sessions', 'screenPageViews', 'engagementRate', 'averageSessionDuration', 'bounceRate'];
    
    // Fetch traffic data with date dimension
    const trafficMetrics = ['totalUsers', 'sessions'];
    const trafficDimensions = ['date'];
    
    // Fetch top pages
    const pageMetrics = ['screenPageViews', 'activeUsers'];
    const pageDimensions = ['pagePath'];
    
    // Fetch traffic sources
    const sourceMetrics = ['sessions'];
    const sourceDimensions = ['sessionSource'];

    // Make parallel requests
    const [overviewResponse, trafficResponse, pagesResponse, sourcesResponse] = await Promise.all([
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: overviewMetrics.map(metric => ({ name: metric }))
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: trafficMetrics.map(metric => ({ name: metric })),
        dimensions: trafficDimensions.map(dimension => ({ name: dimension }))
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: pageMetrics.map(metric => ({ name: metric })),
        dimensions: pageDimensions.map(dimension => ({ name: dimension })),
        limit: 10
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: sourceMetrics.map(metric => ({ name: metric })),
        dimensions: sourceDimensions.map(dimension => ({ name: dimension })),
        limit: 10
      })
    ]);

    console.log(`✅ Successfully fetched overview data for property ${propertyId}`);

    res.json({
      success: true,
      data: {
        overview: overviewResponse[0],
        traffic: trafficResponse[0],
        pages: pagesResponse[0],
        sources: sourcesResponse[0]
      },
      propertyId: propertyId,
      dateRange: { startDate, endDate }
    });

  } catch (error) {
    console.error('Error fetching overview data:', error);
    
    if (error.code === 7) {
      return res.status(403).json({ 
        error: 'Permission denied. Make sure the service account has access to this property.',
        details: error.message 
      });
    }
    
    if (error.code === 5) {
      return res.status(404).json({ 
        error: 'Property not found. Please check the Property ID.',
        details: error.message 
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch overview data',
      details: error.message 
    });
  }
});

// Audience data endpoint
app.post('/api/analytics/audience', async (req, res) => {
  try {
    const { propertyId, startDate = '30daysAgo', endDate = 'today' } = req.body;

    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    if (!analyticsDataClient) {
      return res.status(500).json({ error: 'Analytics client not initialized' });
    }

    console.log(`Fetching audience data for property: ${propertyId}`);

    // Fetch demographics data (age, gender)
    const [ageResponse, genderResponse, countryResponse, cityResponse, deviceResponse, browserResponse, osResponse] = await Promise.all([
      // Age demographics
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'userAgeBracket' }],
        limit: 10
      }),
      // Gender demographics  
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'userGender' }],
        limit: 10
      }),
      // Geographic data - Countries
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'country' }],
        limit: 10
      }),
      // Geographic data - Cities
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'city' }],
        limit: 10
      }),
      // Device category
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'deviceCategory' }],
        limit: 10
      }),
      // Browser
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'browser' }],
        limit: 10
      }),
      // Operating System
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'operatingSystem' }],
        limit: 10
      })
    ]);

    console.log(`✅ Successfully fetched audience data for property ${propertyId}`);

    res.json({
      success: true,
      data: {
        demographics: {
          age: ageResponse[0],
          gender: genderResponse[0]
        },
        geography: {
          countries: countryResponse[0],
          cities: cityResponse[0]
        },
        technology: {
          devices: deviceResponse[0],
          browsers: browserResponse[0],
          operatingSystems: osResponse[0]
        }
      },
      propertyId: propertyId,
      dateRange: { startDate, endDate }
    });

  } catch (error) {
    console.error('Error fetching audience data:', error);
    
    if (error.code === 7) {
      return res.status(403).json({ 
        error: 'Permission denied. Make sure the service account has access to this property.',
        details: error.message 
      });
    }
    
    if (error.code === 5) {
      return res.status(404).json({ 
        error: 'Property not found. Please check the Property ID.',
        details: error.message 
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch audience data',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Analytics Dashboard API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('⚠️  GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
    console.log('   Set it to the path of your service account JSON file');
  }
});

module.exports = app;