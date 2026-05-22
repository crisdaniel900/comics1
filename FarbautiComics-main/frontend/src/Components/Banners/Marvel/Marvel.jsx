import React from 'react'
import './Marvel.css'
import marvel_logo from '../../../assets/marvel_logo.png'
import spidey_banner from '../../../assets/spidey_banner.png'


export const Marvel = () => {
  return (
    <div className="marvel-banner">
        <div className="marvel-banner-adv">
            <h1>Colección Marvel Comics</h1>
        </div>
        <div className="marvel-banner-logo">
            <img src={marvel_logo} alt="" />
        </div>
        <div className="marvel-banner-img">
          <img src={spidey_banner} alt="" />
        </div>
    </div>
  )

}

