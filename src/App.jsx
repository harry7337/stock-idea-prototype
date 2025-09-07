

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import TracklistMenu from "./TracklistMenu";
import { ALL_FIELDS, NUMERIC_FIELDS, FIELD } from "./fields";
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import ColumnSelector from "./ColumnSelector";
import { RegionSelect, SectorSelect, RoicSelect } from "./FilterSelects";
import DetailedAnalysis from "./DetailedAnalysis";
import ResultsTable from "./ResultsTable";
import { fetchSearchResults, textToFilters } from "./services/apiService";
import Navbar from "./components/Navbar";
import { useLocation } from 'react-router-dom';

function IdeaGenerationMenu() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [lastQuery, setLastQuery] = useState(null);
  // Tracklist state
  const [tracklist, setTracklist] = useState([]);
  const [tracklistOpen, setTracklistOpen] = useState(false);
  const prevTracklistLength = useRef(0);
  // Filter states for dropdowns
  const [marketCapMin, setMarketCapMin] = useState('');
  const [marketCapMax, setMarketCapMax] = useState('');
  const [region, setRegion] = useState('');
  const [sector, setSector] = useState('');
  const [roic, setRoic] = useState('');
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Add company to tracklist
  const handleAddToTracklist = useCallback((company) => {
    setTracklist((prev) => {
      if (!prev.some((c) => c.company_name === company.company_name)) {
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
  const columnSelectorRef = useRef(null);
  // Options menu for adding extra numeric filters
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef(null);
  const [extraNumericFilters, setExtraNumericFilters] = useState({}); // { field: { min, max } }

  // Close popovers (ColumnSelector and Options menu) when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedOutsideColumnSelector =
        showFieldDropdown && columnSelectorRef.current && !columnSelectorRef.current.contains(e.target);
      const clickedOutsideOptions =
        showOptionsMenu && optionsMenuRef.current && !optionsMenuRef.current.contains(e.target);
      if (clickedOutsideColumnSelector) setShowFieldDropdown(false);
      if (clickedOutsideOptions) setShowOptionsMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFieldDropdown, showOptionsMenu]);

  // Toggle extra numeric filter from menu
  const toggleExtraNumericField = (field) => {
    setExtraNumericFilters((prev) => {
      const next = { ...prev };
      if (next[field]) {
        delete next[field];
      } else {
        next[field] = { min: '', max: '' };
      }
      return next;
    });
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleExtraNumericChange = (field, bound, value) => {
    setExtraNumericFilters((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || { min: '', max: '' }), [bound]: value },
    }));
  };

  // Fetch search results
  const fetchPage = async (data, pageNum, fields = selectedFields) => {
    setLoading(true);
    try {
      const result = await fetchSearchResults(data, pageNum, fields);
      setPages(prev => ({ ...prev, [pageNum]: result }));
      setResponse(result);
      setCurrentPage(pageNum);
    } catch (err) {
      setResponse('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle text submission for LLM filter extraction
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setPages({});
    setCurrentPage(1);
    const form = formRef.current;
    const userText = form.description.value;
    if (!userText) {
      setResponse("Please enter a description.");
      setLoading(false);
      return;
    }
    try {
      const filters = await textToFilters(userText);
      
      setMarketCapMin(filters.marketCap?.min || '');
      setMarketCapMax(filters.marketCap?.max || '');
      setRegion(filters.region || '');
      setSector(filters.sector || '');
      setRoic(filters.roic || '');
    } catch (err) {
      setResponse('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual filter form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);
    setResponse(null);
    setPages({});
    setCurrentPage(1);
    // Use controlled state for filter values
    const noFilters =
      (!marketCapMin && !marketCapMax) &&
      !region &&
      !sector &&
      !roic &&
      Object.values(extraNumericFilters).every((v) => (v?.min ?? '') === '' && (v?.max ?? '') === '');
    if (noFilters) {
      setResponse("Please select at least one filter");
      return;
    }
    if (selectedFields.length === 0) {
      setResponse("Please select at least one column to display");
      return;
    }
    const numericFilters = Object.fromEntries(
      Object.entries(extraNumericFilters).filter(([, rng]) => (rng.min ?? '') !== '' || (rng.max ?? '') !== '')
    );
    const data = {
      marketCap: {
        min: marketCapMin,
        max: marketCapMax,
      },
      region,
      sector,
      roic,
      numericFilters,
    };
    console.log(data);
    
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
    <div className="idea-gen-container" style={{ position: "relative" }}>
      <h1 className="idea-gen-title">Idea Generation</h1>
      <p className="idea-gen-subtitle">
        Discover securities by specifying your criteria
      </p>
      <div
        ref={columnSelectorRef}
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "flex-end",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            position: "relative",
          }}
        >
          <ColumnSelector
            selectedFields={selectedFields}
            setSelectedFields={setSelectedFields}
            show={showFieldDropdown}
            setShow={setShowFieldDropdown}
          />
          {/* 3-dots options button moved to bottom-right of container */}
        </div>
      </div>
      <form className="idea-gen-form" ref={formRef} autoComplete="off">
        <div
          className="idea-gen-textarea-row"
          style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
        >
          <textarea
            className="idea-gen-textarea"
            name="description"
            placeholder="Describe the companies that you are looking for..."
            rows={2}
            style={{ color: "black" }}
            defaultValue={""}
          />
          <button
            type="button"
            className="navbar-btn"
            style={{ marginTop: 4 }}
            onClick={handleTextSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : "Text to Filters"}
          </button>
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
                value={marketCapMin}
                onChange={(e) => setMarketCapMin(e.target.value)}
              />
              <span style={{ color: "#faf8fb" }}>-</span>
              <input
                type="number"
                min="0"
                name="marketCapMax"
                placeholder="Max"
                style={{ color: "black", width: "80px" }}
                value={marketCapMax}
                onChange={(e) => setMarketCapMax(e.target.value)}
              />
            </div>
          </div>
          <div className="idea-gen-filter">
            <label>Geographical Region</label>
            <RegionSelect
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
          <div className="idea-gen-filter">
            <label>Primary Sector</label>
            <SectorSelect
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
          </div>
          <div className="idea-gen-filter">
            <label>ROIC</label>
            <RoicSelect
              value={roic}
              onChange={(e) => setRoic(e.target.value)}
            />
          </div>
          {/* Dynamically added numeric filters */}
          {Object.keys(extraNumericFilters).map((field) => {
            const meta = ALL_FIELDS.find((f) => f.value === field);
            const label = meta ? meta.label : field;
            const range = extraNumericFilters[field] || { min: "", max: "" };
            return (
              <div className="idea-gen-filter" key={field}>
                <label>{label}</label>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="number"
                    name={`${field}-min`}
                    placeholder="Min"
                    style={{ color: "black", width: "80px" }}
                    value={range.min}
                    onChange={(e) =>
                      handleExtraNumericChange(field, "min", e.target.value)
                    }
                  />
                  <span style={{ color: "#faf8fb" }}>-</span>
                  <input
                    type="number"
                    name={`${field}-max`}
                    placeholder="Max"
                    style={{ color: "black", width: "80px" }}
                    value={range.max}
                    onChange={(e) =>
                      handleExtraNumericChange(field, "max", e.target.value)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="idea-gen-btn-row" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          <button
            type="submit"
            className="navbar-btn"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Generating..." : "Generate Ideas"}
          </button>
          {/* Options button positioned absolutely on the right */}
          <div
            ref={optionsMenuRef}
            style={{ position: "absolute", right: 0 }}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={showOptionsMenu}
              className="navbar-btn"
              onClick={() => setShowOptionsMenu((v) => !v)}
              title="More filters"
              style={{
                background: "none",
                color: "#00796b",
                border: "none",
                outline: "none",
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "1.6rem",
                padding: "0.2rem 0.6rem",
                boxShadow: "none",
                cursor: "pointer",
              }}
            >
              ⋯
            </button>
            {showOptionsMenu && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  bottom: "120%",
                  right: 0,
                  minWidth: 260,
                  background: "#ffffff",
                  border: "1px solid #b2dfdb",
                  borderRadius: 8,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  padding: "0.5rem",
                  zIndex: 1200,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: "#00796b",
                    fontSize: "0.95rem",
                    padding: "0.25rem 0.5rem 0.5rem 0.5rem",
                  }}
                >
                  Add numeric filters
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    maxHeight: 240,
                    overflowY: "auto",
                  }}
                >
                  {NUMERIC_FIELDS.map((field) => {
                    const label = field.label;
                    const alreadyInForm = field.value === "mcap"; // Market Cap exists already
                    const disabled = alreadyInForm;
                    const checked = extraNumericFilters[field.value];
                    return (
                      <li key={field.value} style={{ padding: "0.25rem 0.5rem" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: disabled ? "not-allowed" : "pointer",
                            color: disabled ? "#9e9e9e" : "#004d40",
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={disabled}
                            checked={Boolean(checked)}
                            onChange={() => toggleExtraNumericField(field.value)}
                          />
                          <span>{label}</span>
                          {disabled && (
                            <span style={{ fontSize: "0.8rem", color: "#9e9e9e" }}>
                              {alreadyInForm ? "(already in form)" : "(not numeric)"}
                            </span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </form>
      
      {/* Container for side-by-side layout */}
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "2rem", alignItems: "flex-start", maxWidth: "100%", overflow: "hidden", minHeight: 0 }}>
        {/* Response section */}
        {response && (
          <div
            style={{
              width: "calc(100% - 350px)", // Fixed width accounting for TracklistMenu (320px) + gap (1.5rem)
              minWidth: 400, // Minimum width to ensure table remains usable
              maxWidth: "calc(100% - 350px)",
              textAlign: "left",
              background: "#f6fff6",
              border: "1px solid #b2dfdb",
              borderRadius: 8,
              padding: "1.5rem",
              color: "#222",
              wordBreak: "break-word",
              position: "relative",
              overflow: "hidden", // Contain any overflow
            }}
          >
            <strong>Response:</strong>
            {typeof response === "object" &&
            response.results &&
            Array.isArray(response.results) ? (
              <>
                <ResultsTable
                  response={response}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  loading={loading}
                  currentPage={currentPage}
                  handleBack={handleBack}
                  handleNext={handleNext}
                  handleAddToTracklist={handleAddToTracklist}
                  tracklist={tracklist}
                />
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
        
        {/* Tracklist section - using the actual TracklistMenu component */}
        {response && (<TracklistMenu
          tracklistOpen={true} // Always visible in side-by-side layout
          setTracklistOpen={setTracklistOpen}
          tracklist={tracklist}
          handleRemoveFromTracklist={handleRemoveFromTracklist}
          handleSubmitTracklist={handleSubmitTracklist}
        />)}
      </div>
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
