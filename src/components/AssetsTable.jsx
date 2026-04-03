function formatAmount(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n)
}

function LabelWithIcon({ row }) {
  if (row.type === 'section') {
    if (row.id === 'sec-nc') {
      return (
        <>
          <i className="bi bi-box-seam text-primary me-2" aria-hidden />
          {row.label}
        </>
      )
    }
    if (row.id === 'sec-c') {
      return (
        <>
          <i className="bi bi-wallet2 text-success me-2" aria-hidden />
          {row.label}
        </>
      )
    }
  }
  if (row.type === 'total') {
    return (
      <>
        <i className="bi bi-calculator text-secondary me-2" aria-hidden />
        {row.label}
      </>
    )
  }
  return row.label
}

function rowClass(row) {
  if (row.type === 'section') return 'table-light fw-semibold'
  if (row.type === 'total') return 'fw-bold border-top border-2'
  return ''
}

function labelPadding(row) {
  if (row.indent >= 1) return 'ps-4'
  return ''
}

export function AssetsTable(props) {
  const periods = props.periods
  const rows = props.rows
  const sectionTitle = props.sectionTitle
  const unitNote = props.unitNote

  return (
    <section aria-labelledby="assets-heading">
      <h2 id="assets-heading" className="visually-hidden">
        {sectionTitle}
      </h2>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-primary text-white py-3 d-flex align-items-center flex-wrap gap-2">
          <i className="bi bi-pie-chart-fill fs-5" aria-hidden />
          <span className="fw-semibold fs-5">{sectionTitle}</span>
          <span className="ms-md-auto small opacity-75">
            <i className="bi bi-cash-stack me-1" aria-hidden />
            {unitNote}
          </span>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover mb-0 align-middle">
              <thead className="table-light position-sticky top-0" style={{ zIndex: 1 }}>
                <tr>
                  <th scope="col" className="text-nowrap">
                    <i className="bi bi-list-ul me-1 text-muted" aria-hidden />
                    Particulars
                  </th>
                  {periods.map((p) => (
                    <th key={p.key} scope="col" className="text-end text-nowrap">
                      <i className="bi bi-calendar3 me-1 text-muted" aria-hidden />
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={rowClass(row)}>
                    <th
                      scope="row"
                      className={`text-start fw-normal ${labelPadding(row)} ${
                        row.type === 'section' ? 'fw-semibold' : ''
                      }`}
                    >
                      <LabelWithIcon row={row} />
                    </th>
                    {periods.map((p) => {
                      const v = row.values?.[p.key]
                      return (
                        <td key={p.key} className="text-end text-nowrap font-monospace">
                          {row.type === 'section' ? '' : formatAmount(v)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
