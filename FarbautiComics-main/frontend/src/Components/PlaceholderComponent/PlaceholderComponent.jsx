import React from 'react'
import './PlaceholderComponent.css'
import Venom_PlaceHolder from '../../assets/Venom_PlaceHolder.jpg'

const PlaceholderComponent = () => {
  return (
    <div className="placeholder">
        <div className="placeholder-top">
            <div className="top-message">
                <h1>Looks empty...</h1>
            </div>
            <div className="top-image">
                <img src={Venom_PlaceHolder} alt="" />
            </div>
        </div>
        <div className="placeholder-bottom">
            <div className="bottom-message">
                <h4>Time to dive into some comics!</h4>
            </div>
            <div className="bottom-button">
                <button>Start Reading</button>
            </div>
        </div>
    </div>
  )
}

export default PlaceholderComponent