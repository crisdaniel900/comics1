import React from 'react'
import './ProfileItem.css'
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../Utils/imageUrl'
import { FaLongArrowAltRight } from "react-icons/fa";

const ProfileItem = (props) => {

    const imageUrl = getImageUrl(props.image)
    // <Link to={`/product/${props.id}`}><img onClick={window.scrollTo(0, 0)} src={imageUrl} alt="" /></Link>
    const shortTitle = props.name.length > 25 ? props.name.slice(0, 28 - 3) + '...' : props.name
  return (
        <div className="profile-item">
            <div className="profile-item-top">
                <img src={imageUrl} alt="" />
            </div>
            <div className="profile-item-middle">
              <h3>{shortTitle}</h3>
              <p>{props.publisher}</p>
            </div>
            <div className="profile-item-bottom">
                <h3>${props.price}</h3>
                <Link to={`/product/${props.id}`}><button onClick={window.scrollTo(0, 0)}><FaLongArrowAltRight color='white' size={16}/></button></Link>
            </div>
        </div>
  )
}

export default ProfileItem