import React, { useState, useEffect } from 'react'
import './RegisterComponent.css'
import { Form, redirect, useNavigation, Link, useNavigate } from 'react-router-dom'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'

export const action = async ({request}) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    try {
        await customFetch.post('/auth/register', data)
        // No redirigir aún, el componente maneja el resto del flujo
        return null
    } catch (error) {
        toast.error(error?.response?.data?.msg)
        return error
    }
}

const RegisterComponent = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: datos básicos, 2: preguntas seguridad, 3: códigos recuperación
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        address: ''
    })
    const [questions, setQuestions] = useState([])
    const [selectedQuestions, setSelectedQuestions] = useState({})
    const [answers, setAnswers] = useState({})
    const [recoveryCodes, setRecoveryCodes] = useState([])

    // Obtener preguntas de seguridad cuando se llega al paso 2
    useEffect(() => {
        if (step === 2) {
            fetchSecurityQuestions()
        }
    }, [step])

    const fetchSecurityQuestions = async () => {
        try {
            const { data } = await customFetch.get('/security/security-questions')
            setQuestions(data.questions)
        } catch (error) {
            toast.error('Error cargando preguntas de seguridad')
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleStep1Submit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }

        if (formData.password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres')
            return
        }

        setLoading(true)
        try {
            const { confirmPassword, ...dataToRegister } = formData
            await customFetch.post('/auth/register', dataToRegister)
            toast.success('Datos básicos registrados')
            setStep(2)
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error en el registro')
        } finally {
            setLoading(false)
        }
    }

    const handleQuestionSelect = (questionId) => {
        setSelectedQuestions(prev => {
            const isSelected = !!prev[questionId]

            if (isSelected) {
                const copy = { ...prev }
                delete copy[questionId]
                return copy
            }

            const selectedCount = Object.keys(prev).length
            if (selectedCount >= 3) {
                toast.error('Solo puedes seleccionar 3 preguntas')
                return prev
            }

            return { ...prev, [questionId]: true }
        })
    }

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }))
    }

    const handleStep2Submit = async () => {
        const selectedQuestionIds = Object.keys(selectedQuestions).map(Number)
        if (selectedQuestionIds.length !== 3) {
            toast.error('Debes seleccionar exactamente 3 preguntas')
            return
        }

        // Validar que todas las preguntas tengan respuesta
        for (const qId of selectedQuestionIds) {
            if (!answers[qId] || !answers[qId].trim()) {
                toast.error('Todas las preguntas deben tener respuesta')
                return
            }
        }

        setLoading(true)
        try {
            // Guardar respuestas de seguridad
            const answersToSave = selectedQuestionIds.reduce((acc, qId) => {
                acc[qId] = answers[qId]
                return acc
            }, {})

            await customFetch.post('/security/setup-security-answers', { email: formData.email, answers: answersToSave })
            
            // Generar códigos de recuperación
            const { data } = await customFetch.post('/security/generate-recovery-codes', { email: formData.email })
            setRecoveryCodes(data.codes)
            toast.success('Preguntas de seguridad configuradas')
            setStep(3)
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error configurando preguntas de seguridad')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadCodes = () => {
        const text = `Códigos de Recuperación\n${new Date().toLocaleString()}\n\n${recoveryCodes.join('\n')}\n\nGuarda estos códigos en un lugar seguro. Cada código puede usarse una sola vez para recuperar tu contraseña.`
        const element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
        element.setAttribute('download', 'recovery-codes.txt')
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const handleStep3Complete = () => {
        toast.success('¡Registro completado con éxito!')
        navigate('/login')
    }

    return (
        <div className="signup">
            <div className="signup-background">
                {step === 1 && (
                    <form className="signup-container" onSubmit={handleStep1Submit}>
                        <h1>Registro - Paso 1: Datos Básicos</h1>
                        <div className="signup-fields">
                            <input
                                name='name'
                                type="text"
                                placeholder='Nombre'
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                name='lastName'
                                type="text"
                                placeholder='Apellidos'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="signup-fields">
                            <input
                                name='username'
                                type="text"
                                placeholder='Nombre de usuario'
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                name='email'
                                type="email"
                                placeholder='Correo electrónico'
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="signup-fields">
                            <input
                                name='password'
                                type="password"
                                placeholder='Contraseña (mín. 8 caracteres)'
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                name='confirmPassword'
                                type="password"
                                placeholder='Confirmar contraseña'
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="signup-large-field">
                            <input
                                name='address'
                                type="text"
                                placeholder='Dirección'
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <button type='submit' disabled={loading}>
                            {loading ? 'Registrando...' : 'Siguiente'}
                        </button>
                        <p className="signup-login">¿Ya tienes cuenta? <Link to='/login'>Inicia sesión aquí</Link></p>
                    </form>
                )}

                {step === 2 && (
                    <div className="signup-container">
                        <h1>Paso 2: Preguntas de Seguridad</h1>
                        <p className="step-description">Selecciona 3 preguntas de seguridad para recuperar tu contraseña</p>
                        <p className="selected-counter">Seleccionadas: {Object.keys(selectedQuestions).length}/3</p>
                        
                        <div className="questions-container">
                            {questions.map(q => (
                                <div key={q.id} className="question-item">
                                    <input
                                        type="checkbox"
                                        id={`q-${q.id}`}
                                        checked={selectedQuestions[q.id] || false}
                                        onChange={() => handleQuestionSelect(q.id)}
                                    />
                                    <label htmlFor={`q-${q.id}`}>{q.question}</label>
                                    
                                    {selectedQuestions[q.id] && (
                                        <input
                                            type="text"
                                            placeholder="Tu respuesta"
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="answer-input"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="step-buttons">
                            <button onClick={() => setStep(1)} disabled={loading} className="btn-secondary">
                                Atrás
                            </button>
                            <button onClick={handleStep2Submit} disabled={loading} className="btn-primary">
                                {loading ? 'Configurando...' : 'Siguiente'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="signup-container">
                        <h1>Paso 3: Códigos de Recuperación</h1>
                        <p className="step-description">Guarda estos códigos en un lugar seguro. Cada código puede usarse una sola vez para recuperar tu contraseña.</p>
                        
                        <div className="recovery-codes-box">
                            {recoveryCodes.map((code, idx) => (
                                <div key={idx} className="code-item">{code}</div>
                            ))}
                        </div>

                        <div className="step-buttons">
                            <button onClick={handleDownloadCodes} className="btn-secondary">
                                📥 Descargar Códigos
                            </button>
                            <button onClick={handleStep3Complete} className="btn-primary">
                                ✓ Completar Registro
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RegisterComponent