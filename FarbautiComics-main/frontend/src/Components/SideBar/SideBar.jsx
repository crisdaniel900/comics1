import React from 'react'
import './SideBar.css'
import { Link, redirect } from 'react-router-dom'
import plus_icon from '../../assets/plus_icon.png'
import list_icon from '../../assets/list.png'
import { BarChart2, Users } from 'lucide-react'
import customFetch from '../../Utils/customFetch'

export const loader = async () => {
  try {
    const { data } = await customFetch.get('/users/admin/app-stats');
    return data;
  } catch (error) {
    console.log(error)
    return redirect('/');
  }
}

const SideBar = () => {
  return (
    <div className="sidebar">
      <Link to={'/admin/add-product'} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={plus_icon} alt="" />
          <p>Añadir Producto</p>
        </div>
      </Link>
      <Link to={'/admin/all-products'} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={list_icon} alt="" />
          <p>Lista de Productos</p>
        </div>
      </Link>
      <Link to={'/admin/all-users'} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <Users size={30} color="white" />
          <p>Gestionar Usuarios</p>
        </div>
      </Link>
      <Link to={'/admin/sales-report'} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <BarChart2 size={30} color="white" />
          <p>Reporte de Ventas</p>
        </div>
      </Link>
    </div>
  )
}

export default SideBar
