import { Form } from 'react-bootstrap';

// Etiqueta + control + mensaje de error. "id" enlaza la etiqueta con el input.
export default function FormField({ id, label, error, children, className = 'mb-3' }) {
  return (
    <Form.Group controlId={id} className={className}>
      <Form.Label>{label}</Form.Label>
      {children}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Form.Group>
  );
}
