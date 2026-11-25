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

const schema = z
  .object({
    storeName: z.string().trim().min(2, 'El nombre de la tienda es muy corto').max(120, 'El nombre de la tienda es muy largo'),
    name: z.string().trim().min(2, 'Tu nombre es muy corto').max(100, 'Tu nombre es muy largo'),
    email: z.string().trim().min(1, 'Ingresa tu correo').email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export default function Register() {
  const { register: signUp } = useAuth();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const slow = useDelayedFlag(isSubmitting);

  const onSubmit = async ({ storeName, name, email, password }) => {
    setServerError('');
    try {
      await signUp({ storeName, name, email, password });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Crea tu tienda"
      subtitle="Tu cuenta será la del administrador. Después podrás agregar vendedores."
      footer={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
    >
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <Alert variant="danger">{serverError}</Alert>}
        <FormField id="storeName" label="Nombre de la tienda" error={errors.storeName?.message}>
          <Form.Control placeholder="Ej. Bodega La Esquina" isInvalid={!!errors.storeName} {...register('storeName')} />
        </FormField>
        <FormField id="name" label="Tu nombre" error={errors.name?.message}>
          <Form.Control autoComplete="name" isInvalid={!!errors.name} {...register('name')} />
        </FormField>
        <FormField id="email" label="Correo electrónico" error={errors.email?.message}>
          <Form.Control type="email" autoComplete="email" placeholder="tu@correo.com" isInvalid={!!errors.email} {...register('email')} />
        </FormField>
        <FormField id="password" label="Contraseña" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" isInvalid={!!errors.password} {...register('password')} />
        </FormField>
        <FormField id="confirmPassword" label="Confirmar contraseña" error={errors.confirmPassword?.message} className="mb-4">
          <PasswordInput autoComplete="new-password" isInvalid={!!errors.confirmPassword} {...register('confirmPassword')} />
        </FormField>
        <Button type="submit" className="w-100" disabled={isSubmitting}>
          {isSubmitting ? <><Spinner size="sm" className="me-2" />Creando tu tienda…</> : 'Crear cuenta'}
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
