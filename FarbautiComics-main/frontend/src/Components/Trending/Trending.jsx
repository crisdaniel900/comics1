import React, {useState, useEffect, useContext} from 'react'
import './Trending.css'
//import trending from '../../assets/trending'
import Item from '../Item/Item'
import customFetch from '../../Utils/customFetch'
import { ShopContext } from '../../Context/ShopContext'


const Trending = () => {
  
const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth > 1700) setVisibleCount(6);
    else if (window.innerWidth < 1700) setVisibleCount(5);
    else setVisibleCount(3)
  };

  handleResize(); // set inicial
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

const{trendingProducts} = useContext(ShopContext)
  
  return (
    <div className="trending">
      <h1>Productos Populares</h1>
      <hr />
      <div className="trending-collection">
          {trendingProducts.slice(0, visibleCount).map((item, i) => {
              return <Item key={i} id={item.id} 
              name={item.title} image={item.image} 
              price={item.price} publisher={item.publisher}/>

          })}
      </div>
  </div>
  )
}

export default Trending