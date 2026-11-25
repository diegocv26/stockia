import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { usersApi } from '../../api/users.js';
import FormField from '../../components/FormField.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getErrorMessage } from '../../utils/errors.js';
import { formatDate, ROLE_LABELS } from '../../utils/format.js';

const createSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto').max(100, 'El nombre es muy largo'),
  email: z.string().trim().min(1, 'Ingresa el correo').email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
  role: z.enum(['admin', 'seller']),
});
const EMPTY = { name: '', email: '', password: '', role: 'seller' };

function NewUserModal({ show, onHide }) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(createSchema), defaultValues: EMPTY });

  const handleClose = () => {
    reset(EMPTY);
    setServerError('');
    onHide();
  };

  const mutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado');
      handleClose();
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5">Nuevo usuario</Modal.Title>
      </Modal.Header>
      <Form
        noValidate
        onSubmit={handleSubmit((values) => {
          setServerError('');
          mutation.mutate(values);
        })}
      >
        <Modal.Body>
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          <FormField id="u-name" label="Nombre" error={errors.name?.message}>
            <Form.Control isInvalid={!!errors.name} {...register('name')} />
          </FormField>
          <FormField id="u-email" label="Correo electrónico" error={errors.email?.message}>
            <Form.Control type="email" isInvalid={!!errors.email} {...register('email')} />
          </FormField>
          <FormField id="u-password" label="Contraseña inicial" error={errors.password?.message}>
            <PasswordInput autoComplete="new-password" isInvalid={!!errors.password} {...register('password')} />
          </FormField>
          <FormField id="u-role" label="Rol" className="mb-0">
            <Form.Select {...register('role')}>
              <option value="seller">Vendedor</option>
              <option value="admin">Administrador</option>
            </Form.Select>
          </FormField>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <><Spinner size="sm" className="me-2" />Creando…</> : 'Crear usuario'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);

  const { data: users, isPending, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const updateMutation = useMutation({
    mutationFn: usersApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="Administra quién puede entrar a tu tienda y con qué permisos."
        actions={<Button onClick={() => setShowNew(true)}><i className="bi bi-person-plus me-2" />Nuevo usuario</Button>}
      />

      {isPending && <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>}

      {isError && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{getErrorMessage(error)}</span>
          <Button size="sm" variant="outline-danger" onClick={() => refetch()}>Reintentar</Button>
        </Alert>
      )}

      {users && (
        <Card>
          <div className="table-responsive">
            <Table hover className="st-table align-middle mb-0">
              <thead>
                <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Activo</th><th>Creado</th></tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === me.id;
                  return (
                    <tr key={u.id}>
                      <td className="fw-semibold">
                        {u.name} {isSelf && <Badge bg="primary" className="ms-1">Tú</Badge>}
                      </td>
                      <td>{u.email}</td>
                      <td style={{ minWidth: '10rem' }}>
                        <Form.Select
                          size="sm"
                          value={u.role}
                          disabled={isSelf || updateMutation.isPending}
                          onChange={(e) => updateMutation.mutate({ id: u.id, role: e.target.value })}
                          aria-label={`Rol de ${u.name}`}
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Check
                          type="switch"
                          checked={u.isActive}
                          disabled={isSelf || updateMutation.isPending}
                          onChange={(e) => updateMutation.mutate({ id: u.id, isActive: e.target.checked })}
                          aria-label={`Activar o desactivar a ${u.name}`}
                        />
                      </td>
                      <td className="text-body-secondary">{formatDate(u.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      <NewUserModal show={showNew} onHide={() => setShowNew(false)} />
    </>
  );
}
