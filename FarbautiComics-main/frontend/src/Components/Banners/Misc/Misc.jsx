import React from 'react'
import './Misc.css'
import dh_logo from '../../../assets/dh_logo.png'
import image_logo from '../../../assets/image_logo.png'
import spawn_banner from '../../../assets/spawn_banner.png'

export const Misc = () => {
  return (
    <div className="misc-banner">
        <div className="misc-banner-adv">
            <h1>Colección Miscelánea</h1>
        </div>
        <div className="misc-banner-logo">
            <img src={dh_logo} alt="" />
            <img src={image_logo} alt="" />
        </div>
        <div className="misc-banner-img">
            <img src={spawn_banner} alt="" />
        </div>
    </div>
  )
}

