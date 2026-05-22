import React from 'react'
import './NewsLetter.css'
import spidey_news from '../../assets/news_spidey.png'

const NewsLetter = () => {
  return (
    <div className="newsletter">
      <h1>Obten Ofertas Exclusivas en tu Correo Electronico!</h1>
      <p>Suscribete a nuestro Boletin Informativo y mantente Actualizado</p>
      <div>
          <input type="email" placeholder=' Tu Correo Electronico' />
          <button>Suscribirme</button>
          <img src={spidey_news} alt="" />
      </div>
  </div>
  )
}

export default NewsLetter