import { Modal, Button, Spinner } from 'react-bootstrap';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import FormField from '../FormField.jsx';
import { productsApi } from '../../api/products.js';
import { getErrorMessage } from '../../utils/errors.js';

const schema = z.object({
  quantity: z
    .string()
    .trim()
    .regex(/^[+-]?\d{1,7}$/, 'Escribe un número entero (ej. 10 o -3)')
    .refine((v) => Number(v) !== 0, 'La cantidad no puede ser 0'),
  note: z.string().trim().min(1, 'Indica el motivo del ajuste').max(200, 'Máximo 200 caracteres'),
});

const QUICK_REASONS = ['Reposición', 'Conteo físico', 'Merma', 'Producto dañado o vencido'];

export default function AdjustStockModal({ show, product, onHide }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { quantity: '', note: '' } });

  const mutation = useMutation({
    mutationFn: (v) => productsApi.adjustStock(product.id, { quantity: Number(v.quantity), note: v.note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Stock actualizado');
      onHide();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const raw = useWatch({ control, name: 'quantity' }) ?? '';
  const valid = /^[+-]?\d{1,7}$/.test(raw.trim()) && Number(raw) !== 0;
  const newStock = valid ? product.stock + Number(raw) : null;
  const busy = mutation.isPending;

  return (
    <Modal show={show} onHide={busy ? undefined : onHide} centered>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Modal.Header closeButton={!busy}>
          <Modal.Title as="h5">Ajustar stock</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-grid gap-3">
          <div>
            <div className="fw-semibold">{product?.name}</div>
            <div className="text-body-secondary small">Stock actual: {product?.stock}</div>
          </div>

          <FormField className="mb-0" id="as-qty" label="Cantidad (positiva suma, negativa resta)" error={errors.quantity?.message}>
            <input
              id="as-qty"
              inputMode="numeric"
              placeholder="Ej. 10 o -3"
              autoFocus
              className={`form-control${errors.quantity ? ' is-invalid' : ''}`}
              {...register('quantity')}
            />
          </FormField>

          {valid && (
            <div className={newStock < 0 ? 'text-danger small' : 'text-body-secondary small'}>
              {newStock < 0 ? 'El stock no puede quedar negativo.' : `Quedará en ${newStock} unidades.`}
            </div>
          )}

          <FormField className="mb-0" id="as-note" label="Motivo" error={errors.note?.message}>
            <input id="as-note" className={`form-control${errors.note ? ' is-invalid' : ''}`} {...register('note')} />
          </FormField>

          <div className="d-flex flex-wrap gap-2">
            {QUICK_REASONS.map((r) => (
              <Button key={r} size="sm" variant="outline-secondary" className="rounded-pill" onClick={() => setValue('note', r, { shouldValidate: true })}>
                {r}
              </Button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={busy || (valid && newStock < 0)}>
            {busy && <Spinner size="sm" className="me-2" />}
            Aplicar ajuste
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
