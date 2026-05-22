import React, {useContext, useState} from 'react'
import ShopCategoryComponent from '../Components/ShopCategoryComponent/ShopCategoryComponent'




const ShopCategoryPage = ({category, banner}) => {

  return (
    <ShopCategoryComponent category={category} banner={banner}/>
  )
}

export default ShopCategoryPage