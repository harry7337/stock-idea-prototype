

import { useState, useRef, useEffect, useCallback } from 'react';
import TracklistMenu from "./TracklistMenu";
import { ALL_FIELDS } from "./fields";
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import ColumnSelector from "./ColumnSelector";
import { RegionSelect, SectorSelect, RoicSelect } from "./FilterSelects";
import DetailedAnalysis from "./DetailedAnalysis";
import { useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isIdeaGen = location.pathname === '/idea-generation';
  const isDetailedAnalysis = location.pathname === '/detailed-analysis';
  return (
    <nav className="navbar">
      <div className="navbar-logo" style={{ paddingLeft: '2rem' }}>
        <img
          src="/logo.png"
          alt="Stock Idea Logo"
          className="company-logo"
          style={{ height: '60px' }}
        />
      </div>
      <div className="navbar-actions" style={{ paddingRight: '2rem', display: 'flex', gap: '1.5rem' }}>
        <button
          className="navbar-btn"
          style={{
            background: 'none',
            color: '#00796b',
            border: 'none', // Remove all borders
            outline: 'none', // Remove outline
            borderRadius: 0,
            fontWeight: 500,
            fontSize: '1rem',
            padding: '0.6rem 1.3rem 0.3rem 1.3rem',
            boxShadow: 'none',
            borderBottom: isIdeaGen ? '2.5px solid #000' : '2.5px solid transparent',
            transition: 'border-bottom 0.2s',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/idea-generation')}
        >
          Idea Generation
        </button>
        <button
          className="navbar-btn"
          style={{
            background: 'none',
            color: '#00796b',
            border: 'none', // Remove all borders
            outline: 'none', // Remove outline
            borderRadius: 0,
            fontWeight: 500,
            fontSize: '1rem',
            padding: '0.6rem 1.3rem 0.3rem 1.3rem',
            boxShadow: 'none',
            borderBottom: isDetailedAnalysis ? '2.5px solid #000' : '2.5px solid transparent',
            transition: 'border-bottom 0.2s',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/detailed-analysis')}
        >
          Unstructured Analysis
        </button>
      </div>
    </nav>
  );
}


function IdeaGenerationMenu() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({}); // {pageNum: response}
  const [currentPage, setCurrentPage] = useState(1);
  const [lastQuery, setLastQuery] = useState(null); // store last query params for pagination
  // Tracklist state
  const [tracklist, setTracklist] = useState([]);
  const [tracklistOpen, setTracklistOpen] = useState(false);
  const prevTracklistLength = useRef(0);
  // Add company to tracklist
  const handleAddToTracklist = useCallback((company) => {
    setTracklist((prev) => {
      if (!prev.some((c) => c.company_name === company.company_name)) {
        // Always include exchange_ticker field
        const withTicker = {
          ...company,
          exchange_ticker: company.exchange_ticker || (company["exchange_ticker"] ?? "")
        };
        setTracklistOpen(true);
        return [...prev, withTicker];
      }
      setTracklistOpen(true);
      return prev;
    });
  }, []);

  // Remove company from tracklist
  const handleRemoveFromTracklist = (companyName) => {
    setTracklist((prev) => prev.filter((c) => c.company_name !== companyName));
  };

  // Submit tracklist (placeholder)
  const handleSubmitTracklist = () => {
    alert('Tracklist submitted! Companies: ' + tracklist.map(c => c.company_name).join(', '));
    setTracklistOpen(false);
  };

  const allFields = [
    { label: "Company Name", value: "company_name" },
    { label: "Growth Score", value: "growth_score" },
    { label: "Exchange Ticker", value: "exchange_ticker" },
    { label: "Industry", value: "industry_classifications" },
    { label: "Region", value: "geographic_locations" },
    { label: "Market Cap", value: "mcap" },
    { label: "Latest Q", value: "latest_q" },
    { label: "Q+1", value: "q_plus_1" },
    { label: "FY+1", value: "fy_plus_1" },
    { label: "FY+2", value: "fy_plus_2" },
    { label: "Surprise %", value: "surprice_perc" },
    { label: "Revision", value: "revision" },
    { label: "15d %", value: "15d_perc" },
    { label: "30d %", value: "30d_perc" },
    { label: "60d %", value: "60d_perc" },
    { label: "90d %", value: "90d_perc" },
  ];

const DEFAULT_FIELDS = [
  'company_name',
  'exchange_ticker',
  'industry_classifications',
  'geographic_locations',
  'growth_score',
  'mcap',
];
const formRef = useRef();
const [selectedFields, setSelectedFields] = useState(DEFAULT_FIELDS);
const [showFieldDropdown, setShowFieldDropdown] = useState(false);

  const fetchPage = async (data, pageNum, fields = selectedFields) => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const fieldsParam = fields.join(',');
      const res = await fetch(
        `${apiBase}/search?fields=${fieldsParam}&limit=10&offset=${(pageNum - 1) * 10}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        // Not JSON, fallback to text
      }
      setPages(prev => ({ ...prev, [pageNum]: json || text }));
      setResponse(json || text);
      setCurrentPage(pageNum);
    } catch (err) {
      setResponse('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);
    setResponse(null);
    setPages({});
    setCurrentPage(1);
    const form = formRef.current;
    const marketCapMin = form.marketCapMin.value;
    const marketCapMax = form.marketCapMax.value;
    const region = form.region.value;
    const sector = form.sector.value;
    const roic = form.roic.value;

    // Check if all filters are empty
    const noFilters =
      (!marketCapMin && !marketCapMax) &&
      !region &&
      !sector &&
      !roic;
    if (noFilters) {
      setResponse("Please select at least one filter");
      return;
    }

    if (selectedFields.length === 0) {
      setResponse("Please select at least one column to display");
      return;
    }

    const data = {
      marketCap: {
        min: marketCapMin,
        max: marketCapMax,
      },
      region,
      sector,
      roic,
    };
    setLastQuery(data);
    fetchPage(data, 1, selectedFields);
  };

  const handleNext = () => {
    const nextPage = currentPage + 1;
    if (pages[nextPage]) {
      setResponse(pages[nextPage]);
      setCurrentPage(nextPage);
    } else if (lastQuery) {
      fetchPage(lastQuery, nextPage, selectedFields);
    }
  };

  const handleBack = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1 && pages[prevPage]) {
      setResponse(pages[prevPage]);
      setCurrentPage(prevPage);
    }
  };

  const handleFieldChange = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  return (
    <div className="idea-gen-container">
      <h1 className="idea-gen-title">Idea Generation</h1>
      <p className="idea-gen-subtitle">
        Discover securities by specifying your criteria
      </p>
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "flex-end",
          position: "relative",
          zIndex: 10,
        }}
      >
        <ColumnSelector selectedFields={selectedFields} setSelectedFields={setSelectedFields} show={showFieldDropdown} setShow={setShowFieldDropdown} />
      </div>
      <form
        className="idea-gen-form"
        ref={formRef}
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="idea-gen-textarea-row">
          <textarea
            className="idea-gen-textarea"
            name="description"
            placeholder="Describe the companies that you are looking for..."
            rows={2}
            style={{ color: "black" }}
          />
        </div>
        <div className="idea-gen-or">OR</div>
        <div className="idea-gen-filters-row">
          <div className="idea-gen-filter">
            <label>Market Cap (in Million $)</label>
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <input
                type="number"
                min="0"
                name="marketCapMin"
                placeholder="Min"
                style={{ color: "black", width: "80px" }}
              />
              <span style={{ color: "#faf8fb" }}>-</span>
              <input
                type="number"
                min="0"
                name="marketCapMax"
                placeholder="Max"
                style={{ color: "black", width: "80px" }}
              />
            </div>
          </div>
          <div className="idea-gen-filter">
            <label>Geographical Region</label>
            <RegionSelect />
          </div>
          <div className="idea-gen-filter">
            <label>Primary Sector</label>
            <SectorSelect />
          </div>
          <div className="idea-gen-filter">
            <label>ROIC</label>
            <RoicSelect />
          </div>
        </div>
        <div className="idea-gen-btn-row">
          <button type="submit" className="navbar-btn" disabled={loading}>
            {loading ? "Generating..." : "Generate Ideas"}
          </button>
        </div>
      </form>
      {response && (
        <div
          style={{
            marginTop: "2rem",
            textAlign: "left",
            maxWidth: 900,
            marginLeft: "auto",
            marginRight: "auto",
            background: "#f6fff6",
            border: "1px solid #b2dfdb",
            borderRadius: 8,
            padding: "1.5rem",
            color: "#222",
            wordBreak: "break-word",
            position: "relative",
          }}
        >
          <strong>Response:</strong>
          {typeof response === "object" &&
          response.results &&
          Array.isArray(response.results) ? (
            <>
              <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#e0f7fa" }}>
                      {Object.keys(response.results[0] || {}).map((col, idx) => {
                        const field = ALL_FIELDS.find(f => f.value === col);
                        return (
                          <th
                            key={col}
                            style={{
                              padding: "0.75rem",
                              borderBottom: "2px solid #b2dfdb",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#00796b",
                              fontSize: "1rem",
                            }}
                          >
                            {field ? field.label : col}
                          </th>
                        );
                      })}
                      {/* Extra column for plus button */}
                      {response.results[0]?.company_name && (
                        <th style={{ width: 40 }}></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {response.results.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          background: i % 2 === 0 ? "#f9f9f9" : "#f1f8e9",
                        }}
                      >
                        {Object.entries(row).map(([col, val], j) => (
                          <td
                            key={j}
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #e0e0e0",
                              fontSize: "0.97rem",
                              color: "#333",
                              position: col === 'company_name' ? 'relative' : undefined,
                            }}
                          >
                            {val}
                            {/* Plus button for company_name */}
                            {col === 'company_name' && (
                              <button
                                title="Add to Tracklist"
                                style={{
                                  marginLeft: 8,
                                  background: 'none',
                                  border: 'none',
                                  borderRadius: 0,
                                  width: 'auto',
                                  height: 'auto',
                                  cursor: 'pointer',
                                  color: '#00796b',
                                  fontWeight: 'bold',
                                  fontSize: 18,
                                  verticalAlign: 'middle',
                                  boxShadow: 'none',
                                  padding: 0,
                                }}
                                onClick={() => handleAddToTracklist(row)}
                                disabled={tracklist.some(c => c.company_name === row.company_name)}
                              >
                                +
                              </button>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  className="navbar-btn"
                  onClick={handleBack}
                  disabled={loading || currentPage === 1}
                  style={{ opacity: loading || currentPage === 1 ? 0.5 : 1 }}
                >
                  Back
                </button>
                <span
                  style={{
                    alignSelf: "center",
                    color: "#00796b",
                    fontWeight: 500,
                  }}
                >
                  Page {currentPage}
                </span>
                <button
                  className="navbar-btn"
                  onClick={handleNext}
                  disabled={loading || response.results.length < 10}
                  style={{
                    opacity: loading || response.results.length < 10 ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
              {/* Tracklist Side Menu (moved to separate component) */}
              <TracklistMenu
                tracklistOpen={tracklistOpen}
                setTracklistOpen={setTracklistOpen}
                tracklist={tracklist}
                handleRemoveFromTracklist={handleRemoveFromTracklist}
                handleSubmitTracklist={handleSubmitTracklist}
              />
              {/* Floating button to open tracklist if closed and has items */}
              {tracklist.length > 0 && (
                <button
                  style={{
                    position: 'fixed',
                    right: 20,
                    bottom: 30,
                    zIndex: 1100,
                    background: 'none',
                    color: '#00796b',
                    border: 'none',
                    borderRadius: 0,
                    width: 'auto',
                    height: 'auto',
                    fontSize: 36,
                    boxShadow: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title="Open Tracklist"
                  onClick={() => setTracklistOpen(true)}
                  aria-label="Open Tracklist"
                >
                  ★
                </button>
              )}
            </>
          ) : (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
              }}
            >
              {typeof response === "string"
                ? response
                : JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NavbarWrapper><div style={{ marginTop: '5rem', textAlign: 'center' }}><h1>Welcome to Stock Idea Prototype</h1></div></NavbarWrapper>} />
        <Route path="/idea-generation" element={<NavbarWrapper><IdeaGenerationMenu /></NavbarWrapper>} />
  <Route path="/detailed-analysis" element={<NavbarWrapper><DetailedAnalysis /></NavbarWrapper>} />
      </Routes>
    </Router>
  );
}

function NavbarWrapper({ children }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  );
}
export default App
