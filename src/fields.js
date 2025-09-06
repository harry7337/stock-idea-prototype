// src/fields.js
// Central enumeration of all backend column identifiers to avoid string duplication.

export const FIELD = Object.freeze({
  COMPANY_NAME: "company_name",
  GROWTH_SCORE: "growth_score",
  EXCHANGE_TICKER: "exchange_ticker",
  INDUSTRY: "industry_classifications",
  REGION: "geographic_locations",
  MCAP: "mcap",
  LATEST_Q: "latest_q",
  Q_PLUS_1: "q_plus_1",
  FY_PLUS_1: "fy_plus_1",
  FY_PLUS_2: "fy_plus_2",
  SURPRISE_PCT: "surprise_perc",
  REVISION: "revision",
  PERC_15D: "perc_15d",
  PERC_30D: "perc_30d",
  PERC_60D: "perc_60d",
  PERC_90D: "perc_90d",
});

export const ALL_FIELDS = [
  { label: "Company Name", value: FIELD.COMPANY_NAME },
  { label: "Growth Score", value: FIELD.GROWTH_SCORE },
  { label: "Exchange Ticker", value: FIELD.EXCHANGE_TICKER },
  { label: "Industry", value: FIELD.INDUSTRY },
  { label: "Region", value: FIELD.REGION },
  { label: "Market Cap", value: FIELD.MCAP },
  { label: "Latest Q", value: FIELD.LATEST_Q },
  { label: "Q+1", value: FIELD.Q_PLUS_1 },
  { label: "FY+1", value: FIELD.FY_PLUS_1 },
  { label: "FY+2", value: FIELD.FY_PLUS_2 },
  { label: "Surprise %", value: FIELD.SURPRISE_PCT },
  { label: "Revision", value: FIELD.REVISION },
  { label: "15d %", value: FIELD.PERC_15D },
  { label: "30d %", value: FIELD.PERC_30D },
  { label: "60d %", value: FIELD.PERC_60D },
  { label: "90d %", value: FIELD.PERC_90D },
];

// Flat list of numeric-like fields (used for sorting toggles)
export const NUMERIC_FIELD_VALUES = [
  FIELD.GROWTH_SCORE,
  FIELD.MCAP,
  FIELD.LATEST_Q,
  FIELD.Q_PLUS_1,
  FIELD.FY_PLUS_1,
  FIELD.FY_PLUS_2,
  FIELD.SURPRISE_PCT,
  FIELD.REVISION,
  FIELD.PERC_15D,
  FIELD.PERC_30D,
  FIELD.PERC_60D,
  FIELD.PERC_90D,
];

// Convenience Set for O(1) membership checks in UI
export const NUMERIC_FIELDS = ALL_FIELDS.filter(f => NUMERIC_FIELD_VALUES.includes(f.value));
