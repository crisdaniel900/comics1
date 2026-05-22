import React, { useContext } from 'react'
import './UserCollection.css'
import { Link } from 'react-router-dom'
import { TiHeartFullOutline } from "react-icons/ti";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { ShopContext } from '../../Context/ShopContext';
import { getImageUrl } from '../../Utils/imageUrl';


const UserCollection = (props) => {


  const imageUrl = getImageUrl(props.image)

  const{removeFavorites, removeRead, removeWishlist} = useContext(ShopContext)
  
  const handleRemoveClick = () => {
    if(props.type === "favorites"){
      removeFavorites(props.id);
    } else if (props.type === "wishlist"){
      removeWishlist(props.id)
    } else if (props.type === "read") {
      removeRead(props.id);
    }
  }
  
  
  return (
    <div className="user-collection">
        <div className="user-collection-top">
          <div className="user-collection-top-left">
              <img src={imageUrl} alt="" />
          </div>
          <div className="user-collection-top-right">
              <h4>{props.name}</h4>
              <p>{props.artistWriter}</p>
              <p>{props.publisher}</p>
              <div className="collection-hearts">
                <TiHeartFullOutline color='red' size={25}/><p>{props.hearts}</p>
              </div>
              <div className="user-collection-options">
                <Link to={`/product/${props.id}`} ><button className="view-button"><FaLongArrowAltRight color='white'/></button></Link>
                <button onClick={handleRemoveClick} className='remove-button'><FaTrashAlt/></button>
              </div>
          </div>
        </div>
    </div>

  )
}

export default UserCollection