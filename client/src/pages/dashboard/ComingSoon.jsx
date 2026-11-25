import { Card } from 'react-bootstrap';
import PageHeader from '../../components/PageHeader.jsx';

export default function ComingSoon({ title, icon, phase }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <Card.Body className="text-center py-5">
          <div className="st-icon-box st-icon-primary mx-auto mb-3"><i className={`bi ${icon}`} /></div>
          <h2 className="h5">Próximamente</h2>
          <p className="text-body-secondary mb-0">Este módulo se construye en la fase {phase} del plan.</p>
        </Card.Body>
      </Card>
    </>
  );
}
