import React, { useState, useEffect } from 'react'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  DollarSign, ShoppingCart, BookOpen, CreditCard,
  RefreshCw, Trophy, TrendingUp, TrendingDown, Minus,
  X, FileText, Download, FileSpreadsheet
} from 'lucide-react'
import './SalesReportComponent.css'
import { getImageUrl } from '../../Utils/imageUrl'

const PERIODS = [
  { label: 'Esta semana', value: 'week' },
  { label: 'Este mes',    value: 'month' },
  { label: 'Este año',    value: 'year' },
  { label: 'Todo',        value: '' },
]

const CATEGORIES = ['', 'marvel', 'dc', 'miscellaneous', 'animanga']

// ─── Gráfico SVG ───────────────────────────────────────────────────────────
const LineChart = ({ entries }) => {
  const [tooltip, setTooltip] = useState(null)
  const W = 480, H = 180
  const PAD = { top: 16, right: 16, bottom: 36, left: 52 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  if (!entries || entries.length === 0)
    return <p className="report-empty">Sin datos en este período.</p>

  const revenues = entries.map(([, v]) => v.revenue)
  const maxR = Math.max(...revenues, 1)
  const minR = 0
  const range = maxR - minR || 1

  const xStep = entries.length > 1 ? innerW / (entries.length - 1) : innerW / 2
  const pts = entries.map(([month, v], i) => ({
    x: PAD.left + (entries.length > 1 ? i * xStep : innerW / 2),
    y: PAD.top + innerH - ((v.revenue - minR) / range) * innerH,
    revenue: v.revenue,
    count: v.count,
    label: month.slice(5),
  }))

  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD = `${lineD} L${pts[pts.length-1].x.toFixed(1)},${(PAD.top+innerH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PAD.top+innerH).toFixed(1)} Z`

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => minR + range * t)

  return (
    <div className="report-linechart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="report-linechart-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#111" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#111" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((val, i) => {
          const y = PAD.top + innerH - ((val - minR) / range) * innerH
          return (
            <g key={i}>
              <line x1={PAD.left} x2={PAD.left + innerW} y1={y} y2={y}
                stroke="#e8e8e4" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end"
                fontSize="10" fill="#aaa" fontFamily="Courier New, monospace">
                ${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val.toFixed(0)}
              </text>
            </g>
          )
        })}

        <path d={areaD} fill="url(#areaGrad)" />
        <path d={lineD} fill="none" stroke="#111" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p, i) => (
          <g key={i}>
            <text x={p.x} y={PAD.top + innerH + 16} textAnchor="middle"
              fontSize="10" fill="#888" fontFamily="Courier New, monospace">
              {p.label}
            </text>
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#111" strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => setTooltip({ ...p, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
            />
          </g>
        ))}
      </svg>

      {tooltip && (
        <div className="report-chart-tooltip"
          style={{ left: tooltip.mx + 14 + 'px', top: tooltip.my - 52 + 'px' }}>
          <strong>{tooltip.label}</strong>
          <span>${tooltip.revenue.toFixed(2)}</span>
          <span>{tooltip.count} orden{tooltip.count !== 1 ? 'es' : ''}</span>
        </div>
      )}
    </div>
  )
}

// ─── Modal invoice ─────────────────────────────────────────────────────────
const InvoiceModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    customFetch.get(`/orders/admin/order/${orderId}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => { toast.error('No se pudo cargar la factura'); onClose() })
      .finally(() => setLoading(false))
  }, [orderId])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const statusLabel = { completed: 'Completado', refunded: 'Reembolsado', pending: 'Pendiente' }

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <button className="report-modal-close" onClick={onClose}><X size={18} /></button>

        {loading ? (
          <p className="report-modal-loading">Cargando factura...</p>
        ) : order ? (
          <>
            <div className="report-modal-header">
              <div>
                <h2 className="report-modal-brand">FARBAUTI <span>COMICS</span></h2>
                <p className="report-modal-invoice-num">{order.invoiceNumber}</p>
              </div>
              <span className={`report-status-badge report-status-badge--${order.status}`}>
                {statusLabel[order.status] || order.status}
              </span>
            </div>

            <div className="report-modal-meta">
              <div>
                <p className="report-modal-meta-label">Cliente</p>
                <p className="report-modal-meta-value">{order.userName}</p>
                <p className="report-modal-meta-sub">{order.userEmail}</p>
              </div>
              <div>
                <p className="report-modal-meta-label">Fecha</p>
                <p className="report-modal-meta-value">
                  {new Date(order.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="report-modal-divider" />

            <div className="report-modal-items-header">
              <span>Comic</span>
              <span>Categoría</span>
              <span className="text-right">Precio</span>
            </div>
            {order.items.map((item, i) => (
              <div className="report-modal-item-row" key={i}>
                <span>{item.title}</span>
                <span className="report-modal-item-cat">{item.category}</span>
                <span className="text-right">${item.price?.toFixed(2)}</span>
              </div>
            ))}

            <div className="report-modal-divider" />

            <div className="report-modal-totals">
              <div className="report-modal-total-row">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="report-modal-total-row">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="report-modal-total-row report-modal-total-final">
                <span>Total</span>
                <span>${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

// ─── Tendencia ─────────────────────────────────────────────────────────────
const Trend = ({ pct }) => {
  if (pct === null || pct === undefined) return null
  if (pct > 0)  return <span className="report-trend report-trend--up"><TrendingUp size={12} /> +{pct.toFixed(0)}%</span>
  if (pct < 0)  return <span className="report-trend report-trend--down"><TrendingDown size={12} /> {pct.toFixed(0)}%</span>
  return <span className="report-trend report-trend--flat"><Minus size={12} /> 0%</span>
}

const buildSalesExportData = (report) => {
  const summary = report.summary || {}
  const salesByMonth = report.salesByMonth || {}
  const salesByCategory = report.salesByCategory || {}
  const topComics = report.topComics || []
  const orders = report.orders || []

  const monthEntries = Object.entries(salesByMonth).sort(([a], [b]) => a.localeCompare(b))
  const categoryEntries = Object.entries(salesByCategory)
    .sort(([, a], [, b]) => b.revenue - a.revenue)

  return { summary, monthEntries, categoryEntries, topComics, orders }
}

const downloadMonthlySalesPdf = (report) => {
  const { summary, monthEntries, categoryEntries, topComics, orders } = buildSalesExportData(report)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const margin = 36

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Reporte de Ventas Mensual', margin, 38)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Farbauti Comics', margin, 56)

  autoTable(doc, {
    startY: 72,
    head: [['Resumen', 'Valor']],
    body: [
      ['Ingresos totales', `$${Number(summary.totalRevenue || 0).toFixed(2)}`],
      ['Órdenes', String(summary.totalOrders || 0)],
      ['Comics vendidos', String(summary.totalItemsSold || 0)],
      ['Ticket promedio', `$${summary.totalOrders > 0 ? (summary.totalRevenue / summary.totalOrders).toFixed(2) : '0.00'}`],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [17, 17, 17] },
    margin: { left: margin, right: margin },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [['Mes', 'Órdenes', 'Ingresos']],
    body: monthEntries.length > 0
      ? monthEntries.map(([month, value]) => [month, String(value.count), `$${value.revenue.toFixed(2)}`])
      : [['Sin datos', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [17, 17, 17] },
    margin: { left: margin, right: margin },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [['Categoría', 'Órdenes', 'Ingresos']],
    body: categoryEntries.length > 0
      ? categoryEntries.map(([category, value]) => [category, String(value.count), `$${value.revenue.toFixed(2)}`])
      : [['Sin datos', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [17, 17, 17] },
    margin: { left: margin, right: margin },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [['#', 'Comic', 'Categoría', 'Ventas', 'Ingresos']],
    body: topComics.length > 0
      ? topComics.map((comic, index) => [String(index + 1), comic.title, comic.category || '-', String(comic.count || 0), `$${Number(comic.revenue || 0).toFixed(2)}`])
      : [['-', 'Sin datos', '-', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [17, 17, 17] },
    margin: { left: margin, right: margin },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [['Factura', 'Cliente', 'Items', 'Estado', 'Fecha', 'Total']],
    body: orders.length > 0
      ? orders.slice(0, 20).map((order) => [
          order.invoiceNumber,
          order.userName,
          String(order.items?.length || 0),
          order.status,
          new Date(order.createdAt).toLocaleDateString('es-MX'),
          `$${Number(order.total || 0).toFixed(2)}`,
        ])
      : [['Sin datos', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [17, 17, 17] },
    margin: { left: margin, right: margin },
  })

  doc.save('reporte-ventas-mensual.pdf')
}

const downloadMonthlySalesExcel = (report) => {
  const { summary, monthEntries, categoryEntries, topComics, orders } = buildSalesExportData(report)
  const workbook = XLSX.utils.book_new()

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Reporte de Ventas Mensual', 'Farbauti Comics'],
    ['Ingresos totales', Number(summary.totalRevenue || 0)],
    ['Órdenes', Number(summary.totalOrders || 0)],
    ['Comics vendidos', Number(summary.totalItemsSold || 0)],
    ['Ticket promedio', summary.totalOrders > 0 ? Number((summary.totalRevenue / summary.totalOrders).toFixed(2)) : 0],
  ])

  const monthSheet = XLSX.utils.json_to_sheet(
    monthEntries.map(([month, value]) => ({ Mes: month, Órdenes: value.count, Ingresos: Number(value.revenue.toFixed(2)) }))
  )

  const categorySheet = XLSX.utils.json_to_sheet(
    categoryEntries.map(([category, value]) => ({ Categoría: category, Órdenes: value.count, Ingresos: Number(value.revenue.toFixed(2)) }))
  )

  const topComicsSheet = XLSX.utils.json_to_sheet(
    topComics.map((comic, index) => ({
      '#': index + 1,
      Comic: comic.title,
      Categoría: comic.category || '',
      Ventas: comic.count || 0,
      Ingresos: Number((comic.revenue || 0).toFixed(2)),
    }))
  )

  const ordersSheet = XLSX.utils.json_to_sheet(
    orders.slice(0, 20).map((order) => ({
      Factura: order.invoiceNumber,
      Cliente: order.userName,
      Items: order.items?.length || 0,
      Estado: order.status,
      Fecha: new Date(order.createdAt).toLocaleDateString('es-MX'),
      Total: Number((order.total || 0).toFixed(2)),
    }))
  )

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')
  XLSX.utils.book_append_sheet(workbook, monthSheet, 'Mes')
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categorías')
  XLSX.utils.book_append_sheet(workbook, topComicsSheet, 'Top Comics')
  XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Órdenes')

  XLSX.writeFile(workbook, 'reporte-ventas-mensual.xlsx')
}

// ─── Principal ─────────────────────────────────────────────────────────────
const SalesReportComponent = () => {
  const [report, setReport]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [period, setPeriod]     = useState('month')
  const [category, setCategory] = useState('')
  const [modalId, setModalId]   = useState(null)
  const isMonthlyReport = period === 'month'

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (period)   params.append('period', period)
      if (category) params.append('category', category)
      const { data } = await customFetch.get(`/orders/admin/report?${params}`)
      setReport(data)
    } catch {
      toast.error('Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport() }, [period, category])

  if (loading) return <div className="report-loading">Cargando reporte...</div>
  if (!report)  return null

  const { summary, salesByCategory, salesByMonth, topComics, orders } = report

  const monthEntries = Object.entries(salesByMonth).sort(([a], [b]) => a.localeCompare(b))

  const half = Math.floor(monthEntries.length / 2)
  const recentRev   = monthEntries.slice(half).reduce((s, [, v]) => s + v.revenue, 0)
  const prevRev     = monthEntries.slice(0, half).reduce((s, [, v]) => s + v.revenue, 0)
  const recentOrd   = monthEntries.slice(half).reduce((s, [, v]) => s + v.count, 0)
  const prevOrd     = monthEntries.slice(0, half).reduce((s, [, v]) => s + v.count, 0)
  const revTrend    = prevRev  > 0 ? ((recentRev  - prevRev)  / prevRev)  * 100 : null
  const ordTrend    = prevOrd  > 0 ? ((recentOrd  - prevOrd)  / prevOrd)  * 100 : null

  const catEntries    = Object.entries(salesByCategory)
  const maxCatRevenue = Math.max(...catEntries.map(([, v]) => v.revenue), 1)
  const statusLabel   = { completed: 'Completado', refunded: 'Reembolsado', pending: 'Pendiente' }

  const handlePdfDownload = () => {
    if (!isMonthlyReport) {
      toast.info('Selecciona el período "Este mes" para descargar el reporte mensual')
      return
    }
    downloadMonthlySalesPdf(report)
  }

  const handleExcelDownload = () => {
    if (!isMonthlyReport) {
      toast.info('Selecciona el período "Este mes" para descargar el reporte mensual')
      return
    }
    downloadMonthlySalesExcel(report)
  }

  return (
    <div className="report-wrapper">

      <div className="report-header">
        <div>
          <h1 className="report-title">Reporte de Ventas</h1>
          <p className="report-subtitle">Panel de análisis de ingresos y comics vendidos</p>
        </div>
        <div className="report-header-actions">
          <button className="report-btn-export report-btn-export--pdf" onClick={handlePdfDownload} disabled={!isMonthlyReport}>
            <Download size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            PDF
          </button>
          <button className="report-btn-export report-btn-export--excel" onClick={handleExcelDownload} disabled={!isMonthlyReport}>
            <FileSpreadsheet size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Excel
          </button>
          <button className="report-btn-refresh" onClick={fetchReport}>
            <RefreshCw size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="report-filters">
        <div className="report-filter-group">
          <label>Período</label>
          <div className="report-pill-group">
            {PERIODS.map((p) => (
              <button key={p.value}
                className={`report-pill ${period === p.value ? 'active' : ''}`}
                onClick={() => setPeriod(p.value)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="report-filter-group">
          <label>Categoría</label>
          <div className="report-pill-group">
            {CATEGORIES.map((c) => (
              <button key={c}
                className={`report-pill ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}>
                {c === '' ? 'Todas' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="report-kpis">
        <div className="report-kpi">
          <span className="report-kpi-icon"><DollarSign size={26} /></span>
          <div>
            <p className="report-kpi-label">Ingresos Totales</p>
            <p className="report-kpi-value">${summary.totalRevenue?.toFixed(2)}</p>
            <Trend pct={revTrend} />
          </div>
        </div>
        <div className="report-kpi">
          <span className="report-kpi-icon"><ShoppingCart size={26} /></span>
          <div>
            <p className="report-kpi-label">Órdenes</p>
            <p className="report-kpi-value">{summary.totalOrders}</p>
            <Trend pct={ordTrend} />
          </div>
        </div>
        <div className="report-kpi">
          <span className="report-kpi-icon"><BookOpen size={26} /></span>
          <div>
            <p className="report-kpi-label">Comics Vendidos</p>
            <p className="report-kpi-value">{summary.totalItemsSold}</p>
          </div>
        </div>
        <div className="report-kpi">
          <span className="report-kpi-icon"><CreditCard size={26} /></span>
          <div>
            <p className="report-kpi-label">Ticket Promedio</p>
            <p className="report-kpi-value">
              ${summary.totalOrders > 0
                ? (summary.totalRevenue / summary.totalOrders).toFixed(2)
                : '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="report-charts-row">
        <div className="report-card">
          <h3>Ingresos por Mes</h3>
          <LineChart entries={monthEntries} />
        </div>
        <div className="report-card">
          <h3>Ventas por Categoría</h3>
          {catEntries.length === 0 ? (
            <p className="report-empty">Sin datos.</p>
          ) : (
            <div className="report-hbar-chart">
              {catEntries.sort(([, a], [, b]) => b.revenue - a.revenue).map(([cat, val]) => (
                <div className="report-hbar-item" key={cat}>
                  <span className="report-hbar-label">{cat}</span>
                  <div className="report-hbar-track">
                    <div className="report-hbar-fill"
                      style={{ width: `${(val.revenue / maxCatRevenue) * 100}%` }} />
                  </div>
                  <span className="report-hbar-val">${val.revenue.toFixed(0)}</span>
                  <span className="report-hbar-count">({val.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="report-card">
        <h3><Trophy size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />Top 5 Comics Más Vendidos</h3>
        {topComics.length === 0 ? (
          <p className="report-empty">Sin ventas en este período.</p>
        ) : (
          <div className="report-top-list">
            {topComics.map((comic, i) => (
              <div className="report-top-item" key={comic.title}>
                <span className="report-top-rank">#{i + 1}</span>
                {comic.image && <img className="report-top-img" src={getImageUrl(comic.image)} alt={comic.title} />}
                <div className="report-top-info">
                  <p className="report-top-title">{comic.title}</p>
                  <span className="report-top-cat">{comic.category}</span>
                </div>
                <div className="report-top-stats">
                  <span>{comic.count} vendidos</span>
                  <strong>${comic.revenue.toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="report-card">
        <h3>Órdenes Recientes</h3>
        {orders.length === 0 ? (
          <p className="report-empty">No hay órdenes en este período.</p>
        ) : (
          <div className="report-orders-table">
            <div className="report-orders-header">
              <span>Factura</span>
              <span>Cliente</span>
              <span>Items</span>
              <span>Estado</span>
              <span>Fecha</span>
              <span className="text-right">Total</span>
              <span></span>
            </div>
            {orders.slice(0, 20).map((order) => (
              <div className="report-orders-row" key={order._id}>
                <span className="report-order-invoice">{order.invoiceNumber}</span>
                <span>{order.userName}</span>
                <span>{order.items.length} comics</span>
                <span>
                  <span className={`report-status-badge report-status-badge--${order.status}`}>
                    {statusLabel[order.status] || order.status}
                  </span>
                </span>
                <span>{new Date(order.createdAt).toLocaleDateString('es-MX')}</span>
                <span className="text-right report-order-total">${order.total?.toFixed(2)}</span>
                <span>
                  <button className="report-invoice-btn" title="Ver factura"
                    onClick={() => setModalId(order._id)}>
                    <FileText size={15} />
                  </button>
                </span>
              </div>
            ))}
            {orders.length > 20 && (
              <p className="report-more">+ {orders.length - 20} órdenes más</p>
            )}
          </div>
        )}
      </div>

      {modalId && <InvoiceModal orderId={modalId} onClose={() => setModalId(null)} />}
    </div>
  )
}

export default SalesReportComponent
