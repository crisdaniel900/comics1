import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import { Download, Eye, X } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import './RecentOrdersComponent.css'

const RecentOrdersComponent = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const { data } = await customFetch.get('/orders/my-orders')
        setOrders(data.orders || [])
      } catch (error) {
        console.log(error)
        toast.error('Error al cargar órdenes')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

  const getStatusLabel = (status) => {
    const statusMap = {
      completed: 'Completado',
      refunded: 'Cancelado',
      pending: 'Pendiente',
    }

    return statusMap[status] || status || 'Desconocido'
  }

  // Descargar recibo como PDF
  const handleDownloadPDF = async (order) => {
    try {
      setDownloadingId(order._id)

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const margin = 40
      const pageWidth = doc.internal.pageSize.getWidth()

      const purchaseDate = new Date(order.createdAt).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      doc.setFillColor(17, 17, 17)
      doc.rect(0, 0, pageWidth, 84, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('FARBAUTI COMICS', margin, 36)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Recibo de compra', margin, 58)

      doc.setTextColor(17, 17, 17)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Factura', margin, 118)
      doc.setFont('helvetica', 'normal')
      doc.text(order.invoiceNumber || 'N/D', margin, 136)

      doc.setFont('helvetica', 'bold')
      doc.text('Cliente', margin, 170)
      doc.setFont('helvetica', 'normal')
      doc.text(order.userName || 'N/D', margin, 188)
      doc.text(order.userEmail || 'N/D', margin, 206)

      doc.setFont('helvetica', 'bold')
      doc.text('Estado', margin + 240, 170)
      doc.setFont('helvetica', 'normal')
      doc.text(getStatusLabel(order.status), margin + 240, 188)

      doc.setFont('helvetica', 'bold')
      doc.text('Fecha', margin + 240, 206)
      doc.setFont('helvetica', 'normal')
      doc.text(purchaseDate, margin + 240, 224)

      autoTable(doc, {
        startY: 250,
        head: [['Comic', 'Categoría', 'Precio']],
        body: (order.items || []).map((item) => [
          item.title || 'Sin título',
          item.category || '-',
          formatCurrency(item.price),
        ]),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [17, 17, 17] },
        margin: { left: margin, right: margin },
      })

      const totalsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 22 : 292
      doc.setFont('helvetica', 'bold')
      doc.text('Subtotal', margin, totalsY)
      doc.setFont('helvetica', 'normal')
      doc.text(formatCurrency(order.subtotal), pageWidth - margin - 80, totalsY, { align: 'right' })

      doc.setFont('helvetica', 'bold')
      doc.text('Envío', margin, totalsY + 22)
      doc.setFont('helvetica', 'normal')
      doc.text('Gratis', pageWidth - margin - 80, totalsY + 22, { align: 'right' })

      doc.setLineWidth(0.8)
      doc.line(margin, totalsY + 36, pageWidth - margin, totalsY + 36)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text('TOTAL', margin, totalsY + 58)
      doc.text(formatCurrency(order.total), pageWidth - margin - 80, totalsY + 58, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(120, 120, 120)
      doc.text('Gracias por tu compra en Farbauti Comics.', margin, 760)

      const safeInvoice = String(order.invoiceNumber || 'recibo').replace(/[^a-zA-Z0-9-_]+/g, '_')
      doc.save(`${safeInvoice}.pdf`)
      toast.success('Recibo descargado en PDF')
    } catch (error) {
      console.log(error)
      toast.error('Error al descargar PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  // Ver factura en detalle
  const handleViewInvoice = (orderId) => {
    navigate(`/invoice/${orderId}`)
  }

  // Cancelar orden
  const handleCancelOrder = async (orderId, orderInvoice) => {
    if (!window.confirm(`¿Deseas cancelar la orden ${orderInvoice}? Se devolverá el stock de los productos.`)) {
      return
    }

    try {
      setCanceling(orderId)
      const { data } = await customFetch.post(`/orders/${orderId}/cancel`)
      toast.success('Orden cancelada exitosamente')
      // Actualizar la lista de órdenes
      const updatedOrders = orders.map(order =>
        order._id === orderId ? { ...order, status: 'refunded' } : order
      )
      setOrders(updatedOrders)
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Error al cancelar la orden')
    } finally {
      setCanceling(null)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Completada', className: 'status-completed' },
      refunded: { label: 'Cancelada', className: 'status-refunded' },
      pending: { label: 'Pendiente', className: 'status-pending' },
    }
    const statusInfo = statusMap[status] || { label: status, className: 'status-unknown' }
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
  }

  if (loading) {
    return (
      <div className="recent-orders">
        <div className="recent-orders-loading">Cargando órdenes...</div>
      </div>
    )
  }

  return (
    <div className="recent-orders">
      <div className="recent-orders-header">
        <h3>Órdenes Recientes</h3>
        <p className="recent-orders-subtitle">
          {orders.length === 0
            ? 'No tienes órdenes aún'
            : `${orders.length} orden${orders.length !== 1 ? 'es' : ''}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="recent-orders-empty">
          <p>No hay órdenes para mostrar</p>
          <p className="recent-orders-empty-sub">
            Cuando realices una compra, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="recent-orders-table">
          <div className="recent-orders-table-header">
            <span>Factura</span>
            <span>Fecha</span>
            <span>Items</span>
            <span>Estado</span>
            <span>Total</span>
            <span>Acciones</span>
          </div>

          {orders.slice(0, 10).map((order) => (
            <div className="recent-orders-row" key={order._id}>
              <span className="recent-order-invoice">{order.invoiceNumber}</span>
              <span className="recent-order-date">
                {new Date(order.createdAt).toLocaleDateString('es-MX')}
              </span>
              <span className="recent-order-items">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              <span className="recent-order-status">
                {getStatusBadge(order.status)}
              </span>
              <span className="recent-order-total">
                ${order.total?.toFixed(2)}
              </span>
              <span className="recent-order-actions">
                <button
                  className="recent-order-btn recent-order-btn-view"
                  title="Ver factura"
                  onClick={() => handleViewInvoice(order._id)}
                >
                  <Eye size={16} />
                </button>
                <button
                  className="recent-order-btn recent-order-btn-download"
                  title="Descargar PDF"
                  onClick={() => handleDownloadPDF(order)}
                  disabled={downloadingId === order._id}
                >
                  {downloadingId === order._id ? '...' : 'PDF'}
                </button>
                {order.status === 'completed' && (
                  <button
                    className="recent-order-btn recent-order-btn-cancel"
                    title="Cancelar orden"
                    onClick={() => handleCancelOrder(order._id, order.invoiceNumber)}
                    disabled={canceling === order._id}
                  >
                    {canceling === order._id ? '...' : <X size={16} />}
                  </button>
                )}
              </span>
            </div>
          ))}

          {orders.length > 10 && (
            <p className="recent-orders-more">
              + {orders.length - 10} órdenes más
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default RecentOrdersComponent
