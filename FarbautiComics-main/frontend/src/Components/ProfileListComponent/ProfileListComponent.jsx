import React,{useEffect, useState} from 'react'
import UserCollection from '../UserCollection/UserCollection';
import './ProfileListComponent.css'
import { FaUserCircle } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { CiBookmark } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";
import { CiStar } from "react-icons/ci";
import { toast } from 'react-toastify';
import { CiHeart } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import customFetch from '../../Utils/customFetch';
import PlaceholderComponent from '../PlaceholderComponent/PlaceholderComponent';

const ProfileListComponent = (props) => {

    const [wishProducts, setwishProducts] = useState([]);
    const [favoriteProducts, setfavoriteProducts] = useState([]);
    const [readProducts, setreadProducts] = useState([]);
    const[displayedProducts, setDisplayedProducts] = useState(readProducts)

    useEffect(() => {
        const fetchwishProducts = async () => {
            try {
            const { data } = await customFetch.get('/users/getwishlist');

            setwishProducts(data.wishlist);
        
            } catch (error) {
            console.log(error);
            } 
        };
        
        fetchwishProducts();
        }, []);


      
    useEffect(() => {
        const fetchfavoriteProducts = async () => {
            try {
            const { data } = await customFetch.get('/users/getfavorites');

            setfavoriteProducts(data.favorites);
        
            } catch (error) {
            console.log(error);
            } 
        };
        
        fetchfavoriteProducts();
        }, []);

    


    useEffect(() => {
        const fetchreadProducts = async () => {
        try {
            const { data } = await customFetch.get('/users/getreadhistory');

            setreadProducts(data.readHistory);
    
        } catch (error) {
            console.log(error);
        } 
        };
    
        fetchreadProducts();
    }, []);

    useEffect(() => {
    setDisplayedProducts(favoriteProducts);
    }, [favoriteProducts]);

    const handleDisplayChange = (products) => {
      setDisplayedProducts(products);
      console.log(products)
     

    }


    const navigate = useNavigate();

    const logoutUser = async () => {
        await customFetch.get('/auth/logout');
        toast.success('Logging Out...');
        window.location.href = '/';  // ← recarga completa, Navbar se reinicia con estado limpio
    }

  return (
      <div className="profile-bottom">
        <div className="profile-bottom-options">
          <button className="bottom-options" onClick={() => handleDisplayChange(readProducts)}>
              <p>Biblioteca ({props.readHistory.length})</p>
          </button>
          <button className="bottom-options" onClick={() => handleDisplayChange(favoriteProducts)}>
              <p>Favoritos ({props.favorites.length})</p>
          </button>
          <button className="bottom-options" onClick={() => handleDisplayChange(wishProducts)}>
              <p>Lista de deseos ({props.wishlist.length})</p>
          </button>
          <button className="bottom-options" onClick={logoutUser}>
              <p>Cerrar Sesion</p>
          </button>
        </div>
        {displayedProducts.length === 0 ? 
        <div className="collections-placeholder">
            <PlaceholderComponent/>
        </div> : 
        <div className="profile-bottom-collections">
            {displayedProducts.map((item, i) => {
            let type = '';
            if (displayedProducts === favoriteProducts) type = 'favorites';
            else if (displayedProducts === wishProducts) type = 'wishlist';
            else if (displayedProducts === readProducts) type = 'read';
            return <UserCollection key={i} id={item.id} 
            name={item.title} image={item.image} 
            genre={item.genre} artistWriter = {item.artistWriter}
            publisher={item.publisher} hearts={item.hearts}
            description={item.description} type={type}/>

            })}
        </div>}
      </div>
  )
}

export default ProfileListComponent
