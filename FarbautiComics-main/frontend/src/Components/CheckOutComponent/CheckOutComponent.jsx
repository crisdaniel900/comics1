import React, { useEffect, useState, useContext } from 'react'
import './CheckOutComponent.css'
import { getImageUrl } from '../../Utils/imageUrl'
import customFetch from '../../Utils/customFetch'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ShopContext } from '../../Context/ShopContext'

const CheckOutComponent = () => {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const navigate = useNavigate()
  const { fetchAllProducts } = useContext(ShopContext)

  const fetchCart = async () => {
    try {
      const { data } = await customFetch.get('/users/getcart')
      setCart(data.cart || [])
    } catch (error) {
      toast.error('No se pudo cargar el carrito')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const removeItem = async (productId) => {
    try {
      await customFetch.delete('/users/removecart', { data: { productId } })
      setCart((prev) => prev.filter((p) => p._id !== productId))
      toast.success('Producto removido del carrito')
    } catch (error) {
      toast.error('Error al remover producto')
    }
  }

  const subtotal = cart.reduce((sum, p) => sum + (p.price || 0), 0)

  const handlePurchase = async () => {
    if (cart.length === 0) return
    setPurchasing(true)
    try {
      const { data } = await customFetch.post('/orders/checkout')
      await fetchAllProducts(true)  // ← refresca el stock en memoria
      toast.success('¡Compra realizada con éxito!')
      navigate(`/invoice/${data.order._id}`)
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Error al procesar la compra')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) return <div className="cartitems"><p className="cart-loading">Cargando carrito...</p></div>

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Producto</p>
        <p>Título</p>
        <p>Precio</p>
        <p>Categoría</p>
        <p></p>
        <p>Remover</p>
      </div>
      <hr />

      {cart.length === 0 ? (
        <div className="cart-empty">
          <p>Tu carrito está vacío.</p>
        </div>
      ) : (
        cart.map((product, index) => (
          <React.Fragment key={product._id || index}>
            <div className="cartitems-format-main cartitems-format">
              <img
                 src={getImageUrl(product.image)}
                alt={product.title}
                className="carticon-product-icon"
              />
              <p>{product.title}</p>
              <p>${product.price?.toFixed(2)}</p>
              <p className="cart-category-badge">{product.category}</p>
              <p></p>
              <button
                className="cartitems-remove-btn"
                onClick={() => removeItem(product._id)}
                title="Remover del carrito"
              >
                ✕
              </button>
            </div>
            <hr />
          </React.Fragment>
        ))
      )}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Total del Carrito</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal ({cart.length} {cart.length === 1 ? 'ítem' : 'ítems'})</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Precio de envío</p>
              <p>Gratis</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${subtotal.toFixed(2)}</h3>
            </div>
          </div>
          <button
            onClick={handlePurchase}
            disabled={cart.length === 0 || purchasing}
            className={cart.length === 0 || purchasing ? 'btn-disabled' : ''}
          >
            {purchasing ? 'PROCESANDO...' : 'COMPRAR AHORA'}
          </button>
          {cart.length > 0 && (
            <p className="cart-disclaimer">
              Se generará una factura al completar la compra.
            </p>
          )}
        </div>
        <div className="cartitems-promocode">
          <p>Canjea un código promocional</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="Código" />
            <button>Canjear</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckOutComponent
