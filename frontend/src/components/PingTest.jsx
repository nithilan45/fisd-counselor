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
    <div className="mx-4 mt-4 mb-2">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Backend Connection Test</h3>
          </div>
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Testing connection... (attempt {retryCount + 1})</span>
          </div>
        )}
        {err && (
          <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-xs">!</span>
            </div>
            <span>Error: {err}</span>
          </div>
        )}
        {data && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
