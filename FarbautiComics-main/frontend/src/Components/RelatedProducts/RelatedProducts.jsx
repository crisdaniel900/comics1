import React, { useEffect, useState } from 'react'
import './RelatedProducts.css'
//import data_product from '../../assets/data'
import  Item  from '../Item/Item'
import customFetch from '../../Utils/customFetch'



export const RelatedProducts = (props) => {

  const [relatedProducts, setRelatedProducts] = useState([]);

  const{category} = props;


  useEffect(() => {
    const controller = new AbortController();

    const fetchRelatedProducts = async () => {
      try {
        if (category) {
          const { data } = await customFetch.get(
            `/products/related?category=${category}`,
            { signal: controller.signal }
          );
          setRelatedProducts(data.products);
        }
      } catch (error) {
        if (error.name !== 'CanceledError') console.log(error);
      }
    };

    fetchRelatedProducts();

    return () => controller.abort(); // ← cancela la petición si cambia la categoría
  }, [category]); // ← escucha cambios de categoría

  
  return (
    <div className="relatedproducts">
        <h1>Productos Relacionados</h1>
        <hr />
        <div className="relatedproducts-item">
            {relatedProducts.map((item, i) =>{
                return <Item key={i} id={item.id} 
                name={item.title} image={item.image} 
                price={item.price} publisher={item.publisher}/>
            })}
        </div>
        
    </div>
  )
}
