import { useState, useEffect, useContext } from 'react';
import './HomeBanner.css'
import { Link } from 'react-router-dom'
import customFetch from '../../Utils/customFetch';
import { TiHeartFullOutline } from "react-icons/ti";
import { ShopContext } from '../../Context/ShopContext';
import { getImageUrl } from '../../Utils/imageUrl';

const HomeBanner = () => {

  const {trendingProducts} = useContext(ShopContext)

  const products = trendingProducts;

  const mostLiked = products.reduce((max, product) =>
          product.hearts > max.hearts ? product : max, products[0])


  if (!mostLiked) return <div className="homebanner-loading">Loading...</div>;

    const imageUrl = getImageUrl(mostLiked.image)


  return (
    <div className="homebanner">
        <div className="homebanner-left">
            <div className="homebanner-topleft">
                <div className="homebanner-header">
                    <p>Favorito de la comunidad</p>
                </div>
                <h1>{mostLiked.title}</h1>
                <div className="homebanner-hearts">
                    <TiHeartFullOutline size={25} color='red'/>
                    <h3>{mostLiked.hearts}</h3>
                </div>
            </div>
            <div className="homebanner-bottomleft">
                <p>{mostLiked.description}</p>
            </div>
            <div className="homebanner-buttons">
                <Link to={`/product/${mostLiked.id}`}><button>Comprar por - ${mostLiked.price}</button></Link>
                <button>Agregar a la lista de deseos</button>
            </div>
        </div>
        <div className="homebanner-right">
            <img src={imageUrl} alt="" />
        </div>
  </div>
  )
}

export default HomeBanner