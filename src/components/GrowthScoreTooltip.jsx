// Reusable score item component
const ScoreItem = ({ label, value, isLast = false }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: isLast ? 0 : "0.25rem",
    }}
  >
    <span>{label}:</span>
    <span style={{ fontWeight: "600" }}>{value || "N/A"}</span>
  </div>
);

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
  onMouseLeave 
}) {
  if (!show) return null;

  // Score definitions for cleaner mapping
  const structuredScores = [
    { label: "MM (Market Momentum)", value: value?.structured?.[0] },
    { label: "RSR (Revenue surprise & revisions)", value: value?.structured?.[1] },
    { label: "HFG (Historical & Forward Growth Estimates)", value: value?.structured?.[2] },
  ];

  const unstructuredScores = [
    { label: "MTG (Management Tone & Guidance Score)", value: value?.unstructured?.[0] },
    { label: "BR (Brokerage Report - Analyst Conviction Rank)", value: value?.unstructured?.[1] },
    { label: "UI (Open World Sentiment)", value: value?.unstructured?.[2] },
  ];

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
        Growth Score: {value?.value}
      </div>

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
    </div>
  );
}

export default GrowthScoreTooltip;