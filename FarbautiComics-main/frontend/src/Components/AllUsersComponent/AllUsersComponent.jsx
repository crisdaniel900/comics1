import React, { useState } from 'react'
import './AllUsersComponent.css'
import { Link, redirect, useLoaderData, useRevalidator } from 'react-router-dom'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'

export const loader = async () => {
  try {
    const { data } = await customFetch.get('/users');
    return data.users;
  } catch (error) {
    console.log(error)
    return redirect('/');
  }
}

const AllUsersComponent = () => {
  const { revalidate } = useRevalidator()
  const [searchTerm, setSearchTerm] = useState('')

  const all_users = useLoaderData();
  const filtered_users = all_users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await customFetch.delete(`/users/${userId}`)
        toast.success('Usuario eliminado')
        revalidate()
      } catch (error) {
        toast.error(error?.response?.data?.msg || 'Error al eliminar')
      }
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES')
  }

  return (
    <div className="list-users">
      <h1>Gestión de Usuarios</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="listusers-format-main">
        <p>Usuario</p>
        <p>Nombre</p>
        <p>Email</p>
        <p>Rol</p>
        <p>Fecha de Registro</p>
        <p>Acciones</p>
      </div>

      <div className="listusers-allusers">
        <hr />
        {filtered_users.map((user, index) => (
          <React.Fragment key={index}>
            <div className="listusers-format-main listusers-format">
              <p>{user.username}</p>
              <p>{user.name} {user.last_name || ''}</p>
              <p>{user.email}</p>
              <p className={`role-badge role-${user.role}`}>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
              <p>{formatDate(user.created_at)}</p>
              <div className="listusers-actions">
                <Link to={`/admin/edit-user/${user.id}`}>
                  <button className="edit-btn">Editar</button>
                </Link>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(user.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>

      {filtered_users.length === 0 && (
        <div className="no-users">
          <p>No se encontraron usuarios</p>
        </div>
      )}
    </div>
  )
}

export default AllUsersComponent
