import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Components/Navbar/Navbar'
import Footer from '../Components/Footer/Footer'

const HomePage = () => {
  return (
    <>
      <Navbar/>
      <Outlet/>
      <Footer />
    </>
  )
}

export default HomePage