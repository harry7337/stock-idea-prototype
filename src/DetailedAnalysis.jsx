
import React, { useState, useEffect } from 'react';

function DetailedAnalysis() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Preload dates: today and previous 5 days
    const today = new Date();
    const dateArr = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dateArr.push(d.toISOString().slice(0, 10));
    }
    setDates(dateArr);
    setSelectedDate(dateArr[0]);
    fetchCompanies(dateArr[0]);
  }, []);

  const fetchCompanies = async (selectedDate) =>{
    setSelectedDate(selectedDate);

    if (!selectedDate) {
      setCompanies([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch tickers for the selected date
      const apiBase =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      // Get tickers for the selected date
      const tickersRes = await fetch(
        `${apiBase}/get-tickers?date=${selectedDate}`
      );
      const tickersData = await tickersRes.json();

      if (tickersData["exchange_tickers"].length === 0) {
        setCompanies([]);
        setLoading(false);
        return;
      }
      console.log("Making call to /search");
      const data = tickersData["exchange_tickers"];
      // Now fetch company data from /search
      const searchRes = await fetch(
        `${apiBase}/search?fields=company_name,growth_score,exchange_ticker,mtg,ui,br`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exchange_ticker: data }),
        }
      );
      const searchData = await searchRes.json();
      if (searchData && Array.isArray(searchData.results)) {
        setCompanies(searchData.results);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      setError("Failed to load companies.");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "80vh",
        marginTop: "4rem",
        position: "relative",
      }}
    >
      {/* Side menu for dates at the absolute left edge */}
      <div
        style={{
          position: "fixed",
          top: 110, // height of navbar
          left: 0,
          height: "calc(100vh - 60px)",
          width: 220,
          background: "#f5f5f5",
          borderRight: "1px solid #e0e0e0",
          padding: "0 1rem", // Remove top padding
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: "100%",
            background: "inherit",
            padding: "1.5rem 0 0.5rem 0",
            position: "sticky",
            top: 0,
            zIndex: 101,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 32,
                background: "linear-gradient(180deg, #26c6da 0%, #00796b 100%)",
                borderRadius: 3,
                marginRight: 14,
                boxShadow: "0 2px 8px rgba(38,198,218,0.12)",
              }}
            />
            <span
              style={{
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#00796b",
                letterSpacing: "0.04em",
                textShadow: "0 1px 6px #b2dfdb44",
                textTransform: "uppercase",
                lineHeight: 1.1,
              }}
            >
              Select Date
            </span>
          </div>
        </div>
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => fetchCompanies(date)}
            style={{
              background: selectedDate === date ? "#e0f7fa" : "none",
              color: "#00796b",
              border: "none",
              borderLeft:
                selectedDate === date
                  ? "4px solid #00796b"
                  : "4px solid transparent",
              borderRadius: 0,
              textAlign: "left",
              padding: "0.7rem 1rem",
              fontWeight: selectedDate === date ? 700 : 500,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.2s, border-left 0.2s",
            }}
          >
            {date}
          </button>
        ))}
      </div>
      {/* Main content area, with left margin to accommodate sidebar */}
      <div
        style={{
          flex: 1,
          padding: "2.5rem",
          textAlign: "left",
          marginLeft: 220,
        }}
      >
        <h1 style={{ color: "#00796b", fontWeight: 700 }}>
          Unstructured Analysis
        </h1>
        <h3 style={{ color: "#333", marginTop: "1.5rem" }}>
          Companies for {selectedDate}
        </h3>
        <div style={{ overflowX: "auto", marginTop: "1.5rem" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              minWidth: 400,
              maxWidth: 900,
            }}
          >
            <thead>
              <tr style={{ background: "#e0f7fa" }}>
                <th
                  style={{
                    padding: "0.75rem",
                    borderBottom: "2px solid #b2dfdb",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#00796b",
                    fontSize: "1rem",
                  }}
                >
                  Company Name
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    borderBottom: "2px solid #b2dfdb",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#00796b",
                    fontSize: "1rem",
                  }}
                >
                  Growth Score
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    borderBottom: "2px solid #b2dfdb",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#00796b",
                    fontSize: "1rem",
                  }}
                >
                  MTG
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    borderBottom: "2px solid #b2dfdb",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#00796b",
                    fontSize: "1rem",
                  }}
                >
                  UI
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    borderBottom: "2px solid #b2dfdb",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#00796b",
                    fontSize: "1rem",
                  }}
                >
                  BR
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "1.5rem",
                      textAlign: "center",
                      color: "#888",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "1.5rem",
                      textAlign: "center",
                      color: "red",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "1.5rem",
                      textAlign: "center",
                      color: "#888",
                    }}
                  >
                    No data for this date.
                  </td>
                </tr>
              ) : (
                companies.map((row, i) => (
                  <tr
                    key={i}
                    style={{ background: i % 2 === 0 ? "#f9f9f9" : "#f1f8e9" }}
                  >
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #e0e0e0",
                        fontSize: "0.97rem",
                        color: "#333",
                      }}
                    >
                      {row.company_name}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #e0e0e0",
                        fontSize: "0.97rem",
                        color: "#333",
                      }}
                    >
                      {row.growth_score}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #e0e0e0",
                        fontSize: "0.97rem",
                        color: "#333",
                      }}
                    >
                      {row.mtg}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #e0e0e0",
                        fontSize: "0.97rem",
                        color: "#333",
                      }}
                    >
                      {row.ui}
                    </td> 
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #e0e0e0",
                        fontSize: "0.97rem",
                        color: "#333",
                      }}
                    >
                      {row.br}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default DetailedAnalysis;
