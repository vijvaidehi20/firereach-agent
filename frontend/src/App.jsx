import { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    company: '',
    icp: '',
    email: '',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/run-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Network Error: Could not connect to the backend server. Make sure it is running on http://127.0.0.1:8000.');
      } else {
        setError(err.message || 'An error occurred while running the agent.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FireReach Autonomous Outreach</h1>
        <p>AI-Driven Targeted Outreach Automation</p>
      </header>

      <main className="app-main">
        <div className="card form-card">
          <form onSubmit={handleSubmit} className="agent-form">
            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g. Acme Corp"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="icp">Ideal Customer Profile (ICP)</label>
              <input
                type="text"
                id="icp"
                name="icp"
                value={formData.icp}
                onChange={handleInputChange}
                placeholder="e.g. VP of Engineering at B2B SaaS"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Target Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. target@example.com"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Running Agent...
                </>
              ) : (
                'Run Agent'
              )}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>

        {results && (
          <div className="results-container">
            <div className="result-section">
              <h2>Top Signals</h2>
              {results.signals && results.signals.length > 0 ? (
                <ul className="signals-list">
                  {results.signals.map((signal, idx) => (
                    <li key={idx} className="signal-item">
                      <span className="signal-icon">⚡</span>
                      {signal}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No signals found.</p>
              )}
            </div>

            <div className="result-section">
              <h2>Account Brief</h2>
              <div className="markdown-content">
                {results.account_brief ? (
                   <p>{results.account_brief}</p>
                ) : (
                   <p className="no-data">No account brief generated.</p>
                )}
              </div>
            </div>

            <div className="result-section highlight-section">
              <h2>Generated Outreach Email</h2>
              <div className="email-preview">
                {results.generated_email ? (
                  <pre>{results.generated_email}</pre>
                ) : (
                  <p className="no-data">No email generated.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
