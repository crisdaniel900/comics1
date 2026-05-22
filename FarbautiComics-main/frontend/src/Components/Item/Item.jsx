import React from 'react'
import './Item.css'
import { useNavigate } from 'react-router-dom'
import { FaLongArrowAltRight } from "react-icons/fa";
import { getImageUrl } from '../../Utils/imageUrl'

const Item = (props) => {
  const navigate = useNavigate()

  const imageUrl = getImageUrl(props.image)
 // <Link to={`/product/${props.id}`}><img onClick={window.scrollTo(0, 0)} src={imageUrl} alt="" /></Link>

 const shortTitle = props.name.length > 25 ? props.name.slice(0, 28 - 3) + '...' : props.name

  const goToProduct = () => {
    navigate(`/product/${props.id}`)
    window.scrollTo(0, 0)
  }


  return (
    <div
      className="item"
      role="button"
      tabIndex={0}
      onClick={goToProduct}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          goToProduct()
        }
      }}
    >
        <div className="item-top">
            <img src={imageUrl} alt="" />
        </div>
        <div className="item-middle">
          <h3>{shortTitle}</h3>
          <p>{props.publisher}</p>
        </div>
        <div className="item-bottom">
            <h3>${props.price}</h3>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                goToProduct()
              }}
              aria-label={`Ver detalle de ${props.name}`}
            >
              <FaLongArrowAltRight color='white' size={16}/>
            </button>
        </div>
    </div>
  )
}

export default Item