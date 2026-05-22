import React from 'react'
import './RegisterComponent.css'
import { Form, redirect, useNavigation, Link} from 'react-router-dom'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'

export const action = async ({request}) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    try {
        await customFetch.post('/auth/register', data)
        toast.success('Registration Succesful')
        return redirect('/login')

        
    } catch (error) {
        toast.error(error?.response?.data?.msg)
        return error
        
    }

}


const RegisterComponent = () => {

    const navigation = useNavigation()
    console.log(navigation);
    const isSubmitting = navigation.state === 'submitting'
  return (
    <div className="signup">
        <div className="signup-background">
            <Form method='post' className="signup-container">
                <h1>Registro</h1>
                <div className="signup-fields">
                    <input name='name' type="text" placeholder='Nombre' required />
                    <input name='lastName' type="text" placeholder='Apellidos' required />
                </div>
                <div className="signup-fields">
                    <input name='username' type="text" placeholder='Nombre de usuario' required />
                    <input name='password' type="password" placeholder='Contraseña' required />
                </div>
                <div className="signup-large-field">
                    <input name='email' type="email" placeholder= 'Correo electronico' required />
                </div>
                <div className="signup-large-field">
                    <input name='address' type="text" placeholder= 'Direccion' required />
                </div>

                <button type='submit' disabled= {isSubmitting}>
                    {isSubmitting ? 'Registrandote...' : ' Registrarte'}
                </button>
                <p className="signup-login">Ya tienes una cuenta? <Link to='/login'>Inicia sesion aqui</Link></p>
            </Form>
        </div>
        
    </div>
  )
}

export default RegisterComponent