import React from 'react'
import './Footer.css'
import logo_white from '../../assets/logo_white.png'
import { FaTwitter } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <div className="footer-all">
      <div className="footer">
          <div className="footer-logo">
              <img src={logo_white} alt="" />
              <h1>Farbauti Comics</h1>
          </div>
          <div className="footer-quicklinks">
              <h1>Enlaces Rapidos</h1>
              <Link style={{textDecoration: 'none'}} to="/">Principal</Link>
              <Link style={{textDecoration: 'none'}} to="/register"> Registrate</Link>
          </div>
          <div className="footer-categories">
              <h1>Categorias</h1>
              <Link style={{textDecoration: 'none'}} to="/category/marvel">Marvel</Link>
              <Link style={{textDecoration: 'none'}} to="/category/dc"> DC</Link>
              <Link style={{textDecoration: 'none'}} to="/category/miscellaneous"> Misceláneo</Link>
              <Link style={{textDecoration: 'none'}} to="/category/animanga"> Animanga</Link>
          </div>
          <div className="footer-socials">
              <h1>Siguenos</h1>
              <a href='https://web.facebook.com/?_rdc=1&_rdr'><FaFacebook color='white'/></a>
              <a href= 'https://www.instagram.com/'><FaInstagram color='white'/></a>
              <a href='https://x.com/?lang=es'><FaTwitter color='white'/></a>
          </div>

      </div>
      <div className="footer-copyright">
          <hr color='grey'/>
          <p>© 2026 Farbauti Comics. All rights reserved.</p>
      </div>
</div>
  )
}

export default Footer
