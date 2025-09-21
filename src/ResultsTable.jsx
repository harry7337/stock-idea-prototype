import { useMemo, useState } from 'react';
import { ALL_FIELDS, NUMERIC_FIELDS } from "./fields";
import GrowthScoreTooltip from "./components/GrowthScoreTooltip";

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
                        col === "company_name" || ["growth_score", "mtg", "br"].includes(col)
                          ? "relative"
                          : undefined,
                      width: 220, // enforce column width so wrapping triggers
                      maxWidth: 220,
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere", // allow breaking long tokens
                      cursor: ["growth_score", "mtg", "br"].includes(col) ? "help" : "default",
                    }}
                    onMouseEnter={
                      ["growth_score", "mtg", "br", "ui"].includes(col)
                        ? (e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            
                            // Determine tooltip configuration based on column
                            const getTooltipConfig = (columnType) => {
                              switch(columnType) {
                                case "growth_score":
                                  return {
                                    showStructured: true,
                                    showUnstructured: true,
                                    value: {
                                      value: val,
                                      structured: [row["mm"], row["rsr"], row["hfg"]],
                                      unstructured: [row["mtg"], row["br"], row["ui"]],
                                    }
                                  };
                                case "mtg":
                                  return {
                                    title: "MTG",
                                    showStructured: false,
                                    showUnstructured: true,
                                    unstructured_labels: ["MTG", "MTG Keyword Count", "MTG Confidence to Hedging Ratio"],
                                    value: {
                                      value: val,
                                      structured: [],
                                      unstructured: [
                                        row["mtg"],
                                        row["mtg_keyword_count"],
                                        row["mtg_confidence_to_hedging_ratio"],
                                      ],
                                    },
                                  };
                                case "ui":
                                  return {
                                    title: "UI",
                                    showStructured: false,
                                    showUnstructured: true,
                                    unstructured_labels: ["UI", "UI Competition Risk Level", "UI Regulatory Disruption Risk Level", "UI Other Idiosyncratic Risks"],
                                    value: {
                                      value: val,
                                      structured: [],
                                      unstructured: [
                                        row["ui"],
                                        row["ui_competition_risk_level"],
                                        row[
                                          "ui_regulatory_disruption_risk_level"
                                        ],
                                        row["ui_other_idiosyncratic_risks"]
                                      ],
                                    },
                                  };
                                case "br":
                                  return {
                                    title: "BR",
                                    showStructured: false,
                                    showUnstructured: true,
                                    unstructured_labels: ["BR", "BR Key Growth Drivers"],
                                    value: {
                                      value: val,
                                      structured: [],
                                      unstructured: [
                                        row["br"],
                                        row["br_key_growth_drivers"]
                                      ],
                                    },
                                  };
                                default:
                                  return {
                                    showStructured: false,
                                    showUnstructured: false,
                                    value: {
                                      value: val,
                                      structured: [],
                                      unstructured: [],
                                    }
                                  };
                              }
                            };

                            const config = getTooltipConfig(col);
                            
                            setGrowthScoreTooltip({
                              show: true,
                              rowIndex: i,
                              ...config,
                              position: {
                                x: rect.left + rect.width / 2,
                                y: rect.top - 70,
                              },
                            });
                          }
                        : undefined
                    }
                    onMouseLeave={
                      ["growth_score", "mtg", "br"].includes(col)
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
    <GrowthScoreTooltip
      title={growthScoreTooltip.title}
      show={growthScoreTooltip.show}
      position={growthScoreTooltip.position}
      value={growthScoreTooltip.value}
      structuredLabels={growthScoreTooltip.structuredLabels}
      unstructuredLabels={growthScoreTooltip.unstructured_labels}
      showStructured={growthScoreTooltip.showStructured}
      showUnstructured={growthScoreTooltip.showUnstructured}
      onMouseEnter={() => {
        // Keep tooltip visible when mouse enters tooltip
        setGrowthScoreTooltip((prev) => ({ ...prev, show: true }));
      }}
      onMouseLeave={() => {
        // Hide tooltip when mouse leaves tooltip
        setGrowthScoreTooltip((prev) => ({ ...prev, show: false }));
      }}
    />
  </div>
);
}

export default ResultsTable;
