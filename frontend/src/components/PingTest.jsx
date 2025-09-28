import { useEffect, useState } from "react";

export default function PingTest() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const testConnection = async () => {
    try {
      setLoading(true);
      setErr(null);
      setData(null);
      
      console.log('Testing connection to:', 'https://fisd-counselor.onrender.com/api/hello');
      
      // First try the ping endpoint (faster)
      try {
        const pingRes = await fetch("https://fisd-counselor.onrender.com/api/ping", {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (pingRes.ok) {
          console.log('Ping successful, server is warm');
        }
      } catch (e) {
        console.log('Ping failed, server may be cold starting');
      }
      
      // Now try the main endpoint with longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for Render cold starts
      
      const res = await fetch("https://fisd-counselor.onrender.com/api/hello", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const json = await res.json();
      console.log('Response data:', json);
      setData(json);
    } catch (e) {
      console.error('Connection test error:', e);
      if (e.name === 'AbortError') {
        setErr('Request timeout - Render server is cold starting (this is normal on free tier)');
      } else {
        setErr(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, [retryCount]);

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Backend Connection Test</h3>
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          style={{
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
      {loading && <p>Testing connection... (attempt {retryCount + 1})</p>}
      {err && <p style={{ color: 'red' }}>Error: {err}</p>}
      {data && (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: '12px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
