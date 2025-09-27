import React, { useState, useEffect } from 'react';

const DebugPanel = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [middlewareFlow, setMiddlewareFlow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        setLoading(true);
        
        // First, fetch the middleware flow data
        const flowResponse = await fetch('/api/debug/middleware-flow');
        let flowData = [];
        
        try {
          if (flowResponse.ok) {
            flowData = await flowResponse.json();
          }
        } catch (e) {
          console.error("Error fetching middleware flow:", e);
        }
        
        // Then fetch the country code API directly
        const response = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
        
        if (!response.ok) {
          throw new Error(`API failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        setApiResponse(data);
        setMiddlewareFlow(flowData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryCode();
  }, []);

  const panelStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '15px',
    zIndex: 9999,
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    fontFamily: 'monospace'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const sectionStyle = {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    border: '1px solid #ddd'
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0 }}>API Debug Panel</h3>
      </div>
      
      {loading ? (
        <p>Loading API response...</p>
      ) : error ? (
        <div>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      ) : (
        <>
          <div style={sectionStyle}>
            <h4>Middleware Execution Flow:</h4>
            <div style={{ 
              backgroundColor: '#333', 
              color: '#fff', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {middlewareFlow.length > 0 ? (
                <ol style={{ paddingLeft: '20px', margin: '0' }}>
                  {middlewareFlow.map((step, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No middleware flow data available. Create an API route at /api/debug/middleware-flow to track flow.</p>
              )}
            </div>
            
            <div style={{ marginTop: '10px' }}>
              <h5>Manual Middleware Flow Check:</h5>
              <div style={{ backgroundColor: '#f8f8f8', padding: '10px', borderRadius: '4px' }}>
                <p><strong>countryRes.ok condition:</strong> {apiResponse ? "TRUE" : "FALSE"}</p>
                <p><strong>data && data.country_code condition:</strong> {apiResponse && apiResponse.country_code ? "TRUE" : "FALSE"}</p>
                <p><strong>Country code value:</strong> {apiResponse && apiResponse.country_code ? apiResponse.country_code : "Not found"}</p>
              </div>
            </div>
          </div>
          
          <div style={sectionStyle}>
            <h4>get-country-code API Response:</h4>
            <pre style={{ 
              backgroundColor: '#333', 
              color: '#fff', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
            
            <div style={{ marginTop: '10px' }}>
              <h4>Response Structure:</h4>
              <ul>
                <li>Response type: <strong>{typeof apiResponse}</strong></li>
                <li>Has country_code: <strong>{apiResponse.country_code ? 'Yes' : 'No'}</strong></li>
                <li>country_code value: <strong>{apiResponse.country_code || 'Not found'}</strong></li>
                <li>Has location: <strong>{apiResponse.location ? 'Yes' : 'No'}</strong></li>
                {apiResponse.location && (
                  <>
                    <li>location.hreflang: <strong>{apiResponse.location.hreflang || 'Not found'}</strong></li>
                    <li>location.country_code: <strong>{apiResponse.location.country_code || 'Not found'}</strong></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DebugPanel;