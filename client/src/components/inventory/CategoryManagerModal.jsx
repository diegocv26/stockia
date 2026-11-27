import { useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { categoriesApi } from '../../api/categories.js';
import { getErrorMessage } from '../../utils/errors.js';

export default function CategoryManagerModal({ show, categories, onHide, onDeleted }) {
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['categories'] });
    qc.invalidateQueries({ queryKey: ['products'] }); // cambian nombres/categorías mostradas
  };
  const onError = (err) => toast.error(getErrorMessage(err));

  const createMut = useMutation({
    mutationFn: (name) => categoriesApi.create({ name }),
    onSuccess: () => {
      setNewName('');
      refresh();
      toast.success('Categoría creada');
    },
    onError,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, name }) => categoriesApi.update(id, { name }),
    onSuccess: () => {
      setEditingId(null);
      refresh();
      toast.success('Categoría actualizada');
    },
    onError,
  });

  const removeMut = useMutation({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: (_, id) => {
      setConfirmId(null);
      onDeleted?.(id);
      refresh();
      toast.success('Categoría eliminada');
    },
    onError,
  });

  const submitNew = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (name) createMut.mutate(name);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    const name = editName.trim();
    if (name) updateMut.mutate({ id: editingId, name });
  };

  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title as="h5">Categorías</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={submitNew} className="input-group mb-3">
          <input
            className="form-control"
            placeholder="Nueva categoría…"
            maxLength={60}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit" variant="primary" disabled={createMut.isPending || !newName.trim()}>
            {createMut.isPending ? <Spinner size="sm" /> : <i className="bi bi-plus-lg" />}
          </Button>
        </form>

        {categories.length === 0 && <p className="text-body-secondary text-center my-4">Aún no hay categorías.</p>}

        <ul className="list-group">
          {categories.map((c) => (
            <li key={c.id} className="list-group-item">
              {editingId === c.id ? (
                <form onSubmit={submitEdit} className="input-group input-group-sm">
                  <input
                    className="form-control"
                    maxLength={60}
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Button type="submit" variant="primary" disabled={updateMut.isPending}>
                    <i className="bi bi-check-lg" />
                  </Button>
                  <Button variant="outline-secondary" onClick={() => setEditingId(null)}>
                    <i className="bi bi-x-lg" />
                  </Button>
                </form>
              ) : confirmId === c.id ? (
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <small className="text-danger">
                    {c.productCount > 0
                      ? `Los ${c.productCount} productos quedarán sin categoría. ¿Eliminar?`
                      : '¿Eliminar esta categoría?'}
                  </small>
                  <div className="d-inline-flex gap-1">
                    <Button size="sm" variant="danger" disabled={removeMut.isPending} onClick={() => removeMut.mutate(c.id)}>
                      Sí
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => setConfirmId(null)}>
                      No
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="text-truncate">
                    {c.name} <span className="badge text-bg-secondary ms-1">{c.productCount}</span>
                  </span>
                  <div className="d-inline-flex gap-1">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      aria-label="Renombrar"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditName(c.name);
                        setConfirmId(null);
                      }}
                    >
                      <i className="bi bi-pencil" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      aria-label="Eliminar"
                      onClick={() => {
                        setConfirmId(c.id);
                        setEditingId(null);
                      }}
                    >
                      <i className="bi bi-trash" />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
}
