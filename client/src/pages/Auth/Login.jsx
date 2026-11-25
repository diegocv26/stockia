import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FormField from '../../components/FormField.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDelayedFlag } from '../../hooks/useDelayedFlag.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { getErrorMessage } from '../../utils/errors.js';

const schema = z.object({
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export default function Login() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const slow = useDelayedFlag(isSubmitting);

  // Al iniciar sesión, PublicOnlyRoute redirige solo al panel
  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para entrar a tu panel."
      footer={<>¿Aún no tienes cuenta? <Link to="/registro">Crea tu tienda</Link></>}
    >
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <Alert variant="danger">{serverError}</Alert>}
        <FormField id="email" label="Correo electrónico" error={errors.email?.message}>
          <Form.Control type="email" autoComplete="email" placeholder="tu@correo.com" isInvalid={!!errors.email} {...register('email')} />
        </FormField>
        <FormField id="password" label="Contraseña" error={errors.password?.message} className="mb-4">
          <PasswordInput autoComplete="current-password" isInvalid={!!errors.password} {...register('password')} />
        </FormField>
        <Button type="submit" className="w-100" disabled={isSubmitting}>
          {isSubmitting ? <><Spinner size="sm" className="me-2" />Ingresando…</> : 'Iniciar sesión'}
        </Button>
        {slow && (
          <p className="small text-body-secondary text-center mt-3 mb-0">
            El servidor gratuito se está despertando. Puede tardar hasta un minuto…
          </p>
        )}
      </Form>
    </AuthLayout>
  );
}
