import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import customFetch from '../../Utils/customFetch'
import './InvoiceComponent.css'

const InvoiceComponent = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await customFetch.get('/orders/my-orders')
        const found = data.orders.find((o) => o._id === orderId)
        setOrder(found || null)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  if (loading) return <div className="invoice-loading">Cargando factura...</div>
  if (!order) return <div className="invoice-loading">Factura no encontrada.</div>

  const purchaseDate = new Date(order.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="invoice-wrapper">
      <div className="invoice-container" id="invoice-print">

        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-brand">
            <h1>FARBAUTI</h1>
            <span className="invoice-brand-sub">COMICS</span>
          </div>
          <div className="invoice-meta">
            <div className="invoice-badge">FACTURA</div>
            <p className="invoice-number">{order.invoiceNumber}</p>
            <p className="invoice-date">{purchaseDate}</p>
          </div>
        </div>

        <div className="invoice-divider" />

        {/* Customer info */}
        <div className="invoice-info-grid">
          <div className="invoice-info-block">
            <h4>FACTURADO A</h4>
            <p>{order.userName}</p>
            <p>{order.userEmail}</p>
          </div>
          <div className="invoice-info-block invoice-info-right">
            <h4>ESTADO</h4>
            <span className={`invoice-status invoice-status--${order.status}`}>
              {order.status === 'completed' ? '✓ Completado' : order.status}
            </span>
          </div>
        </div>

        {/* Items table */}
        <div className="invoice-table">
          <div className="invoice-table-header">
            <span>COMIC</span>
            <span>CATEGORÍA</span>
            <span className="text-right">PRECIO</span>
          </div>
          {order.items.map((item, i) => (
            <div className="invoice-table-row" key={i}>
              <span className="invoice-item-title">{item.title}</span>
              <span className="invoice-item-cat">{item.category}</span>
              <span className="invoice-item-price text-right">${item.price?.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="invoice-total-row">
            <span>Subtotal</span>
            <span>${order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="invoice-total-row">
            <span>Envío</span>
            <span>Gratis</span>
          </div>
          <div className="invoice-divider" />
          <div className="invoice-total-row invoice-total-final">
            <span>TOTAL</span>
            <span>${order.total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>Gracias por tu compra en Farbauti Comics</p>
          <p className="invoice-footer-small">
            Esta es una factura simulada con fines demostrativos.
          </p>
        </div>
      </div>

      {/* Actions — se ocultan al imprimir */}
      <div className="invoice-actions no-print">
        <button className="invoice-btn-print" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
        <Link to="/" className="invoice-btn-home">
          Volver al inicio
        </Link>
        <Link to="/profile" className="invoice-btn-profile">
          Ver mis pedidos
        </Link>
      </div>
    </div>
  )
}

export default InvoiceComponent
