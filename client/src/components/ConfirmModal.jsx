import { Modal, Button, Spinner } from 'react-bootstrap';

export default function ConfirmModal({
  show,
  title,
  children,
  confirmLabel = 'Confirmar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onHide,
}) {
  return (
    <Modal show={show} onHide={loading ? undefined : onHide} centered>
      <Modal.Header closeButton={!loading}>
        <Modal.Title as="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading && <Spinner size="sm" className="me-2" />}
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
