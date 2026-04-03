import { useEffect, useState } from 'react'

const TOTAL_ASSET_KEY = 'given_assets_total'

function buildGroupsFromRows(rows) {
  const groups = []
  let currentGroup = { title: '', rows: [] }

  rows.forEach((row) => {
    if (row.type === 'section') {
      if (currentGroup.rows.length > 0) {
        groups.push(currentGroup)
      }
      currentGroup = { title: row.label, rows: [] }
    } else {
      currentGroup.rows.push(row)
    }
  })

  if (currentGroup.rows.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}

function parseNumber(value) {
  const text = String(value ?? '').trim()
  if (text === '') return { number: null, error: null }

  const n = Number(text)
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { number: null, error: 'Enter a whole number or leave blank' }
  }
  if (n < 0) {
    return { number: null, error: 'Must be ≥ 0' }
  }
  return { number: n, error: null }
}

export function AddYearModal(props) {
  const open = props.open
  const onClose = props.onClose
  const rows = props.rows
  const existingPeriodKeys = props.existingPeriodKeys
  const newPeriod = props.newPeriod
  const onSubmit = props.onSubmit

  const groups = buildGroupsFromRows(rows)

  const inputRows = []
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]
    for (let j = 0; j < g.rows.length; j++) {
      inputRows.push(g.rows[j])
    }
  }

  let nonCurrentGroup = null
  let currentGroup = null
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]
    const title = g.title.toLowerCase()
    if (title.includes('non-current')) {
      nonCurrentGroup = g
    } else if (title.includes('current')) {
      currentGroup = g
    }
  }

  const hasTwoGroups = Boolean(nonCurrentGroup && currentGroup)

  function renderGroup(g) {
    return (
      <fieldset key={g.title} className="mb-4 border-0 p-0">
        <legend className="float-none w-auto px-0 mb-2 fs-6 fw-semibold text-dark">
          <i
            className={`bi me-1 ${
              g.title.toLowerCase().includes('non-current')
                ? 'bi-box-seam text-primary'
                : 'bi-wallet2 text-success'
            }`}
            aria-hidden
          />
          {g.title}
        </legend>
        <div className="row g-2">
          {g.rows.map((r) => (
            <div key={r.id} className="col-12">
              <label htmlFor={`field-${r.id}`} className="form-label small mb-1">
                {r.label}
              </label>
              <input
                id={`field-${r.id}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className={`form-control form-control-sm font-monospace ${
                  errors[r.id] ? 'is-invalid' : ''
                }`}
                value={
                  r.id === TOTAL_ASSET_KEY
                    ? Number.isFinite(previewSumLines)
                      ? String(previewSumLines)
                      : ''
                    : fields[r.id] ?? ''
                }
                onChange={(e) =>
                  r.id === TOTAL_ASSET_KEY
                    ? undefined
                    : setFields((prev) => ({
                        ...prev,
                        [r.id]: e.target.value,
                      }))
                }
                placeholder="0"
                readOnly={r.id === TOTAL_ASSET_KEY}
              />
              {r.id === TOTAL_ASSET_KEY && (
                <div className="form-text">
                  Total is calculated automatically.
                </div>
              )}
              {errors[r.id] && (
                <div className="invalid-feedback d-block">{errors[r.id]}</div>
              )}
            </div>
          ))}
        </div>
      </fieldset>
    )
  }

  const [fields, setFields] = useState(() => {
    const initial = {}
    inputRows.forEach((row) => {
      initial[row.id] = ''
    })
    return initial
  })
  const [touched, setTouched] = useState(false)

  const alreadyAdded = existingPeriodKeys.includes(newPeriod.key)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const errors = {}
  let previewSumLines = 0
  let previewTotal = null

  inputRows.forEach((row) => {
    const { number, error } = parseNumber(fields[row.id])

    if (touched && error) {
      errors[row.id] = error
    }

    if (row.type === 'line' && typeof number === 'number') {
      previewSumLines += number
    }
    if (row.id === TOTAL_ASSET_KEY) {
      previewTotal = number
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    const nextErrors = {}
    const assets = {}

    inputRows.forEach((row) => {
      const { number, error } = parseNumber(fields[row.id])
      if (error) {
        nextErrors[row.id] = error
      }
      assets[row.id] = number
    })

    if (Object.keys(nextErrors).length) return
    if (alreadyAdded) return

    assets[TOTAL_ASSET_KEY] = previewSumLines

    onSubmit(newPeriod, assets)
    onClose()
  }

  return (
    <>
      <div className="modal-backdrop fade show" aria-hidden="true" />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fs-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header bg-light">
              <div>
                <h2 id="fs-modal-title" className="modal-title h5 mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-pencil-square text-primary" aria-hidden />
                  Add latest year financials
                </h2>
                <p className="text-muted small mb-0 mt-2">
                  <i className="bi bi-calendar-event me-1" aria-hidden />
                  Enter amounts for <strong>{newPeriod.label}</strong> (₹ absolute, same
                  shape as <code>bs.assets</code>).
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {alreadyAdded && (
                  <div className="alert alert-warning d-flex align-items-start gap-2" role="status">
                    <i className="bi bi-exclamation-triangle-fill mt-1" aria-hidden />
                    <span>
                      Column {newPeriod.label} is already in the table. Reload the page to
                      reset in-memory data.
                    </span>
                  </div>
                )}

                {hasTwoGroups ? (
                  <div className="row g-3">
                    <div className="col-12 col-lg-6">{renderGroup(nonCurrentGroup)}</div>
                    <div className="col-12 col-lg-6">{renderGroup(currentGroup)}</div>
                  </div>
                ) : (
                  groups.map((g) => renderGroup(g))
                )}

                <div className="card bg-light border-0 mt-2">
                  <div className="card-body py-3">
                    <p className="text-uppercase text-muted small fw-semibold mb-2">
                      <i className="bi bi-eye me-1" aria-hidden />
                      Preview
                    </p>
                    <ul className="list-unstyled mb-0 small font-monospace">
                      <li className="d-flex justify-content-between gap-2 py-1 border-bottom">
                        <span>Sum of line items (excl. total)</span>
                        <span>
                          {Number.isFinite(previewSumLines)
                            ? previewSumLines.toLocaleString('en-IN')
                            : '—'}
                        </span>
                      </li>
                      <li className="d-flex justify-content-between gap-2 py-1 fw-bold">
                        <span>Total assets (given)</span>
                        <span>
                          {previewTotal === null || previewTotal === undefined
                            ? '—'
                            : previewTotal.toLocaleString('en-IN')}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={alreadyAdded}
                >
                  <i className="bi bi-check2-circle me-1" aria-hidden />
                  Add column
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
