import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Function to check backend health
const checkBackendHealth = async () => {
  try {
    console.log('Checking backend health...');
    // Always use direct URL in development (when not in production build)
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const backendUrl = isDev ? 'http://localhost:3001' : '';
    console.log('Backend URL:', `${backendUrl}/api/health`, 'NODE_ENV:', process.env.NODE_ENV);
    const response = await fetch(`${backendUrl}/api/health`);
    
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Backend health:', data);
    return data.hasAnalyticsClient;
  } catch (error) {
    console.error('Backend health check error:', error);
    return false;
  }
};



// Function to fetch overview data via backend API
const fetchOverviewData = async (propertyId, startDate = '30daysAgo', endDate = 'today') => {
  try {
    console.log(`Fetching overview data for property ${propertyId} via backend`);
    
    if (!propertyId) {
      throw new Error('No property ID provided');
    }
    
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const backendUrl = isDev ? 'http://localhost:3001' : '';
    const response = await fetch(`${backendUrl}/api/analytics/overview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propertyId,
        startDate,
        endDate
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend API returned ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Backend overview API response:', result);
    return result.data;
  } catch (error) {
    console.error('Error fetching overview data:', error);
    throw error;
  }
};

// Function to fetch audience data via backend API
const fetchAudienceData = async (propertyId, startDate = '30daysAgo', endDate = 'today') => {
  try {
    console.log(`Fetching audience data for property ${propertyId} via backend`);
    
    if (!propertyId) {
      throw new Error('No property ID provided');
    }
    
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const backendUrl = isDev ? 'http://localhost:3001' : '';
    const response = await fetch(`${backendUrl}/api/analytics/audience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propertyId,
        startDate,
        endDate
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend API returned ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Backend audience API response:', result);
    return result.data;
  } catch (error) {
    console.error('Error fetching audience data:', error);
    throw error;
  }
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [propertyId, setPropertyId] = useState(process.env.REACT_APP_GA_PROPERTY_ID || '');
  const [dateRange, setDateRange] = useState(process.env.REACT_APP_DEFAULT_DATE_RANGE || 'last30days');
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [gaData, setGaData] = useState(null);
  const [audienceData, setAudienceData] = useState(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check backend health on component mount
  useEffect(() => {
    const initBackend = async () => {
      try {
        const backendHealthy = await checkBackendHealth();
        setIsAuthenticated(backendHealthy);
        
        if (backendHealthy) {
          console.log('Backend is healthy and ready');
          setError('');
          
          // If we have a property ID, fetch data automatically
          if (propertyId) {
            console.log('Auto-fetching data for property:', propertyId);
            fetchAnalyticsData();
          }
        } else {
          setError('Backend service is not available or not properly configured.');
        }
      } catch (err) {
        console.error('Error checking backend health:', err);
        setError('Failed to connect to backend service: ' + err.message);
      }
    };
    
    initBackend();
  }, []);

  // Auto-fetch data when property ID or date range changes
  useEffect(() => {
    if (propertyId && gaData) {
      // Only refetch if we already have data and date range changes
      fetchAnalyticsData();
    }
  }, [dateRange]);

  // Initial fetch when property ID is entered
  useEffect(() => {
    if (propertyId && !gaData) {
      fetchAnalyticsData();
    }
  }, [propertyId]);
  
  // Remove demo data initialization - we only want real GA4 data

  // Function to convert date range to GA4 format and get display text
  const getDateRange = (range) => {
    const today = new Date();
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    
    switch (range) {
      case 'today':
        return { 
          startDate: 'today', 
          endDate: 'today',
          displayText: `Today: ${formatDate(today)}`
        };
      case 'last7days':
        const last7Start = new Date(today);
        last7Start.setDate(today.getDate() - 7);
        return { 
          startDate: '7daysAgo', 
          endDate: 'today',
          displayText: `Last 7 days: ${formatDate(last7Start)} - ${formatDate(today)}`
        };
      case 'last30days':
        const last30Start = new Date(today);
        last30Start.setDate(today.getDate() - 30);
        return { 
          startDate: '30daysAgo', 
          endDate: 'today',
          displayText: `Last 30 days: ${formatDate(last30Start)} - ${formatDate(today)}`
        };
      case 'last90days':
        const last90Start = new Date(today);
        last90Start.setDate(today.getDate() - 90);
        return { 
          startDate: '90daysAgo', 
          endDate: 'today',
          displayText: `Last 90 days: ${formatDate(last90Start)} - ${formatDate(today)}`
        };
      case 'lastquarter':
        const lastQuarterStart = new Date(today);
        lastQuarterStart.setDate(today.getDate() - 90);
        return { 
          startDate: '90daysAgo', 
          endDate: 'today',
          displayText: `Last Quarter: ${formatDate(lastQuarterStart)} - ${formatDate(today)}`
        };
      case 'lastyear':
        const lastYearStart = new Date(today);
        lastYearStart.setDate(today.getDate() - 365);
        return { 
          startDate: '365daysAgo', 
          endDate: 'today',
          displayText: `Last Year: ${formatDate(lastYearStart)} - ${formatDate(today)}`
        };
      default:
        const defaultStart = new Date(today);
        defaultStart.setDate(today.getDate() - 30);
        return { 
          startDate: '30daysAgo', 
          endDate: 'today',
          displayText: `Last 30 days: ${formatDate(defaultStart)} - ${formatDate(today)}`
        };
    }
  };

  
  
  // Check if backend is available and authenticated
  const isBackendAuthenticated = () => {
    return isAuthenticated;
  };

  // Function to fetch audience data
  const fetchAudienceDataHandler = async () => {
    if (!propertyId) {
      setError('Please enter a Property ID');
      return;
    }
    
    console.log('Fetching audience data for property:', propertyId);

    setIsLoading(true);
    setError('');
    
    // Check if backend is available
    if (!isBackendAuthenticated()) {
      setError('Backend service is not available. Please ensure the server is running.');
      setIsLoading(false);
      return;
    }

    try {
      const { startDate, endDate } = getDateRange(dateRange);
      
      // Fetch audience data
      const audienceDataResult = await fetchAudienceData(propertyId, startDate, endDate);
      
      setAudienceData(audienceDataResult);
      setError('');
      setQueryResponse(`✅ Successfully loaded audience data for Property ID: ${propertyId} (${getDateRange(dateRange).displayText})`);
      
    } catch (err) {
      console.error('Error fetching audience data:', err);
      setError(`Failed to fetch audience data: ${err.message || 'Please check your Property ID and authentication'}`);
      setAudienceData(null);
    }

    setIsLoading(false);
  };

  // Function to process audience data for charts
  const processAudienceData = (apiResponse, type) => {
    if (!apiResponse || !apiResponse.rows) return [];
    
    const total = apiResponse.rows.reduce((sum, row) => {
      return sum + parseInt(row.metricValues[0].value, 10);
    }, 0);
    
    return apiResponse.rows.map(row => {
      const name = row.dimensionValues[0].value;
      const users = parseInt(row.metricValues[0].value, 10);
      const percentage = Math.round((users / total) * 100);
      
      return {
        name: name === '(not set)' ? 'Unknown' : name,
        users: users,
        value: percentage
      };
    }).filter(item => item.value > 0); // Filter out 0% items
  };

  // Function to fetch real GA4 data using the GA4 API
  const fetchAnalyticsData = async () => {
    if (!propertyId) {
      setError('Please enter a Property ID');
      return;
    }
    
    console.log('Fetching analytics data for property:', propertyId);

    setIsLoading(true);
    setError('');
    
    // Check if backend is available
    if (!isBackendAuthenticated()) {
      setError('Backend service is not available. Please ensure the server is running.');
      setIsLoading(false);
      return;
    }

    try {
      const { startDate, endDate } = getDateRange(dateRange);
      
      // Fetch all overview data in one call
      const overviewData = await fetchOverviewData(propertyId, startDate, endDate);
      
      const { overview: overviewResponse, traffic: trafficResponse, pages: pagesResponse, sources: sourcesResponse } = overviewData;
      
      // Process the overview data
      const processedOverviewData = {};
      if (overviewResponse && overviewResponse.rows && overviewResponse.rows.length > 0) {
        overviewResponse.metricHeaders.forEach((header, index) => {
          const metricName = header.name.replace('metrics/', '');
          const value = parseFloat(overviewResponse.rows[0].metricValues[index].value);
          processedOverviewData[metricName] = value;
        });
      }
      
      // Process traffic data by date
      const trafficData = [];
      if (trafficResponse && trafficResponse.rows) {
        trafficResponse.rows.forEach(row => {
          const date = row.dimensionValues[0].value;
          const users = parseInt(row.metricValues[0].value, 10);
          const sessions = parseInt(row.metricValues[1].value, 10);
          
          trafficData.push({
            date,
            users,
            sessions
          });
        });
      }
      
      // Process pages data
      const pagesData = [];
      if (pagesResponse && pagesResponse.rows) {
        // Sort by pageviews descending
        const sortedRows = [...pagesResponse.rows].sort((a, b) => {
          return parseInt(b.metricValues[0].value, 10) - parseInt(a.metricValues[0].value, 10);
        }).slice(0, 5);
        
        sortedRows.forEach(row => {
          const page = row.dimensionValues[0].value;
          const pageviews = parseInt(row.metricValues[0].value, 10);
          const users = parseInt(row.metricValues[1].value, 10);
          
          pagesData.push({
            page,
            pageviews,
            users
          });
        });
      }
      
      // Process sources data
      const sourcesData = [];
      const colors = ['#0066ff', '#08c896', '#ff6b35', '#ffd23f', '#a855f7'];
      
      if (sourcesResponse && sourcesResponse.rows) {
        // Calculate total sessions
        const totalSessions = sourcesResponse.rows.reduce((sum, row) => {
          return sum + parseInt(row.metricValues[0].value, 10);
        }, 0);
        
        // Sort by sessions descending
        const sortedRows = [...sourcesResponse.rows].sort((a, b) => {
          return parseInt(b.metricValues[0].value, 10) - parseInt(a.metricValues[0].value, 10);
        }).slice(0, 5);
        
        sortedRows.forEach((row, index) => {
          const source = row.dimensionValues[0].value;
          const sessions = parseInt(row.metricValues[0].value, 10);
          const percentage = Math.round((sessions / totalSessions) * 100);
          
          sourcesData.push({
            source,
            value: percentage,
            color: colors[index % colors.length]
          });
        });
      }
      
      // Create the final processed data structure
      const processedOverview = {
        users: processedOverviewData.totalUsers || 0,
        sessions: processedOverviewData.sessions || 0,
        pageviews: processedOverviewData.screenPageViews || 0,
        engagementRate: processedOverviewData.engagementRate || 0,
        avgSessionDuration: processedOverviewData.averageSessionDuration || 0,
        bounceRate: processedOverviewData.bounceRate || 0
      };
      
      // Set the data with real GA4 values
      setGaData({
        overview: processedOverview,
        traffic: trafficData,
        pages: pagesData,
        sources: sourcesData
      });

      setError('');
      setQueryResponse(`✅ Successfully loaded analytics data for Property ID: ${propertyId} (${getDateRange(dateRange).displayText})`);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(`Failed to fetch analytics data: ${err.message || 'Please check your Property ID and authentication'}`);
      
      setGaData(null);
    }

    setIsLoading(false);
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);

    try {
      // Use real data if available
      const currentData = gaData || {
        overview: {
          users: 0,
          sessions: 0,
          pageviews: 0,
          engagementRate: 0,
          avgSessionDuration: 0,
          bounceRate: 0
        },
        traffic: [],
        pages: [],
        sources: []
      };

      // Generate response based on current data and query
      const generateResponse = (query, data) => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('traffic') || lowerQuery.includes('users') || lowerQuery.includes('visitor')) {
          return `Your website had ${data.overview.users?.toLocaleString() || 'N/A'} users and ${data.overview.sessions?.toLocaleString() || 'N/A'} sessions in the selected period.`;
        } else if (lowerQuery.includes('pages') || lowerQuery.includes('content') || lowerQuery.includes('page')) {
          const topPage = data.pages?.[0];
          return `Your top performing page is ${topPage?.page || 'N/A'} with ${topPage?.pageviews?.toLocaleString() || 'N/A'} pageviews. Total pageviews: ${data.overview.pageviews?.toLocaleString() || 'N/A'}.`;
        } else if (lowerQuery.includes('bounce') || lowerQuery.includes('engagement')) {
          return `Your engagement rate is ${data.overview.engagementRate ? (data.overview.engagementRate * 100).toFixed(1) + '%' : 'N/A'} with a bounce rate of ${data.overview.bounceRate ? (data.overview.bounceRate * 100).toFixed(1) + '%' : 'N/A'}.`;
        } else if (lowerQuery.includes('source') || lowerQuery.includes('channel') || lowerQuery.includes('where')) {
          const topSource = data.sources?.[0];
          return `Your top traffic source is ${topSource?.source || 'N/A'} accounting for ${topSource?.value || 'N/A'}% of your traffic.`;
        } else if (lowerQuery.includes('session') || lowerQuery.includes('duration') || lowerQuery.includes('time')) {
          const avgDuration = data.overview.avgSessionDuration;
          const minutes = avgDuration ? Math.floor(avgDuration / 60) : 0;
          const seconds = avgDuration ? Math.floor(avgDuration % 60) : 0;
          return `Your average session duration is ${minutes}m ${seconds}s. Users are spending ${avgDuration > 120 ? 'good' : 'moderate'} time on your site.`;
        } else if (lowerQuery.includes('best') || lowerQuery.includes('top') || lowerQuery.includes('popular')) {
          const topPage = data.pages?.[0];
          const topSource = data.sources?.[0];
          return `Your best performing page is ${topPage?.page || 'N/A'} and your top traffic source is ${topSource?.source || 'N/A'}.`;
        } else if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('total')) {
          return `Here's your summary: ${data.overview.users?.toLocaleString() || 'N/A'} users, ${data.overview.sessions?.toLocaleString() || 'N/A'} sessions, ${data.overview.pageviews?.toLocaleString() || 'N/A'} pageviews, and ${data.overview.engagementRate ? (data.overview.engagementRate * 100).toFixed(1) + '%' : 'N/A'} engagement rate.`;
        }
        return 'I can help you analyze your website data. Try asking about traffic, users, top pages, engagement metrics, traffic sources, or session duration. For example: "How many users did I get?" or "What are my top pages?"';
      };

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 800));

      setQueryResponse(generateResponse(query, currentData));
    } catch (err) {
      setQueryResponse('Sorry, I encountered an error while analyzing your data. Please try again.');
    }

    setIsLoading(false);
  };

  const MetricCard = ({ title, value, change, icon }) => (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );

  const NavItem = ({ id, label, icon, isActive, onClick }) => (
    <button
      className={`nav-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </button>
  );

  // Use real data if available
  const currentData = gaData || {
    overview: {
      users: 0,
      sessions: 0,
      pageviews: 0,
      engagementRate: 0,
      avgSessionDuration: 0,
      bounceRate: 0
    },
    traffic: [],
    pages: [],
    sources: []
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="content-section">
            {error && (
              <div className="error-banner">
                ⚠️ {error}
              </div>
            )}
            <div className="metrics-grid">
              <MetricCard 
                title="Total Users" 
                value={currentData.overview.users?.toLocaleString() || 'N/A'} 
                change={12.5} 
                icon="👥" 
              />
              <MetricCard 
                title="Sessions" 
                value={currentData.overview.sessions?.toLocaleString() || 'N/A'} 
                change={8.3} 
                icon="📊" 
              />
              <MetricCard 
                title="Pageviews" 
                value={currentData.overview.pageviews?.toLocaleString() || 'N/A'} 
                change={-2.1} 
                icon="👁" 
              />
              <MetricCard 
                title="Engagement Rate" 
                value={currentData.overview.engagementRate ? `${(currentData.overview.engagementRate * 100).toFixed(1)}%` : 'N/A'} 
                change={5.7} 
                icon="💬" 
              />
              <MetricCard 
                title="Avg Session Duration" 
                value={currentData.overview.avgSessionDuration ? `${Math.floor(currentData.overview.avgSessionDuration / 60)}m ${Math.floor(currentData.overview.avgSessionDuration % 60)}s` : 'N/A'} 
                change={3.2} 
                icon="⏱" 
              />
              <MetricCard 
                title="Bounce Rate" 
                value={currentData.overview.bounceRate ? `${(currentData.overview.bounceRate * 100).toFixed(1)}%` : 'N/A'} 
                change={-1.8} 
                icon="⚡" 
              />
            </div>

            <div className="charts-grid">
              <div className="chart-container">
                <h3>Traffic Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={currentData.traffic}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card-bg)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="var(--primary)" 
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Traffic Sources</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentData.sources}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ source, value }) => `${source}: ${value}%`}
                    >
                      {currentData.sources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'traffic':
        return (
          <div className="content-section">
            <div className="chart-container full-width">
              <h3>Traffic & Acquisition</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentData.traffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card-bg)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} />
                  <Line type="monotone" dataKey="sessions" stroke="var(--accent)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="table-container">
              <h3>Traffic Sources Breakdown</h3>
              <div className="data-table">
                <div className="table-header">
                  <span>Source</span>
                  <span>Percentage</span>
                  <span>Users</span>
                </div>
                {currentData.sources.map((source, index) => (
                  <div key={index} className="table-row">
                    <span className="source-item">
                      <div className="source-color" style={{ backgroundColor: source.color }}></div>
                      {source.source}
                    </span>
                    <span>{source.value}%</span>
                    <span>{Math.round((currentData.overview.users || 0) * (source.value / 100)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="content-section">
            <div className="chart-container">
              <h3>Top Pages Performance</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={currentData.pages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="page" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card-bg)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="pageviews" fill="var(--primary)" radius={4} />
                  <Bar dataKey="users" fill="var(--accent)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="table-container">
              <h3>Page Details</h3>
              <div className="data-table">
                <div className="table-header">
                  <span>Page</span>
                  <span>Pageviews</span>
                  <span>Unique Users</span>
                  <span>Avg Time</span>
                </div>
                {currentData.pages.map((page, index) => (
                  <div key={index} className="table-row">
                    <span className="page-url">{page.page}</span>
                    <span>{page.pageviews?.toLocaleString() || 'N/A'}</span>
                    <span>{page.users?.toLocaleString() || 'N/A'}</span>
                    <span>2m 15s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="content-section">
            {error && (
              <div className="error-banner">
                ⚠️ {error}
              </div>
            )}
            
            {!audienceData ? (
              <div className="coming-soon">
                <h2>👥 Audience Analytics</h2>
                <p>Click "Fetch Data" to load audience demographics, geography, and technology data</p>
                <button 
                  className="fetch-button" 
                  onClick={fetchAudienceDataHandler}
                  disabled={isLoading || !propertyId.trim()}
                  style={{marginTop: '20px', padding: '12px 24px'}}
                >
                  {isLoading ? '🔄 Loading...' : '📊 Load Audience Data'}
                </button>
              </div>
            ) : (
              <>
                <div className="charts-grid">
                  {/* Demographics */}
                  <div className="chart-container">
                    <h3>👥 Demographics - Age Groups</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={processAudienceData(audienceData.demographics.age, 'Age')}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {processAudienceData(audienceData.demographics.age, 'Age').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0066ff', '#08c896', '#ff6b35', '#ffd23f', '#a855f7', '#06b6d4'][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-container">
                    <h3>👤 Demographics - Gender</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={processAudienceData(audienceData.demographics.gender, 'Gender')}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {processAudienceData(audienceData.demographics.gender, 'Gender').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0066ff', '#ff6b35', '#08c896'][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="charts-grid">
                  {/* Geography */}
                  <div className="chart-container">
                    <h3>🌍 Geographic Distribution - Countries</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={processAudienceData(audienceData.geography.countries, 'Country').slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--card-bg)', 
                            border: '1px solid var(--border)',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="users" fill="var(--primary)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-container">
                    <h3>📱 Device Categories</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={processAudienceData(audienceData.technology.devices, 'Device')}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {processAudienceData(audienceData.technology.devices, 'Device').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0066ff', '#08c896', '#ff6b35'][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="table-container">
                  <h3>🖥️ Technology Breakdown</h3>
                  <div className="data-table">
                    <div className="table-header">
                      <span>Category</span>
                      <span>Name</span>
                      <span>Users</span>
                      <span>Percentage</span>
                    </div>
                    {audienceData.technology.browsers && audienceData.technology.browsers.rows && 
                     audienceData.technology.browsers.rows.slice(0, 5).map((row, index) => {
                       const browserName = row.dimensionValues[0].value;
                       const users = parseInt(row.metricValues[0].value, 10);
                       const total = audienceData.technology.browsers.rows.reduce((sum, r) => sum + parseInt(r.metricValues[0].value, 10), 0);
                       const percentage = ((users / total) * 100).toFixed(1);
                       
                       return (
                         <div key={index} className="table-row">
                           <span>🌐 Browser</span>
                           <span>{browserName}</span>
                           <span>{users.toLocaleString()}</span>
                           <span>{percentage}%</span>
                         </div>
                       );
                     })}
                    {audienceData.technology.operatingSystems && audienceData.technology.operatingSystems.rows && 
                     audienceData.technology.operatingSystems.rows.slice(0, 3).map((row, index) => {
                       const osName = row.dimensionValues[0].value;
                       const users = parseInt(row.metricValues[0].value, 10);
                       const total = audienceData.technology.operatingSystems.rows.reduce((sum, r) => sum + parseInt(r.metricValues[0].value, 10), 0);
                       const percentage = ((users / total) * 100).toFixed(1);
                       
                       return (
                         <div key={`os-${index}`} className="table-row">
                           <span>💻 OS</span>
                           <span>{osName}</span>
                           <span>{users.toLocaleString()}</span>
                           <span>{percentage}%</span>
                         </div>
                       );
                     })}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return (
          <div className="content-section">
            <div className="coming-soon">
              <h2>Coming Soon</h2>
              <p>This section is under development. More analytics features will be available soon!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <style jsx>{`
        :root {
          --primary: #0066ff;
          --accent: #08c896;
          --warning: #ff6b35;
          --success: #10b981;
          --error: #ef4444;
          
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --sidebar-bg: #1e293b;
          --card-bg: #ffffff;
          
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --text-light: #94a3b8;
          --text-white: #ffffff;
          
          --border: #e2e8f0;
          --border-hover: #cbd5e1;
          
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          
          --radius: 8px;
          --spacing-xs: 4px;
          --spacing-sm: 8px;
          --spacing-md: 16px;
          --spacing-lg: 24px;
          --spacing-xl: 32px;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-secondary);
          color: var(--text-primary);
          line-height: 1.6;
        }

        .dashboard {
          display: flex;
          min-height: 100vh;
          background: var(--bg-secondary);
        }

        .sidebar {
          width: 280px;
          background: var(--sidebar-bg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-lg);
          position: fixed;
          height: 100vh;
          overflow-y: auto;
          z-index: 100;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid #334155;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: white;
        }

        .logo-text {
          color: var(--text-white);
          font-size: 20px;
          font-weight: 700;
        }

        .property-input {
          margin-bottom: var(--spacing-lg);
        }

        .property-input label {
          display: block;
          color: var(--text-light);
          font-size: 14px;
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
        }

        .property-input input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid #475569;
          border-radius: var(--radius);
          background: #334155;
          color: var(--text-white);
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .property-input input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }

        .fetch-button {
          margin-top: var(--spacing-sm);
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--primary);
          border-radius: var(--radius);
          background: var(--primary);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .fetch-button:hover {
          background: var(--accent);
          border-color: var(--accent);
        }

        .fetch-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button-group {
          display: flex;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
        }
        
        .auth-button {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--accent);
          border-radius: var(--radius);
          background: transparent;
          color: var(--accent);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }
        
        .auth-button:hover {
          background: var(--accent);
          color: white;
        }
        
        .auth-button-success {
          border-color: var(--success);
          color: var(--success);
        }
        
        .auth-button-success:hover {
          background: var(--success);
          color: white;
        }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: var(--spacing-md);
          border-radius: var(--radius);
          margin-bottom: var(--spacing-lg);
          font-size: 14px;
          font-weight: 500;
        }

        .api-info {
          margin-top: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius);
          border: 1px solid #475569;
        }

        .api-info small {
          color: var(--text-light);
          font-size: 12px;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border: none;
          background: transparent;
          color: var(--text-light);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-size: 14px;
          font-weight: 500;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-white);
          transform: translateX(2px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: var(--text-white);
          box-shadow: var(--shadow-md);
        }

        .nav-icon {
          font-size: 18px;
          width: 20px;
          text-align: center;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: var(--spacing-lg);
          max-width: calc(100vw - 280px);
        }

        .header {
          background: var(--card-bg);
          padding: var(--spacing-lg);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          margin-bottom: var(--spacing-lg);
          border: 1px solid var(--border);
        }

        .header-top {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .header-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .date-selector {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
        }

        .date-selector select {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: white;
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .date-selector select:focus {
          outline: none;
          border-color: var(--primary);
        }

        .date-display {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }

        .query-section {
          display: flex;
          gap: var(--spacing-md);
          align-items: center;
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: var(--radius);
          margin-bottom: var(--spacing-lg);
        }

        .query-form {
          flex: 1;
          display: flex;
          gap: var(--spacing-sm);
        }

        .query-input {
          flex: 1;
          padding: var(--spacing-md);
          border: none;
          border-radius: var(--radius);
          font-size: 16px;
          background: rgba(255, 255, 255, 0.95);
          color: var(--text-primary);
          placeholder-color: var(--text-secondary);
        }

        .query-input:focus {
          outline: none;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }

        .query-button {
          padding: var(--spacing-md) var(--spacing-lg);
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: var(--radius);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .query-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .query-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .query-response {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.15);
          border-radius: var(--radius);
          color: white;
          font-size: 14px;
          line-height: 1.5;
        }

        .content-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .metric-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--spacing-lg);
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .metric-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .metric-icon {
          font-size: 20px;
        }

        .metric-title {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .metric-change {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .metric-change.positive {
          color: var(--success);
        }

        .metric-change.negative {
          color: var(--error);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--spacing-lg);
        }

        .chart-container {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }

        .chart-container.full-width {
          grid-column: 1 / -1;
        }

        .chart-container h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
        }

        .table-container {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }

        .table-container h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
        }

        .data-table {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius);
          font-weight: 600;
          font-size: 14px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--border);
          transition: background-color 0.2s ease;
        }

        .table-row:hover {
          background: var(--bg-secondary);
        }

        .source-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .source-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .page-url {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          color: var(--primary);
        }

        .coming-soon {
          text-align: center;
          padding: var(--spacing-xl) 0;
          color: var(--text-secondary);
        }

        .coming-soon h2 {
          font-size: 24px;
          margin-bottom: var(--spacing-md);
          color: var(--text-primary);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .main-content {
            margin-left: 0;
            max-width: 100vw;
            padding: var(--spacing-md);
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .header-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .query-section {
            flex-direction: column;
            align-items: stretch;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: var(--spacing-xs);
          }

          .table-header {
            display: none;
          }

          .table-row {
            display: flex;
            flex-direction: column;
            padding: var(--spacing-md);
            background: var(--bg-secondary);
            border-radius: var(--radius);
            margin-bottom: var(--spacing-sm);
          }
        }
      `}</style>

      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">📊</div>
          <div className="logo-text">Analytics</div>
        </div>
        
        <div className="property-input">
          <label htmlFor="propertyId">Google Analytics Property ID</label>
          <input
            id="propertyId"
            type="text"
            value={propertyId}
            onChange={(e) => {
              // Remove any non-numeric characters and update state
              const cleanedValue = e.target.value.replace(/[^0-9]/g, '');
              setPropertyId(cleanedValue);
            }}
            placeholder="e.g., 123456789"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && propertyId.trim()) {
                fetchAnalyticsData();
              }
            }}
          />
          <div className="button-group">
            <button 
              className="fetch-button"
              onClick={fetchAnalyticsData}
              disabled={isLoading || !propertyId.trim()}
            >
              {isLoading ? '🔄 Loading...' : '📊 Fetch Data'}
            </button>
            
            <button 
              className={`auth-button ${isAuthenticated ? 'auth-button-success' : ''}`}
              onClick={async () => {
                if (isAuthenticated) {
                  alert('Backend service is connected and authenticated');
                } else {
                  setIsLoading(true);
                  try {
                    const backendHealthy = await checkBackendHealth();
                    setIsAuthenticated(backendHealthy);
                    
                    if (backendHealthy) {
                      setError('');
                      setQueryResponse('Successfully connected to backend service');
                      
                      if (propertyId) {
                        fetchAnalyticsData();
                      }
                    } else {
                      setError('Failed to connect to backend service');
                    }
                  } catch (err) {
                    console.error('Backend connection error:', err);
                    setError('Backend connection error: ' + err.message);
                  }
                  setIsLoading(false);
                }
              }}
            >
              {isAuthenticated ? '✅ Backend Connected' : '🔌 Connect to Backend'}
            </button>
          </div>
          <div className="api-info">
            <small>
              {isAuthenticated 
                ? '✅ Connected to backend service with Google Analytics access' 
                : '💡 Enter your Google Analytics 4 Property ID and connect to backend'}
            </small>
          </div>
        </div>

        <nav className="nav-menu">
          <NavItem
            id="overview"
            label="Overview"
            icon="📊"
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <NavItem
            id="traffic"
            label="Traffic & Acquisition"
            icon="🚦"
            isActive={activeTab === 'traffic'}
            onClick={setActiveTab}
          />
          <NavItem
            id="content"
            label="Content & Pages"
            icon="📄"
            isActive={activeTab === 'content'}
            onClick={setActiveTab}
          />
          <NavItem
            id="audience"
            label="Audience"
            icon="👥"
            isActive={activeTab === 'audience'}
            onClick={setActiveTab}
          />
          <NavItem
            id="conversions"
            label="Conversions"
            icon="🎯"
            isActive={activeTab === 'conversions'}
            onClick={setActiveTab}
          />
          <NavItem
            id="devices"
            label="Devices"
            icon="📱"
            isActive={activeTab === 'devices'}
            onClick={setActiveTab}
          />
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="header-top">
            <h1 className="header-title">Analytics Dashboard</h1>
            <div className="date-selector">
              <label htmlFor="dateRange">Date Range:</label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="last90days">Last 90 days</option>
                <option value="lastquarter">Last Quarter</option>
                <option value="lastyear">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          <div className="date-display">
            {getDateRange(dateRange).displayText}
          </div>
        </div>

        <div className="query-section">
          <div className="query-form">
            <input
              type="text"
              className="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your data... e.g., 'How much traffic did I get last week?'"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuerySubmit(e);
                }
              }}
            />
            <button
              className="query-button"
              disabled={isLoading}
              onClick={handleQuerySubmit}
            >
              {isLoading ? '🔄' : '🔍'} Ask
            </button>
          </div>
          {queryResponse && (
            <div className="query-response">
              💡 {queryResponse}
            </div>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;