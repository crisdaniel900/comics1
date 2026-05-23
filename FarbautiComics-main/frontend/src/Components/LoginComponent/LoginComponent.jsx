import React from 'react'
import './LoginComponent.css'
import { Link, Form, useNavigation } from 'react-router-dom'
import customFetch from '../../Utils/customFetch'
import { toast } from "react-toastify";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post("/auth/login", data);
    toast.success("Login successful");
    window.location.href = '/';  // ← recarga completa en lugar de redirect
    return null;
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};


const LoginComponent = () => {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  return (
    <div className="loginsignup">
        <div className="loginsignup-background">
            <Form method = 'post' className="loginsignup-container">
                <h1>Bienvenido de Vuelta!</h1>
                <div className="loginsignup-fields">
                    <input name='email' type="email" placeholder='Correo Electronico' />
                </div>
                <div className="loginsignup-password">
                 <input name='password' type="password" placeholder='Contraseña' />
                </div>
                <button type='submit' disabled= {isSubmitting}>
                    {isSubmitting ? 'Iniciando Sesion...' : 'Iniciar Sesion'}
                </button>
                <p className="loginsignup-login">
                  <Link to='/forgot-password-options'>Olvidé mi contraseña</Link>
                </p>
                <p className="loginsignup-login">Aun no tienes una cuenta? <Link to='/register'>Registrate aqui</Link></p>
            </Form>
        </div>
        
    </div>
  )
}

export { LoginComponent }
export default LoginComponent
