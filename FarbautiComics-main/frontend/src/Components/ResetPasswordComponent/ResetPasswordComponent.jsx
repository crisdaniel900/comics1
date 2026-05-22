import React from 'react';
import { Form, useNavigation, useSearchParams } from 'react-router-dom';
import './ResetPasswordComponent.css';
import customFetch from '../../Utils/customFetch';
import { toast } from 'react-toastify';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  if (data.password !== data.confirmPassword) {
    toast.error('Las contraseñas no coinciden');
    return null;
  }

  delete data.confirmPassword;

  try {
    const { data: response } = await customFetch.post('/auth/reset-password', data);
    toast.success(response?.msg || 'Contraseña actualizada');
    window.location.href = '/login';
    return null;
  } catch (error) {
    toast.error(error?.response?.data?.msg || 'No se pudo cambiar la contraseña');
    return error;
  }
};

const ResetPasswordComponent = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <div className="reset-password">
      <div className="reset-password-background">
        <Form method="post" className="reset-password-container">
          <h1>Nueva contraseña</h1>
          <input type="hidden" name="token" value={token} />
          <input name="password" type="password" placeholder="Nueva contraseña" required />
          <input name="confirmPassword" type="password" placeholder="Confirmar contraseña" required />
          <button type="submit" disabled={isSubmitting || !token}>
            {isSubmitting ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordComponent;