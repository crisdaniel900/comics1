import React, {useRef, useState, useEffect } from 'react'
import './Navbar.css'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { GiVikingShield } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { IoIosLogIn } from "react-icons/io";
import { GrUserAdmin } from "react-icons/gr";
import customFetch from '../../Utils/customFetch';



const Navbar = () => {


  const menuRef = useRef();
  
  const [isUser, setUser] = useState(false);
  const [isAdmin, setAdmin] = useState(false);

  const logoutUser = async () => {
    try {
      await customFetch.get('/auth/logout');
      setUser(false);
      setAdmin(false);
      window.location.href = '/';
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  // Pendiente refrescar pagina
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await customFetch.get('/auth/fetchUser');
        if (response?.data?.message) {
          const role = response.data.message;
          if (role === 'User') {
            setUser(true);
            setAdmin(false);
          } else if (role === 'Admin') {
            setUser(true);
            setAdmin(true);
          }

        }
      } catch (error) {
        console.log('Error fetching user:', error);
      }
    };
    
    fetchUser();
  }, []);



  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('ham-menu-visible');
    e.target.classList.toggle('open');

  } 

  
  return (
    <div className="navbar">
        <Link to='/'  style={{textDecoration: 'none', color: 'black'}}>
          <div className="nav-logo">
              <img src={logo} alt="logo" />
              <p>Farbauti Comics</p>
          </div>
        </Link>
        <ul className="nav-menu">
        <li className='link' ><Link style={{textDecoration: 'none', color: 'black'}} to='/'>Principal</Link></li>
        <li className='link' ><Link style={{textDecoration: 'none', color:'black'}} to='/category/marvel'>Marvel</Link></li>
        <li className='link' ><Link style={{textDecoration: 'none', color: 'black'}} to='/category/dc'>DC</Link></li>
        <li className='link' ><Link style={{textDecoration: 'none', color: 'black'}} to='/category/miscellaneous'>Misceláneo</Link></li>
        <li className='link' ><Link style={{textDecoration: 'none', color: 'black'}} to='/category/animanga'>Animanga</Link></li>
        {isUser ? <li className='link' ><Link style={{textDecoration: 'none', color: 'black'}} to='/forum'>Foro</Link></li>
        : <li className='link' ><Link style={{textDecoration: 'none', color: 'black'}} to='/register'>Foro</Link></li>}
        <GiVikingShield size={50} className='ham-dropdown' onClick={dropdown_toggle}/>
        </ul>
        <div className="hamburger">
          <ul ref={menuRef} className="ham-menu">
          {!isUser && !isAdmin && (
            <li onClick={dropdown_toggle}><Link style={{ textDecoration: 'none' }} to='/login'><IoIosLogIn />Iniciar Sesion</Link></li>
          )}
          {(isUser || isAdmin) && (
            <>
              <li onClick={dropdown_toggle}><Link style={{ textDecoration: 'none' }} to='/profile'><FaUser />Perfil</Link></li>
              <li onClick={dropdown_toggle}><Link style={{ textDecoration: 'none' }} to='/checkout'><FaShoppingCart />Carrito</Link></li>
              <li onClick={dropdown_toggle}><button type="button" onClick={logoutUser} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>Salir</button></li>
            </>
          )}
          {isAdmin && (
            <li onClick={dropdown_toggle}><Link style={{ textDecoration: 'none' }} to='/admin'><GrUserAdmin />Admin</Link></li>
          )}
          </ul>
      </div>

    </div>
  )
}

export default Navbar