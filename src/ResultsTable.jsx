import { useMemo, useState } from 'react';
import { ALL_FIELDS, NUMERIC_FIELDS } from "./fields";

function ResultsTable({
  response,
  sortConfig,
  setSortConfig,
  loading,
  currentPage,
  handleBack,
  handleNext,
  handleAddToTracklist,
  tracklist
}) {
  // Numeric fields eligible for sorting
  const NUMERIC_FIELD_SET = new Set(NUMERIC_FIELDS.map(field => field.value));
  
  // State for Growth Score tooltip
  const [growthScoreTooltip, setGrowthScoreTooltip] = useState({ 
    show: false, 
    rowIndex: null, 
    value: null, // Add value to store the hovered growth score
    position: { x: 0, y: 0 } 
  });

  // Derived sorted results (client-side sort only for current page)
  const sortedResults = useMemo(() => {
    if (!response || typeof response !== 'object' || !Array.isArray(response.results)) return [];
    if (!sortConfig.key) return response.results;
    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;
    // Shallow copy
    return [...response.results].sort((a, b) => {
      const avRaw = a[key];
      const bvRaw = b[key];
      // Attempt numeric parse; fall back to string compare
      const parseNum = (v) => {
        if (v === null || v === undefined) return NaN;
        const num = parseFloat(String(v).replace(/[^0-9+\-\.eE]/g, ''));
        return isNaN(num) ? NaN : num;
      };
      const avNum = parseNum(avRaw);
      const bvNum = parseNum(bvRaw);
      if (!isNaN(avNum) && !isNaN(bvNum)) {
        if (avNum === bvNum) return 0;
        return avNum > bvNum ? dir : -dir;
      }
      // Fallback lexicographic
      const as = String(avRaw ?? '');
      const bs = String(bvRaw ?? '');
      if (as === bs) return 0;
      return as > bs ? dir : -dir;
    });
  }, [response, sortConfig]);

  const handleSortToggle = (col) => {
    setSortConfig((prev) => {
      if (prev.key === col) {
        // toggle direction
        return { key: col, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: col, direction: 'asc' };
    });
  };

  if (!response) return null;

return (
  <div style={{ marginTop: "1rem", maxWidth: "100%", minWidth: 0 }}>
    <div
      style={{
        fontSize: "0.95rem",
        color: "#00796b",
        marginBottom: "0.5rem",
        textAlign: "right",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
      }}
    >
      <span style={{ display: "inline-block", marginRight: 4 }}>
        Scroll horizontally to see more columns
      </span>
      <span style={{ fontSize: "1.2rem", userSelect: "none" }}>⇄</span>
    </div>
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table
        style={{
          minWidth: "900px",
          borderCollapse: "collapse",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          tableLayout: "auto",
        }}
      >
        <thead>
          <tr style={{ background: "#e0f7fa" }}>
            {Object.keys(response.results[0] || {}).map((col, idx) => {
              const field = ALL_FIELDS.find((f) => f.value === col);
              if (field !== undefined) {
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
                      whiteSpace: "nowrap",
                      maxWidth: 220,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {field ? field.label : col}
                      {NUMERIC_FIELD_SET.has(col) && (
                        <button
                          type="button"
                          onClick={() => handleSortToggle(col)}
                          title={
                            sortConfig.key === col
                              ? `Sort ${
                                  sortConfig.direction === "asc"
                                    ? "descending"
                                    : "ascending"
                                }`
                              : "Sort ascending"
                          }
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            cursor: "pointer",
                            color: "#004d40",
                            fontSize: "0.85rem",
                            lineHeight: 1,
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          aria-label={`Sort by ${col}`}
                        >
                          {sortConfig.key === col
                            ? sortConfig.direction === "asc"
                              ? "▲"
                              : "▼"
                            : "⇅"}
                        </button>
                      )}
                    </span>
                  </th>
                );
              }
            })}
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((row, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 0 ? "#f9f9f9" : "#f1f8e9",
              }}
            >
              {Object.entries(row)
                .filter(([col]) => {
                  const firstRow = response.results[0] || {};
                  return (
                    Object.prototype.hasOwnProperty.call(firstRow, col) &&
                    ALL_FIELDS.some((f) => f.value === col)
                  );
                })
                .map(([col, val], j) => (
                  <td
                    key={j}
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #e0e0e0",
                      fontSize: "0.97rem",
                      color: "#333",
                      position:
                        col === "company_name" || col === "growth_score"
                          ? "relative"
                          : undefined,
                      width: 220, // enforce column width so wrapping triggers
                      maxWidth: 220,
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere", // allow breaking long tokens
                      cursor: col === "growth_score" ? "help" : "default",
                    }}
                    onMouseEnter={
                      col === "growth_score"
                        ? (e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setGrowthScoreTooltip({
                              show: true,
                              rowIndex: i,
                              value: {
                                value: val,
                                structured: [row["mm"], row["rsr"], row["hfg"]],
                                unstructured: [
                                  row["mtg"],
                                  row["br"],
                                  row["ui"],
                                ],
                              }, // Pass the components of growth score: mm, rsr, hfg
                              position: {
                                x: rect.left + rect.width / 2,
                                y: rect.top - 70, // Moved further up to avoid covering the value
                              },
                            });
                          }
                        : undefined
                    }
                    onMouseLeave={
                      col === "growth_score"
                        ? () => {
                            setGrowthScoreTooltip((prev) => ({
                              ...prev,
                              show: false,
                            }));
                          }
                        : undefined
                    }
                  >
                    {val}
                    {/* Plus button for company_name */}
                    {col === "company_name" && (
                      <button
                        title="Add to Tracklist"
                        style={{
                          marginLeft: 8,
                          background: "none",
                          border: "none",
                          borderRadius: 0,
                          width: "auto",
                          height: "auto",
                          cursor: "pointer",
                          color: "#00796b",
                          fontWeight: "bold",
                          fontSize: 18,
                          verticalAlign: "middle",
                          boxShadow: "none",
                          padding: 0,
                        }}
                        onClick={() => handleAddToTracklist(row)}
                        disabled={tracklist.some(
                          (c) => c.company_name === row.company_name
                        )}
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

    {/* Growth Score Tooltip */}
    {growthScoreTooltip.show && (
      <div
        style={{
          position: "fixed",
          left: growthScoreTooltip.position.x - 100, // Center the tooltip
          top: growthScoreTooltip.position.y - 140, // Position well above the cell to keep value visible
          width: 400,
          backgroundColor: "#1a1a2e",
          border: "1px solid #00796b",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          zIndex: 1000,
          color: "#faf8fb",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          pointerEvents: "auto", // Allow mouse events so tooltip can be hovered
        }}
        onMouseEnter={() => {
          // Keep tooltip visible when mouse enters tooltip
          setGrowthScoreTooltip((prev) => ({ ...prev, show: true }));
        }}
        onMouseLeave={() => {
          // Hide tooltip when mouse leaves tooltip
          setGrowthScoreTooltip((prev) => ({ ...prev, show: false }));
        }}
      >
        <div
          style={{
            fontWeight: "600",
            color: "#00796b",
            marginBottom: "0.75rem",
            fontSize: "1rem",
          }}
        >
          Growth Score: {growthScoreTooltip.value["value"]}
        </div>

        {/* Dynamic interpretation based on score value */}
        {/* <div
                    style={{
                        marginBottom: "0.75rem",
                        padding: "0.5rem",
                        backgroundColor: "#2a2a4e",
                        borderRadius: "6px",
                    }}
                >
                    <strong style={{ color: "#4dd0e1" }}>Score Interpretation:</strong>
                    <div style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
                        {(() => {
                            const score = parseFloat(growthScoreTooltip.value["value"]);
                            if (isNaN(score)) return "Invalid score";
                            if (score >= 80)
                                return "🚀 Exceptional growth potential - Top tier investment opportunity";
                            if (score >= 60)
                                return "📈 Strong growth prospects - Above average performance expected";
                            if (score >= 40)
                                return "📊 Moderate growth potential - Average market performance";
                            if (score >= 20)
                                return "⚠️ Limited growth prospects - Below average performance";
                            return "🔻 Poor growth outlook - High risk investment";
                        })()}
                    </div>
                </div> */}

        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.5rem",
            backgroundColor: "#2a2a4e",
            borderRadius: "6px",
          }}
        >
          <strong style={{ color: "#4dd0e1" }}>Structured Scores:</strong>
          <div style={{ marginTop: "0.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.25rem",
              }}
            >
              <span>MM (Market Momentum):</span>
              <span style={{ fontWeight: "600" }}>
                {growthScoreTooltip.value["structured"][0] || "N/A"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.25rem",
              }}
            >
              <span>RSR (Revenue surprise & revisions):</span>
              <span style={{ fontWeight: "600" }}>
                {growthScoreTooltip.value["structured"][1] || "N/A"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>HFG (Historical & Forward Growth Estimates):</span>
              <span style={{ fontWeight: "600" }}>
                {growthScoreTooltip.value["structured"][2] || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div
            style={{
                marginBottom: "0.75rem",
                padding: "0.5rem",
                backgroundColor: "#2a2a4e",
                borderRadius: "6px",
            }}
            >
            <strong style={{ color: "#4dd0e1" }}>Unstructured Scores:</strong>
            <div style={{ marginTop: "0.5rem" }}>
            <div
                style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.25rem",
                }}
            >
                <span>MTG (Management Tone & Guidance Score):</span>
                <span style={{ fontWeight: "600" }}>
                {growthScoreTooltip.value["unstructured"][0] || "N/A"}
                </span>
            </div>
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#b2dfdb",
            marginTop: "0.75rem",
          }}
        >
          Last updated: Q3 2024
        </div>
        </div>
        </div>
    )}
  </div>
);
}

export default ResultsTable;
