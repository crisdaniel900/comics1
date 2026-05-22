import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../Components/SideBar/SideBar'

const AdminPage = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar/>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet/>
      </div>
    </div>
  )
}

export default AdminPage