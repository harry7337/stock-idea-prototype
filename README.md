# Stock Idea Generation PoC
Frontend nginx server for the Stock Idea Generation App. Allows analysts to view a list of securities across geographies and filter them on mutliple criteria. When they want AI analysis on any list of companies, they can add it to a tracklist and submit the same. The data from these companies such as earning call transcripts, brokerage reports are then sent to GPT-5 along with specific prompts to calculate various growth scores (Management Tone & Guidance Score, Analyst Conviction Rank, Net sentiment score). Final Growth Score shown is a weighted average of its subcomponents

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
