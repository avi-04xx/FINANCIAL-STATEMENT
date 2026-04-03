import { useState } from 'react'
import balanceSheetData from './data/balanceSheetData.json'
import { AssetsTable } from './components/AssetsTable'
import { AddYearModal } from './components/AddYearModal'

const HEADING = 'Financial statements (XBRL)'
const COMPANY_LABEL = 'Balance sheet — Assets'
const SECTION_TITLE = 'Assets'
const UNIT_NOTE = 'Amounts in ₹ (absolute).'

const NEW_YEAR = { key: '2025-03-31', label: '31 MAR 2025' }

const NON_CURRENT_KEYS = [
  'tangible_assets',
  'producing_properties',
  'intangible_assets',
  'preproducing_properties',
  'tangible_assets_capital_work_in_progress',
  'intangible_assets_under_development',
  'noncurrent_investments',
  'deferred_tax_assets_net',
  'foreign_curr_monetary_item_trans_diff_asset_account',
  'long_term_loans_and_advances',
  'other_noncurrent_assets',
]

const CURRENT_KEYS = [
  'current_investments',
  'inventories',
  'trade_receivables',
  'cash_and_bank_balances',
  'short_term_loans_and_advances',
  'other_current_assets',
]

const TOTAL_KEY = 'given_assets_total'

const LABELS = {
  tangible_assets: 'Tangible assets',
  producing_properties: 'Producing properties',
  intangible_assets: 'Intangible assets',
  preproducing_properties: 'Pre-producing properties',
  tangible_assets_capital_work_in_progress:
    'Tangible assets — capital work-in-progress',
  intangible_assets_under_development: 'Intangible assets under development',
  noncurrent_investments: 'Non-current investments',
  deferred_tax_assets_net: 'Deferred tax assets (net)',
  foreign_curr_monetary_item_trans_diff_asset_account:
    'Foreign currency monetary item translation difference (asset)',
  long_term_loans_and_advances: 'Long-term loans and advances',
  other_noncurrent_assets: 'Other non-current assets',
  current_investments: 'Current investments',
  inventories: 'Inventories',
  trade_receivables: 'Trade receivables',
  cash_and_bank_balances: 'Cash and bank balances',
  short_term_loans_and_advances: 'Short-term loans and advances',
  other_current_assets: 'Other current assets',
  given_assets_total: 'Total assets (calculated)',
}

function formatPeriodLabel(iso) {
  const [y, m, d] = iso.split('-')
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ]
  return `${d} ${months[Number(m) - 1]} ${y}`
}

function buildPeriods(records) {
  const sorted = [...records].sort((a, b) => a.year.localeCompare(b.year))
  const periods = []
  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i]
    periods.push({ key: r.year, label: formatPeriodLabel(r.year) })
  }
  return periods
}

function buildRows(records) {
  const periods = buildPeriods(records)
  const periodKeys = periods.map((p) => p.key)
  const byYear = {}
  for (let i = 0; i < records.length; i++) {
    byYear[records[i].year] = records[i]
  }

  const layout = []
  layout.push({
    type: 'section',
    id: 'sec-nc',
    label: 'Non-current assets',
    indent: 0,
  })
  for (let i = 0; i < NON_CURRENT_KEYS.length; i++) {
    const id = NON_CURRENT_KEYS[i]
    layout.push({
      type: 'line',
      id,
      label: LABELS[id],
      indent: 1,
    })
  }
  layout.push({
    type: 'section',
    id: 'sec-c',
    label: 'Current assets',
    indent: 0,
  })
  for (let i = 0; i < CURRENT_KEYS.length; i++) {
    const id = CURRENT_KEYS[i]
    layout.push({
      type: 'line',
      id,
      label: LABELS[id],
      indent: 1,
    })
  }
  layout.push({
    type: 'total',
    id: TOTAL_KEY,
    label: LABELS[TOTAL_KEY],
    indent: 0,
  })

  const rows = []
  for (let i = 0; i < layout.length; i++) {
    const row = layout[i]
    if (row.type === 'section') {
      rows.push({ ...row, values: {} })
      continue
    }

    const values = {}
    for (let j = 0; j < periodKeys.length; j++) {
      const pk = periodKeys[j]
      const rec = byYear[pk]
      const raw = rec?.bs?.assets?.[row.id]
      values[pk] = raw === undefined ? null : raw
    }
    rows.push({ ...row, values })
  }

  return rows
}

function appendRecord(records, yearKey, assets) {
  const template = records[0]
  const next = {
    year: yearKey,
    nature: template?.nature ?? 'STANDALONE',
    stated_on: yearKey,
    filing_type: template?.filing_type ?? 'XBRL',
    filing_standard: template?.filing_standard ?? 'Schedule III',
    bs: { assets: { ...assets }, subTotals: {} },
  }
  return [...records, next]
}

export default function App() {
  const [records, setRecords] = useState(() => balanceSheetData)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMountKey, setModalMountKey] = useState(0)

  const periods = buildPeriods(records)
  const rows = buildRows(records)
  const periodKeys = periods.map((p) => p.key)
  let latest = null
  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    if (!latest || r.year > latest.year) {
      latest = r
    }
  }

  const handleAddYear = (period, assets) => {
    setRecords((prev) => appendRecord(prev, period.key, assets))
  }

  return (
    <div className="container py-4 py-md-5">
      <header className="bg-white rounded-4 shadow-sm border p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div>
            <p className="text-uppercase text-muted small mb-2 fw-semibold">
              <i className="bi bi-file-earmark-text me-1" aria-hidden />
              {HEADING}
            </p>
            <h1 className="h4 mb-2 text-dark">
              <i className="bi bi-building me-2 text-primary" aria-hidden />
              {COMPANY_LABEL}
            </h1>
            <p className="text-muted small mb-0">
              <i className="bi bi-info-circle me-1" aria-hidden />
              {UNIT_NOTE}
            </p>
            {latest && (
              <div className="mt-3 d-flex flex-wrap gap-2">
                <span className="badge text-bg-light border">
                  <i className="bi bi-calendar3 me-1" aria-hidden />
                  Latest: {latest.year}
                </span>
                <span className="badge text-bg-light border">
                  <i className="bi bi-filetype-xml me-1" aria-hidden />
                  {latest.filing_type}
                </span>
                <span className="badge text-bg-light border">
                  <i className="bi bi-diagram-3 me-1" aria-hidden />
                  {latest.filing_standard}
                </span>
                <span className="badge text-bg-light border">
                  <i className="bi bi-building-check me-1" aria-hidden />
                  {latest.nature}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-lg shadow-sm"
            onClick={() => {
              setModalMountKey((k) => k + 1)
              setModalOpen(true)
            }}
          >
            <i className="bi bi-plus-lg me-1" aria-hidden />
            Add Latest Year Financials
          </button>
        </div>
      </header>

      <AssetsTable
        periods={periods}
        rows={rows}
        sectionTitle={SECTION_TITLE}
        unitNote={UNIT_NOTE}
      />

      <AddYearModal
        key={modalMountKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rows={rows}
        existingPeriodKeys={periodKeys}
        newPeriod={NEW_YEAR}
        onSubmit={handleAddYear}
      />
    </div>
  )
}
