import React from 'react'
import './ErrorComponent.css'
import Error_Spidey from '../../assets/404_spidey.jpg'
import Error from '../../assets/404_error.png'
import { Link, useRouteError } from 'react-router-dom'

const ErrorComponent = () => {
  const error = useRouteError();
  if(error.status === 404) {
    return (
      <div className="error-container">
        <div className="error-image">
         <img src={Error_Spidey} alt="404_spidey" />
        </div>
        <div className="error-logo">
          <img src={Error} alt="error" />
        </div>
        <Link to= '/'><button className="back-button">Go Back</button></Link>
      </div>
    )
  }
    return (
      <div className="">
        <h3>Something Went Wrong</h3>
      </div>
    )

  

}

export default ErrorComponent