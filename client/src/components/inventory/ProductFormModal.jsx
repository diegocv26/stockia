import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import FormField from '../FormField.jsx';
import { productsApi } from '../../api/products.js';
import { getErrorMessage } from '../../utils/errors.js';
import { thumbUrl } from '../../utils/images.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Los inputs son texto: validamos como string y convertimos al enviar (acepta "1,5" y "1.5").
const decimal = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .regex(/^\d{1,10}([.,]\d{1,2})?$/, `${label} debe ser un número válido (máx. 2 decimales)`);

const integer = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .regex(/^\d{1,9}$/, `${label} debe ser un número entero`);

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(120, 'Máximo 120 caracteres'),
  sku: z.string().trim().max(50, 'Máximo 50 caracteres'),
  categoryId: z.string(),
  description: z.string().trim().max(1000, 'Máximo 1000 caracteres'),
  priceUsd: decimal('El precio'),
  costUsd: decimal('El costo'),
  stock: integer('El stock'),
  minStock: integer('El stock mínimo'),
});

const toDecimal = (s) => s.trim().replace(',', '.');

function buildFormData(v, { isEdit, file, removeImage }) {
  const fd = new FormData();
  fd.append('name', v.name);
  fd.append('sku', v.sku); // '' -> el servidor lo guarda como NULL
  fd.append('description', v.description);
  fd.append('categoryId', v.categoryId);
  fd.append('priceUsd', toDecimal(v.priceUsd));
  fd.append('costUsd', toDecimal(v.costUsd));
  fd.append('minStock', v.minStock);
  if (!isEdit) fd.append('stock', v.stock); // el stock solo se fija al crear
  if (file) fd.append('image', file);
  else if (isEdit && removeImage) fd.append('removeImage', 'true');
  return fd;
}

export default function ProductFormModal({ show, product, categories, onHide }) {
  const isEdit = Boolean(product);
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku ?? '',
          categoryId: product.categoryId ? String(product.categoryId) : '',
          description: product.description ?? '',
          priceUsd: String(product.priceUsd),
          costUsd: String(product.costUsd ?? 0),
          stock: String(product.stock),
          minStock: String(product.minStock),
        }
      : { name: '', sku: '', categoryId: '', description: '', priceUsd: '', costUsd: '0', stock: '0', minStock: '5' },
  });

  // Libera la URL temporal de la vista previa al cambiarla o desmontar
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const mutation = useMutation({
    mutationFn: (formData) => (isEdit ? productsApi.update(product.id, formData) : productsApi.create(formData)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado');
      onHide();
    },
    onError: (err) => {
      const apiError = err.response?.data?.error;
      if (apiError?.code === 'DUPLICATE') {
        setError('sku', { type: 'server', message: apiError.message });
        return;
      }
      toast.error(getErrorMessage(err));
    },
  });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) return toast.error('La imagen debe ser JPG, PNG o WebP');
    if (f.size > MAX_IMAGE_BYTES) return toast.error('La imagen no puede pesar más de 5 MB');
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoveImage(false);
  };

  const clearImage = () => {
    if (file) {
      setFile(null);
      setPreview(null);
    } else if (product?.imageUrl) {
      setRemoveImage(true);
    }
  };

  const currentImage = file ? preview : !removeImage && product?.imageUrl ? thumbUrl(product.imageUrl, 400) : null;
  const busy = mutation.isPending;

  const onSubmit = handleSubmit((values) => mutation.mutate(buildFormData(values, { isEdit, file, removeImage })));
  const cls = (name) => `form-control${errors[name] ? ' is-invalid' : ''}`;

  return (
    <Modal show={show} onHide={busy ? undefined : onHide} size="lg" centered backdrop="static">
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton={!busy}>
          <Modal.Title as="h5">{isEdit ? 'Editar producto' : 'Nuevo producto'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-4">
            {/* Imagen */}
            <Col md={4}>
              <div className="ratio ratio-1x1 rounded border overflow-hidden bg-body-tertiary mb-2">
                {currentImage ? (
                  <img src={currentImage} alt="Vista previa" className="object-fit-cover" />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center text-body-secondary">
                    <i className="bi bi-image fs-1" />
                    <small>Sin imagen</small>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept={ALLOWED_TYPES.join(',')} hidden onChange={handleFile} />
              <div className="d-grid gap-2">
                <Button size="sm" variant="outline-primary" onClick={() => fileRef.current?.click()} disabled={busy}>
                  <i className="bi bi-upload me-1" />
                  {currentImage ? 'Cambiar imagen' : 'Subir imagen'}
                </Button>
                {currentImage && (
                  <Button size="sm" variant="outline-danger" onClick={clearImage} disabled={busy}>
                    Quitar imagen
                  </Button>
                )}
                {removeImage && !file && (
                  <Button size="sm" variant="outline-secondary" onClick={() => setRemoveImage(false)} disabled={busy}>
                    Deshacer
                  </Button>
                )}
              </div>
              <div className="form-text">JPG, PNG o WebP · máx. 5 MB</div>
            </Col>

            {/* Datos */}
            <Col md={8}>
              <Row className="g-3">
                <Col xs={12}>
                  <FormField className="mb-0" id="pf-name" label="Nombre" error={errors.name?.message}>
                    <input id="pf-name" className={cls('name')} autoFocus {...register('name')} />
                  </FormField>
                </Col>

                <Col sm={6}>
                  <FormField className="mb-0" id="pf-sku" label="SKU / código (opcional)" error={errors.sku?.message}>
                    <input id="pf-sku" className={cls('sku')} {...register('sku')} />
                  </FormField>
                </Col>
                <Col sm={6}>
                  <FormField className="mb-0" id="pf-category" label="Categoría" error={errors.categoryId?.message}>
                    <select id="pf-category" className="form-select" {...register('categoryId')}>
                      <option value="">Sin categoría</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </Col>

                <Col xs={12}>
                  <FormField className="mb-0" id="pf-desc" label="Descripción (opcional)" error={errors.description?.message}>
                    <textarea id="pf-desc" rows={2} className={cls('description')} {...register('description')} />
                  </FormField>
                </Col>

                <Col sm={6}>
                  <FormField className="mb-0" id="pf-price" label="Precio (USD)" error={errors.priceUsd?.message}>
                    <input id="pf-price" inputMode="decimal" placeholder="0.00" className={cls('priceUsd')} {...register('priceUsd')} />
                  </FormField>
                </Col>
                <Col sm={6}>
                  <FormField className="mb-0" id="pf-cost" label="Costo (USD)" error={errors.costUsd?.message}>
                    <input id="pf-cost" inputMode="decimal" placeholder="0.00" className={cls('costUsd')} {...register('costUsd')} />
                  </FormField>
                </Col>

                {/* Espacio reservado para la vista previa en Bs (fase 3) */}
                <Col xs={12}>
                  <div className="form-text mt-0" data-slot="bs-preview">
                    Equivalente en Bs: <span className="text-body-secondary">disponible con la tasa del día</span>
                  </div>
                </Col>

                <Col sm={6}>
                  {isEdit ? (
                    <>
                      <label className="form-label">Stock actual</label>
                      <input className="form-control" value={product.stock} disabled readOnly />
                      <div className="form-text">Cámbialo con «Ajustar stock» para dejar registro.</div>
                    </>
                  ) : (
                    <FormField className="mb-0" id="pf-stock" label="Stock inicial" error={errors.stock?.message}>
                      <input id="pf-stock" inputMode="numeric" className={cls('stock')} {...register('stock')} />
                    </FormField>
                  )}
                </Col>
                <Col sm={6}>
                  <FormField className="mb-0" id="pf-min" label="Stock mínimo (alerta)" error={errors.minStock?.message}>
                    <input id="pf-min" inputMode="numeric" className={cls('minStock')} {...register('minStock')} />
                  </FormField>
                </Col>
              </Row>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy && <Spinner size="sm" className="me-2" />}
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
