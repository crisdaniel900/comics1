import React from 'react'
import './HomeSlider.css'
import Slider from 'react-slick'
import Hero1 from '../Hero/Hero1';
import Hero2 from '../Hero/Hero2';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const heroes = [

  <Hero1/>,
  <Hero2/>

];

const settings ={
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 6000,
}

const HomeSlider = () => {
  return (
    <div className='slider-container'>
      <Slider {...settings}>
        {heroes.map((hero, index) => (
          <div className="slider" key={index}>
            {hero}
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default HomeSlider