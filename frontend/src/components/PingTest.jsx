import { useEffect, useState } from "react";

export default function PingTest() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("https://fisd-counselor.onrender.com/api/hello");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Backend Connection Test</h3>
      {loading && <p>Testing connection...</p>}
      {err && <p style={{ color: 'red' }}>Error: {err}</p>}
      {data && (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: '12px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
