import React, { useState } from 'react'
import './ChangePasswordComponent.css'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'

const ChangePasswordComponent = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.currentPassword) {
      toast.error('Por favor ingresa tu contraseña actual')
      return
    }

    if (!formData.newPassword) {
      toast.error('Por favor ingresa una nueva contraseña')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual')
      return
    }

    setLoading(true)
    try {
      await customFetch.post('/security/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })

      toast.success('Contraseña actualizada correctamente')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>Cambiar Contraseña</h2>
        <p>Actualiza tu contraseña para mantener tu cuenta segura</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Contraseña Actual</label>
            <div className="password-input-group">
              <input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                placeholder="Ingresa tu contraseña actual"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('current')}
                className="toggle-password"
              >
                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <div className="password-input-group">
              <input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                placeholder="Ingresa tu nueva contraseña (mín. 8 caracteres)"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="toggle-password"
              >
                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.newPassword && (
              <span className={`password-length ${formData.newPassword.length >= 8 ? 'valid' : 'invalid'}`}>
                {formData.newPassword.length}/8 caracteres
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="password-input-group">
              <input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Repite tu nueva contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="toggle-password"
              >
                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {formData.newPassword && formData.confirmPassword && (
            <div className={`match-indicator ${formData.newPassword === formData.confirmPassword ? 'match' : 'nomatch'}`}>
              {formData.newPassword === formData.confirmPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>

        <div className="security-tips">
          <h4>💡 Consejos de Seguridad:</h4>
          <ul>
            <li>Usa una contraseña única que no utilices en otras plataformas</li>
            <li>Incluye mayúsculas, minúsculas, números y caracteres especiales</li>
            <li>No compartas tu contraseña con nadie</li>
            <li>Cambia tu contraseña regularmente</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordComponent
