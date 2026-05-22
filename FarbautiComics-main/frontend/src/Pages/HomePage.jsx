import React from 'react'
import HomeSlider from '../Components/Slider/HomeSlider'
import BestSellers from '../Components/BestSellers/BestSellers'
import HomeBanner from '../Components/HomeBanner/HomeBanner'
import Trending from '../Components/Trending/Trending'
import NewsLetter from '../Components/NewsLetter/NewsLetter'



const HomePage = () => {
  return (
    <div>
      <HomeSlider/>
      <BestSellers />
      <HomeBanner />
      <Trending />
      <NewsLetter />
    </div>
  )
}

export default HomePage