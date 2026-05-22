import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EditProductComponent from '../Components/EditProductComponent/EditProductComponent'
import { CircleLoader } from 'react-spinners'
import customFetch from '../Utils/customFetch'

const EditProduct = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await customFetch.get(`/products/${productId}`)
        setProduct(data.product)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  if (isLoading) return <div><CircleLoader size={150} color="#000000" /></div>
  if (!product) return <div>Product not found</div>

  return <EditProductComponent product={product} />
}

export default EditProduct
