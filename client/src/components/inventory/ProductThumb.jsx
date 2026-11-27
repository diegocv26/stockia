import { thumbUrl } from '../../utils/images.js';

export default function ProductThumb({ url, name, size = 44 }) {
  const style = { width: size, height: size };
  if (!url) {
    return (
      <div className="st-thumb st-thumb-empty" style={style} aria-hidden="true">
        <i className="bi bi-image" />
      </div>
    );
  }
  return <img src={thumbUrl(url, size * 2)} alt={name} className="st-thumb" style={style} loading="lazy" />;
}
