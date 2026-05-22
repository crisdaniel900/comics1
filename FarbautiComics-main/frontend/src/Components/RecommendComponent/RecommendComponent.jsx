import React from 'react'
import './RecommendComponent.css'
import { useState, useEffect } from 'react';
import customFetch from '../../Utils/customFetch';
import ProfileItem from '../ProfileItem/ProfileItem';

const RecommendComponent = () => {

    const [recommendProducts, setRecommendProducts] = useState([])

  
  useEffect(() => {
    const fetchrecommendProducts = async () => {
      try {
        const { data } = await customFetch.post('/users/recommend-products');
        setRecommendProducts(data.products);
      } catch (error) {
        console.log(error)
      } 
    };

    fetchrecommendProducts();
  }, []);
  return (
        <div className="recommender">
      <h1>Recomendados para ti</h1>
      <hr />
      <div className="recommender-item">
        {recommendProducts.map((item, i) =>{
            return <ProfileItem key={i} id={item.id} 
            name={item.title} image={item.image} 
            price={item.price} publisher={item.publisher}/>
        })}
      </div>
    </div>
  )
}

export default RecommendComponent