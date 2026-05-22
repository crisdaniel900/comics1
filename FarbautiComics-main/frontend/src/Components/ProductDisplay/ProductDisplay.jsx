import React, { useContext, useState} from 'react'
import './ProductDisplay.css'
import { FaRegHeart, FaHeart, FaRegStar, FaStar } from "react-icons/fa";
import { IoBookOutline, IoBook } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { toast } from 'react-toastify';
import { FaShoppingCart } from "react-icons/fa";
import { getImageUrl } from '../../Utils/imageUrl'


export const ProductDisplay = (props) => {
  const {product} = props;
  const {addToFavorites, addToLibrary, addToWishlist, addToCart} = useContext(ShopContext)

  const imageUrl = getImageUrl(product.image)

  const [isUser, setUser] = useState(true);

  const [isWishlistClicked, setIsWishlistClicked] = useState(false);
  const [isFavoritesClicked, setIsFavoritesClicked] = useState(false);
  const [isReadClicked, setIsReadClicked] = useState(false);
  const [heartsCount, setHeartsCount] = useState(product.hearts)

  const handleWishlistClick = () => {
    setIsWishlistClicked(!isWishlistClicked);
    addToWishlist(product.id)
  };


  const handleFavoritesClick = async () => {

    const newFavoriteState = !isFavoritesClicked;
    setIsFavoritesClicked(newFavoriteState);

    setHeartsCount(prev => newFavoriteState ? prev + 1 : prev - 1);

    const result = await addToFavorites(product.id);

    if (result?.success === false) {
      setIsFavoritesClicked(!newFavoriteState);
      setHeartsCount(prev => newFavoriteState ? prev - 1 : prev + 1);
      toast.error('Error al actualizar favoritos');
   }

    
  };

  const handleReadClick = () => {
    setIsReadClicked(!isReadClicked);
    addToLibrary(product.id)
  };

  return (
    <div className="product-display">
      <section className="product-display-header">
        <div className="product-display-header-img">
          <div>
            <img src={imageUrl} alt="" />
          </div>
        </div>
        <div className="product-display-header-specs">
          <div>
              <h1>{product.title}</h1>
              <div className="product-display-header-cart">
                <div className="product-display-header-price">
                    <p>${product.price}</p>
                </div>
                <div className="product-display-stock">
                  {product.stock > 0
                    ? <span className="stock-available">En stock: {product.stock}</span>
                    : <span className="stock-unavailable">Sin stock</span>
                  }
                </div>
                <div className="product-display-header-button">
                {isUser?
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={!product.stock || product.stock === 0}
                    title={!product.stock || product.stock === 0 ? 'Sin stock disponible' : 'Agregar al carrito'}
                  ><FaShoppingCart size={25}/></button>
                  :<Link to='/register'><button><FaShoppingCart/></button></Link>
                }
              </div>
              </div>

          </div>
          <div className='product-display-container'>

            <div className="product-display-header-hearts">
              <div className="hearts-container">
              <FaHeart size={25}/>
              <h3>{heartsCount}</h3>
            </div>
        </div>
      </div>
        {isUser?
          <div className="product-display-widgets">
            <div
              className="product-display-widgets-container"
              onClick={handleWishlistClick}
            >
                <FaRegStar size={22} />
                <h4>Lista de Deseos</h4>
            </div>
            <div
              className="product-display-widgets-container"
              onClick={handleFavoritesClick}
            >
              <FaRegHeart size={22}/>
              <h4>Favoritos</h4>
            </div>
            <div
              className="product-display-widgets-container"
              onClick={handleReadClick}
            >
              <IoBookOutline size={22} />
              <h4>Leido</h4>
            </div>
          </div>
          :<></>}
        </div>
      </section>
      

    </div>
  )
}

