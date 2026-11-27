import { Pagination } from 'react-bootstrap';

export default function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const items = [];
  for (let n = start; n <= end; n++) {
    items.push(
      <Pagination.Item key={n} active={n === page} onClick={() => onChange(n)}>
        {n}
      </Pagination.Item>
    );
  }

  return (
    <Pagination size="sm" className="justify-content-center mb-0">
      <Pagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} />
      {start > 1 && (
        <>
          <Pagination.Item onClick={() => onChange(1)}>1</Pagination.Item>
          {start > 2 && <Pagination.Ellipsis disabled />}
        </>
      )}
      {items}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <Pagination.Ellipsis disabled />}
          <Pagination.Item onClick={() => onChange(totalPages)}>{totalPages}</Pagination.Item>
        </>
      )}
      <Pagination.Next disabled={page === totalPages} onClick={() => onChange(page + 1)} />
    </Pagination>
  );
}
