import { forwardRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

// forwardRef para que react-hook-form (register) pueda enganchar el input
const PasswordInput = forwardRef(function PasswordInput({ isInvalid, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup>
      <Form.Control ref={ref} type={visible ? 'text' : 'password'} isInvalid={isInvalid} {...props} />
      <Button
        variant="outline-secondary"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        tabIndex={-1}
      >
        <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} />
      </Button>
    </InputGroup>
  );
});

export default PasswordInput;
