import React, { useState } from 'react'
import './EditUserComponent.css'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const EditUserComponent = ({ user, onUserUpdated }) => {
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    address: user.address || '',
    role: user.role || 'user',
  })

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    if (!profileData.name || !profileData.email) {
      toast.error('Nombre y email son requeridos')
      return
    }

    setIsSavingProfile(true)
    try {
      const payload = {}

      if (profileData.name !== user.name) payload.name = profileData.name
      if ((profileData.last_name || '') !== (user.last_name || '')) payload.last_name = profileData.last_name
      if (profileData.email !== user.email) payload.email = profileData.email
      if ((profileData.address || '') !== (user.address || '')) payload.address = profileData.address
      if (profileData.role !== user.role) payload.role = profileData.role

      const hasChanges = Object.keys(payload).length > 0
      if (!hasChanges) {
        toast.info('No hay cambios para guardar')
        return
      }

      const { data } = await customFetch.patch(`/users/${user.id}`, payload)
      toast.success('Usuario actualizado correctamente')
      onUserUpdated && onUserUpdated(data.user)
      setTimeout(() => navigate('/admin/all-users'), 1000)
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
        error?.response?.data?.msg ||
        'Error al actualizar el usuario'
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!passwordData.password || !passwordData.confirmPassword) {
      toast.error('Completa ambas contraseñas')
      return
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsSavingPassword(true)
    try {
      const { data } = await customFetch.patch(`/users/${user.id}`, {
        password: passwordData.password,
      })
      toast.success(data?.msg || 'Contraseña actualizada correctamente')
      setPasswordData({ password: '', confirmPassword: '' })
      onUserUpdated && onUserUpdated(data.user)
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
        error?.response?.data?.msg ||
        'Error al actualizar la contraseña'
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="edit-user-container">
      <div className="edit-user-form-wrapper">
        <h1>Editar Usuario</h1>
        
        <form onSubmit={handleProfileSubmit} className="edit-user-form">
          <div className="form-section">
            <h2>Información Personal</h2>
            
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
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
                value={profileData.last_name}
                onChange={handleProfileChange}
                placeholder="Apellido del usuario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
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
                value={profileData.address}
                onChange={handleProfileChange}
                placeholder="Dirección del usuario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select
                id="role"
                name="role"
                value={profileData.role}
                onChange={handleProfileChange}
                className="role-select"
              >
                <option value="user">Usuario Regular</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-save"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/admin/all-users')}
              disabled={isSavingProfile || isSavingPassword}
            >
              Cancelar
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="edit-user-form edit-user-form--password">
          <div className="form-section">
            <h2>Cambiar Contraseña</h2>
            <p className="password-note">Opcional. Si no se llena, la contraseña actual no cambia.</p>

            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                placeholder="Nueva contraseña"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-save"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? 'Guardando...' : 'Actualizar Contraseña'}
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/admin/all-users')}
              disabled={isSavingProfile || isSavingPassword}
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
