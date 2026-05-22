import React from 'react'
import './Hero1.css'
import Venom_hero from '../../assets/Venom_Hero.png'
import arrow_icon from '../../assets/arrow.png'
import { Link } from 'react-router-dom'

const Hero1 = () => {
  return (
    <div className="hero">
      <div className="hero-left">
          <img src={Venom_hero} alt="" />
      </div>
      <div className="hero-right">
          <h2>Descubre Nuevas Historias</h2>
          <div>
              <p>Venom</p>
              <p>Protector Letal</p>
          </div>
          <Link style={{textDecoration:'none', color: 'white', fontFamily: 'Oswald'}} to='/category/marvel'>
                  <button className="hero-btn">
                  <div>Marvel comics</div>
                  <img src={arrow_icon} alt="" />
              </button>
          </Link>
      </div>
  </div>
  )
}

export default Hero1