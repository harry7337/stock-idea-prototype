import React from "react";
import { REGION_OPTIONS, SECTOR_OPTIONS, ROIC_OPTIONS } from "./filters";

export function RegionSelect(props) {
  return (
    <select name="region" style={{ color: "black" }} {...props}>
      {REGION_OPTIONS.map((opt) => (
        <option key={opt.label} value={opt.value} style={{ color: "black" }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function SectorSelect(props) {
  return (
    <select name="sector" style={{ color: "black" }} {...props}>
      {SECTOR_OPTIONS.map((opt) => (
        <option key={opt.label} value={opt.value} style={{ color: "black" }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function RoicSelect(props) {
  return (
    <select name="roic" style={{ color: "black" }} {...props}>
      {ROIC_OPTIONS.map((opt) => (
        <option key={opt.label} value={opt.value} style={{ color: "black" }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
