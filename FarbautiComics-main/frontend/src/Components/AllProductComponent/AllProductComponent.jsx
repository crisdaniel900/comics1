import React, { useContext, useState } from 'react'
import './AllProductComponent.css'
import { Link, redirect, useLoaderData, useRevalidator } from 'react-router-dom'
import customFetch from '../../Utils/customFetch'
import { ShopContext } from '../../Context/ShopContext'
import { toast } from 'react-toastify'
import { getImageUrl } from '../../Utils/imageUrl'
import { PRODUCT_CATEGORY } from '../../../../Utils/Constants'

export const loader = async () => {
  try {
    const { data } = await customFetch.get('/products/allproducts');
    return data.products;
  } catch (error) {
    console.log(error)
    return redirect('/');
  }
}

const AllProductComponent = () => {
  const { revalidate } = useRevalidator()
  const { fetchAllProducts } = useContext(ShopContext)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const all_products = useLoaderData();
  const filtered_products = selectedCategory === 'all' 
    ? all_products 
    : all_products.filter(product => product.category === selectedCategory);

  const handleDelete = async (productId) => {
    try {
      await customFetch.delete(`/products/${productId}`)
      toast.success('Producto eliminado')
      fetchAllProducts(true)   // actualiza el contexto global
      revalidate()             // recarga el loader de esta página
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Error al eliminar')
    }
  }

  return (
    <div className="list-product">
      <h1>Lista de productos</h1>
      <div className="category-filter">
        <label htmlFor="category-select">Filtrar por categoría:</label>
        <select 
          id="category-select"
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">Todas las categorías</option>
          {Object.entries(PRODUCT_CATEGORY).map(([key, value]) => (
            <option key={key} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="listproduct-format-main">
        <p>Productos</p>
        <p>Titulo</p>
        <p>Precio</p>
        <p>Stock</p>
        <p>Categoria</p>
        <p>Acciones</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {filtered_products.map((product, index) => (
          <React.Fragment key={index}>
            <div className="listproduct-format-main listproduct-format">
              <img
                src={getImageUrl(product.image)}
                alt=""
                className="listproduct-product-icon"
              />
              <p>{product.title}</p>
              <p>${product.price}</p>
              <p className={product.stock === 0 ? 'stock-zero' : ''}>{product.stock ?? 0}</p>
              <p>{product.category}</p>
              <div className="listproduct-allproducts-btn">
                <Link to={`/admin/edit-product/${product._id}`}><button>Editar</button></Link>
                <button onClick={() => handleDelete(product._id)}>Eliminar</button>
              </div>
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default AllProductComponent
