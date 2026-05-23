import React, { useState } from 'react'
import './RecoveryCodeInput.css'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const RecoveryCodeInput = ({ onBack }) => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: código, 3: nueva contraseña
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleStep1Submit = (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Por favor ingresa tu correo')
      return
    }
    setStep(2)
  }

  const handleStep2Submit = (e) => {
    e.preventDefault()
    if (!code) {
      toast.error('Por favor ingresa tu código de recuperación')
      return
    }
    setStep(3)
  }

  const handleStep3Submit = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      await customFetch.post('/security/reset-password-recovery-code', {
        email,
        code: code.toUpperCase(),
        newPassword,
        confirmPassword
      })

      toast.success('Contraseña actualizada. Redirigiendo...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recovery-code-container">
      <div className="recovery-card">
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <h2>Recuperación con Código</h2>
            <p>Ingresa el correo asociado a tu cuenta</p>
            
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary">
                Siguiente →
              </button>
              <button type="button" onClick={onBack} className="btn-secondary">
                ← Atrás
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit}>
            <h2>Ingresa tu Código de Recuperación</h2>
            <p>Usa uno de los códigos que recibiste durante el registro</p>
            
            <div className="form-group">
              <label>Tu Correo</label>
              <input type="email" value={email} disabled />
            </div>

            <div className="form-group">
              <label>Código de Recuperación</label>
              <input
                type="text"
                placeholder="Ej: A1B2C3D4"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength="8"
                required
              />
              <small>Ingresa el código en mayúsculas (8 caracteres)</small>
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary">
                Siguiente →
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                ← Atrás
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3Submit}>
            <h2>Nueva Contraseña</h2>
            <p>Crea una nueva contraseña para tu cuenta</p>
            
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Procesando...' : 'Cambiar Contraseña'}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="btn-secondary"
              >
                ← Atrás
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default RecoveryCodeInput
