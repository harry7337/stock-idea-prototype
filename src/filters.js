// src/filters.js

export const REGION_OPTIONS = [
  { value: "", label: "Select region" },
  {
    value: "United States and Canada (Primary)",
    label: "United States and Canada (Primary)",
  },
  { value: "South-East Asia (Primary)", label: "South-East Asia (Primary)" },
  { value: "Europe (Primary)", label: "Europe (Primary)" },
  {
    value: "Indian Sub-Continent (Primary)",
    label: "Indian Sub-Continent (Primary)",
  },
  {
    value: "Latin America and Caribbean (Primary)",
    label: "Latin America and Caribbean (Primary)",
  },
  {
    value: "Asia / Pacific Developed Markets (Primary)",
    label: "Asia / Pacific Developed Markets (Primary)",
  },
  { value: "Middle East (Primary)", label: "Middle East (Primary)" },
];

export const SECTOR_OPTIONS = [
  { value: "", label: "Select sector" },
  { value: "Software (Primary)", label: "Software (Primary)" },
  {
    value: "Internet Services and Infrastructure (Primary)",
    label: "Internet Services and Infrastructure (Primary)",
  },
//   { value: "finance", label: "Finance" },
//   { value: "energy", label: "Energy" },
];

export const ROIC_OPTIONS = [
  { value: '', label: 'Select ROIC range' },
  { value: 'low', label: '0-5%' },
  { value: 'med', label: '5-15%' },
  { value: 'high', label: '15%+' },
];
