import React, {useState} from 'react'
import './DescriptionBox.css'

export const DescriptionBox = (props) => {

  const [state, setState] = useState("Description")
  const {product} = props;
  return (
    <div className="descriptionbox">
      <div className="descriptionbox-navigator">
        <div onClick={() => setState("Description")} className={`descriptionbox-nav-box ${state === "Description" ? "active" : ""}`}>
          Descripcion
        </div>
        <div onClick={() => setState("Details")} className={`descriptionbox-nav-box ${state === "Details" ? "active" : ""}`}>
          Detalles
        </div>
      </div>
      <div className="descriptionbox-description">
        {state === "Details" ?
          <div className="details fade-in">
            <div className="details-left">
              <p><strong>Artista/Escritor:</strong> {product.artistWriter}</p>
              <p><strong>Portada:</strong> {product.coverArtist}</p>
              <p><strong>Idioma:</strong> {product.language}</p>
            </div>
            <div className="details-middle">
              <p><strong>Estilo:</strong> {product.style}</p>
              <p><strong>Region de Manufactura:</strong> {product.countryManufacture}</p>
              <p><strong>Tipo:</strong> {product.type}</p>
            </div>
            <div className="details-right">
              <p><strong>Editorial:</strong> {product.publisher}</p>
              <p><strong>Genero:</strong> {product.genre}</p>
              <p><strong>Formato:</strong> {product.format}</p>
            </div>
          </div>
          :
          <p className="fade-in">
            {product.description}
          </p>
        }
      </div>
    </div>
  )
}

