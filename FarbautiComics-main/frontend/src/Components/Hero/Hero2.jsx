import React from 'react'
import './Hero2.css'
import daredevil_hero from '../../assets/Daredevil_Hero.png'
import arrow_icon from '../../assets/arrow.png'
import { Link } from 'react-router-dom'

const Hero2 = () => {
  return (
    <div className="hero1">
      <div className="hero1-left">
          <img src={daredevil_hero} alt="" />
      </div>
      <div className="hero1-right">
          <h2>Nuevos Productos Disponibles</h2>
          <div>
              <p>The Man</p>
              <p>Without Fear</p>
          </div>
          <Link style={{textDecoration:'none', color: 'white', fontFamily: 'Oswald'}} to='/category/marvel'>
                  <button className="hero1-btn">
                  <div>Marvel comics</div>
                  <img src={arrow_icon} alt="" />
              </button>
          </Link>
      </div>
  </div>
  )
}

export default Hero2