import React from "react";
import { ALL_FIELDS } from "./fields";

export default function ColumnSelector({ selectedFields, setSelectedFields, show, setShow }) {
  const handleFieldChange = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        aria-label="Select Columns"
        onClick={() => setShow((v) => !v)}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#e0f7fa",
          border: "1.5px solid #b2dfdb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          transition: "background 0.2s",
          outline: "none",
          padding: 0,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2.5" y="4" width="3" height="12" rx="1" fill="#00796b" />
          <rect x="8.5" y="4" width="3" height="12" rx="1" fill="#00796b" />
          <rect x="14.5" y="4" width="3" height="12" rx="1" fill="#00796b" />
        </svg>
      </button>
      {show && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            top: 48,
            background: "#fff",
            border: "1px solid #b2dfdb",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            padding: "1rem",
            minWidth: 220,
            maxHeight: 320,
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "#00796b",
              marginBottom: 8,
              fontSize: "1.08rem",
            }}
          >
            Select Columns
          </div>
          {ALL_FIELDS.map((field) => (
            <label
              key={field.value}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 6,
                cursor: "pointer",
                fontSize: "1rem",
                color: "#00796b",
              }}
            >
              <input
                type="checkbox"
                checked={selectedFields.includes(field.value)}
                onChange={() => handleFieldChange(field.value)}
                style={{ marginRight: 8 }}
              />
              {field.label}
            </label>
          ))}
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <button
              type="button"
              className="navbar-btn"
              style={{
                background: "#00796b",
                color: "#fff",
                fontWeight: 600,
                border: "none",
                padding: "0.4rem 1.2rem",
                borderRadius: 6,
              }}
              onClick={() => setShow(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
