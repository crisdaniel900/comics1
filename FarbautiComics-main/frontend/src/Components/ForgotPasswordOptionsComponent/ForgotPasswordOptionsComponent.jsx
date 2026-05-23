import React, { useState } from 'react'
import './ForgotPasswordOptionsComponent.css'
import { Link } from 'react-router-dom'
import SecurityQuestionsRecovery from '../SecurityQuestionsRecovery/SecurityQuestionsRecovery'
import RecoveryCodeInput from '../RecoveryCodeInput/RecoveryCodeInput'

const ForgotPasswordOptionsComponent = () => {
  const [selectedMethod, setSelectedMethod] = useState(null)

  const handleBackToOptions = () => {
    setSelectedMethod(null)
  }

  return (
    <div className="forgot-password-options">
      <div className="forgot-password-background">
        {!selectedMethod ? (
          <div className="options-container">
            <h1>Recuperar Contraseña</h1>
            <p className="options-subtitle">Elige cómo deseas recuperar tu contraseña</p>

            <div className="options-grid">
              <button
                className="option-card security-questions-card"
                onClick={() => setSelectedMethod('security')}
              >
                <div className="option-icon">❓</div>
                <h3>Preguntas de Seguridad</h3>
                <p>Responde tus preguntas de seguridad personalizadas</p>
              </button>

              <button
                className="option-card recovery-code-card"
                onClick={() => setSelectedMethod('recovery-code')}
              >
                <div className="option-icon">🔐</div>
                <h3>Código de Recuperación</h3>
                <p>Usa uno de tus códigos de recuperación</p>
              </button>
            </div>

            <p className="back-to-login">
              ¿Recuerdas tu contraseña? <Link to='/login'>Inicia sesión aquí</Link>
            </p>
          </div>
        ) : selectedMethod === 'security' ? (
          <SecurityQuestionsRecovery onBack={handleBackToOptions} />
        ) : selectedMethod === 'recovery-code' ? (
          <RecoveryCodeInput onBack={handleBackToOptions} />
        ) : null}
      </div>
    </div>
  )
}

export default ForgotPasswordOptionsComponent
