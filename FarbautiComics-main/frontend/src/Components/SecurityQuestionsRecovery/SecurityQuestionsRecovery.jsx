import React, { useState, useEffect } from 'react'
import './SecurityQuestionsRecovery.css'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const SecurityQuestionsRecovery = ({ onBack }) => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: preguntas, 3: nueva contraseña
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleStep1Submit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Por favor ingresa tu correo')
      return
    }
    setStep(2)
    // Los ID de preguntas se obtienen del backend, pero primero podríamos mostrar las preguntas
    // Para ahora, simplemente vamos al paso 2
  }

  const handleStep2Submit = async () => {
    // Validar que al menos se contestaron algunas preguntas
    if (Object.keys(answers).length === 0) {
      toast.error('Por favor responde al menos una pregunta')
      return
    }

    setLoading(true)
    try {
      const answersToSubmit = {}
      for (const [qId, answer] of Object.entries(answers)) {
        if (answer && answer.trim()) {
          answersToSubmit[qId] = answer
        }
      }

      const response = await customFetch.post('/security/reset-password-security', {
        email,
        answers: answersToSubmit,
        newPassword,
        confirmPassword: confirmPassword || newPassword
      })

      if (response.data.msg || response.status === 200) {
        toast.success('Contraseña actualizada. Redirigiendo...')
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  // Para este flujo simplificado, mostraremos un formulario donde el usuario puede ingresar respuestas
  // El backend validará contra lo que tiene guardado

  return (
    <div className="security-recovery-container">
      <div className="recovery-card">
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <h2>Recuperación por Preguntas de Seguridad</h2>
            <p>Ingresa tu correo electrónico para proceder</p>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary">
                Siguiente
              </button>
              <button type="button" onClick={onBack} className="btn-secondary">
                ← Atrás
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div>
            <h2>Responde tus Preguntas de Seguridad</h2>
            <p>Para continuar, por favor proporciona tu nueva contraseña</p>
            
            <div className="form-group">
              <label>Tu Correo</label>
              <input type="email" value={email} disabled />
            </div>

            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="info-box">
              <p>💡 Si ingresaste respuestas de seguridad durante tu registro, también debes responderlas para verificar tu identidad. Si no las ingresaste en el registro, simplemente proporciona tu nueva contraseña.</p>
            </div>

            <div className="button-group">
              <button
                onClick={handleStep2Submit}
                disabled={loading || newPassword.length < 8}
                className="btn-primary"
              >
                {loading ? 'Procesando...' : 'Cambiar Contraseña'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="btn-secondary"
              >
                ← Atrás
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SecurityQuestionsRecovery
