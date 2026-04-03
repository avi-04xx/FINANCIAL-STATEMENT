# Financial statements (Finoscale screening assignment)

Frontend that renders **Assets** from the provided **XBRL / Schedule III–style** JSON (array of yearly records with `bs.assets`) and lets you add a **31 MAR 2025** column via a modal (in-memory only; no backend).

## Tech stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [Bootstrap](https://getbootstrap.com/) 5 (utility classes + light `index.css` for page background)
- [Bootstrap Icons](https://icons.getbootstrap.com/) (header, table, modal — simple `<i className="bi bi-…">` markup)

## Setup

```bash
cd FINANCIAL_STATEMENTS
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

**Production build**

```bash
npm run build
npm run preview
```

## How it works

- Initial data: `src/data/balanceSheetData.json` — array of `{ year, nature, filing_*, bs: { assets, subTotals } }` (same shape as the screening JSON).
- Columns are **years** sorted **chronologically** (2019 → 2024). Labels render as **31 MAR YYYY**.
- Amounts are shown in **₹ absolute** (as in the JSON), with Indian grouping. **Null** values show as **—**.
- **Add Latest Year Financials** opens a dialog with one field per `bs.assets` key (non-current block, current block, then **Total assets (given)**). Blank input is stored as **null**.
- Preview shows the **sum of line items** (excluding the stated total) vs **Total assets (given)** for a quick sanity check (they need not match accounting tie-outs).

## Assumptions

- Only the **Assets** block is shown; `subTotals` is not rendered in the table (it remains available in JSON for future use).
- New year rows copy **nature / filing_type / filing_standard** from the first record in the file; `stated_on` is set to the new year-end date.
- No persistence: refreshing the page resets to `balanceSheetData.json`.

## Project layout

- `src/App.jsx` — state (`records`), derived periods/rows
- `src/utils/balanceSheetModel.js` — JSON → table rows, labels, append record
- `src/utils/financial.js` — number formatting
- `src/components/AssetsTable.jsx` — table
- `src/components/AddYearModal.jsx` — add-year form

## Demo video

Record a short screen capture showing: table with multiple years → open modal → enter values → submit → **31 MAR 2025** column appears.
