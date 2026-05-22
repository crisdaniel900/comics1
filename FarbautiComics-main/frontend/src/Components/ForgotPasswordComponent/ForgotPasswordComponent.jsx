import React from 'react';
import { Form, useNavigation } from 'react-router-dom';
import './ForgotPasswordComponent.css';
import customFetch from '../../Utils/customFetch';
import { toast } from 'react-toastify';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const { data: response } = await customFetch.post('/auth/request-password-reset', data);
    toast.success(response?.msg || 'Revisa tu correo');
    return null;
  } catch (error) {
    toast.error(error?.response?.data?.msg || 'No se pudo enviar el correo');
    return error;
  }
};

const ForgotPasswordComponent = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="forgot-password">
      <div className="forgot-password-background">
        <Form method="post" className="forgot-password-container">
          <h1>Recuperar contraseña</h1>
          <p>Te enviaremos un enlace al correo asociado a tu cuenta.</p>
          <input name="email" type="email" placeholder="Correo electrónico" required />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordComponent;