import React, { useEffect, useState } from 'react'
import './BestSellers.css'
//import data from '../../assets/data'
import Item from '../Item/Item'
import customFetch from '../../Utils/customFetch'





const BestSellers = () => {

  const [newProducts, setnewProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchnewProducts = async () => {
      try {
        const { data } = await customFetch.get('/products/newproducts');
        setnewProducts(data.products);
      } catch (error) {
        console.log(error)
      } 
    };

    fetchnewProducts();
  }, []);

    useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1700) setVisibleCount(6);
      else if (window.innerWidth < 1700) setVisibleCount(5);
      else setVisibleCount(3)
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bestseller">
      <h1>Nuevos Productos</h1>
      <hr />
      <div className="bestseller-item">
        {newProducts.slice(0, visibleCount).map((item, i) =>{
            return <Item key={i} id={item.id} 
            name={item.title} image={item.image} 
            price={item.price} publisher={item.publisher}/>
        })}
      </div>
    </div>
  )
}

export default BestSellers