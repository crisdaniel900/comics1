import React, { useState } from 'react'
import './EditUserComponent.css'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const EditUserComponent = ({ user, onUserUpdated }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: user.name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    address: user.address || '',
    role: user.role || 'user',
    password: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast.error('Nombre y email son requeridos')
      return
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden')
        return
      }

      if (formData.password.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres')
        return
      }
    }

    setIsLoading(true)
    try {
      const { confirmPassword, ...payload } = formData
      const { data } = await customFetch.patch(`/users/${user.id}`, payload)
      toast.success('Usuario actualizado correctamente')
      onUserUpdated && onUserUpdated(data.user)
      setTimeout(() => navigate('/admin/all-users'), 1000)
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Error al actualizar el usuario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="edit-user-container">
      <div className="edit-user-form-wrapper">
        <h1>Editar Usuario</h1>
        
        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className="form-section">
            <h2>Información Personal</h2>
            
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre del usuario"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Apellido</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Apellido del usuario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email del usuario"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Dirección</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Dirección del usuario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="role-select"
              >
                <option value="user">Usuario Regular</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Cambiar Contraseña</h2>
            <p className="password-note">Opcional. Si no se llena, la contraseña actual no cambia.</p>

            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nueva contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-save"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/admin/all-users')}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="user-info">
          <h3>Información de Cuenta</h3>
          <p><strong>Usuario:</strong> {user.username}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Registrado:</strong> {new Date(user.created_at).toLocaleDateString('es-ES')}</p>
          <p><strong>Última actualización:</strong> {new Date(user.updated_at).toLocaleDateString('es-ES')}</p>
        </div>
      </div>
    </div>
  )
}

export default EditUserComponent
