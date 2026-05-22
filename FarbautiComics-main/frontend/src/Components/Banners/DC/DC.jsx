import React from 'react'
import './DC.css'
import dc_logo from '../../../assets/DC_Comics_logo.png'
import sups_banner from '../../../assets/sups_banner.png'

export const DC = () => {
  return (
    <div className="dc-banner">
        <div className="dc-banner-adv">
            <h1>Colección DC Comics</h1>
        </div>
        <div className="dc-banner-logo">
            <img src={dc_logo} alt="" />
        </div>
        <div className="dc-banner-img">
            <img src={sups_banner} alt="" />
        </div>
    </div>
  )
}

