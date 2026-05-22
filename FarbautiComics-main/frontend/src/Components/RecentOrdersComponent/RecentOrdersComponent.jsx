import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import { Download, Eye, X } from 'lucide-react'
import './RecentOrdersComponent.css'

const RecentOrdersComponent = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(null)
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

  // Descargar voucher como PDF
  const handleDownloadPDF = async (orderId) => {
    try {
      // Esperar a que el PDF se genere
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      // Redirigir al iframe a la página de factura
      iframe.src = `/invoice/${orderId}`
      
      // Esperar a que cargue y luego imprimir como PDF
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.print()
        }, 500)
      }

      // Alternativa: usar window.open para que el usuario guarde el PDF
      setTimeout(() => {
        window.open(`/invoice/${orderId}`, '_blank')
      }, 100)
    } catch (error) {
      toast.error('Error al descargar voucher')
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
                  title="Descargar voucher"
                  onClick={() => handleDownloadPDF(order._id)}
                >
                  <Download size={16} />
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
