// Reusable score item component
const ScoreItem = ({ label, value, isLast = false }) => {
  const displayValue = value || "N/A";
  const isLongText = displayValue.length > 20; // Threshold for showing "read more"
  
  const handleReadMore = () => {
    alert(displayValue);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: isLast ? 0 : "0.25rem",
        alignItems: "center",
      }}
    >
      <span>{label}:</span>
      <div style={{ display: "flex", alignItems: "center", maxWidth: "150px" }}>
        <span style={{ 
          fontWeight: "600",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}>
          {displayValue}
        </span>
        {isLongText && (
          <button
            onClick={handleReadMore}
            style={{
              marginLeft: "4px",
              background: "none",
              border: "none",
              color: "#4dd0e1",
              cursor: "pointer",
              fontSize: "0.8rem",
              textDecoration: "underline",
              padding: 0,
              whiteSpace: "nowrap",
            }}
            title="Click to view full text"
          >
            read more
          </button>
        )}
      </div>
    </div>
  );
};

// Reusable score section component
const ScoreSection = ({ title, children }) => (
  <div
    style={{
      marginBottom: "0.75rem",
      padding: "0.5rem",
      backgroundColor: "#2a2a4e",
      borderRadius: "6px",
    }}
  >
    <strong style={{ color: "#4dd0e1" }}>{title}:</strong>
    <div style={{ marginTop: "0.5rem" }}>{children}</div>
  </div>
);

function GrowthScoreTooltip({ 
  show, 
  position, 
  value, 
  onMouseEnter, 
  onMouseLeave,
  title = "Growth Score",
  showStructured = true,
  showUnstructured = true,
  structuredLabels = [
    "MM (Market Momentum)",
    "RSR (Revenue surprise & revisions)",
    "HFG (Historical & Forward Growth Estimates)"
  ],
  unstructuredLabels = [
    "MTG (Management Tone & Guidance Score)",
    "BR (Brokerage Report - Analyst Conviction Rank)",
    "UI (Open World Sentiment)"
  ]
}) {
  if (!show) return null;

  // Score definitions for cleaner mapping
  const structuredScores = structuredLabels.map((label, index) => ({
    label,
    value: value?.structured?.[index]
  }));

  const unstructuredScores = unstructuredLabels.map((label, index) => ({
    label,
    value: value?.unstructured?.[index]
  }));

  return (
    <div
      style={{
        position: "fixed",
        left: position.x - 100,
        top: position.y - 140,
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
        pointerEvents: "auto",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          fontWeight: "600",
          color: "#00796b",
          marginBottom: "0.75rem",
          fontSize: "1rem",
        }}
      >
        {title}: {value?.value}
      </div>

      {showStructured && (
        <ScoreSection title="Structured Scores">
          {structuredScores.map((score, index) => (
            <ScoreItem
              key={index}
              label={score.label}
              value={score.value}
              isLast={index === structuredScores.length - 1}
            />
          ))}
        </ScoreSection>
      )}

      {showUnstructured && (
        <ScoreSection title="Unstructured Scores">
          {unstructuredScores.map((score, index) => (
            <ScoreItem
              key={index}
              label={score.label}
              value={score.value}
              isLast={index === unstructuredScores.length - 1}
            />
          ))}
          <div
            style={{
              fontSize: "0.8rem",
              color: "#b2dfdb",
              marginTop: "0.75rem",
            }}
          >
            Last updated: Q3 2024
          </div>
        </ScoreSection>
      )}
    </div>
  );
}

export default GrowthScoreTooltip;