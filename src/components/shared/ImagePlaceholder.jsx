import { useState } from 'react';
import { Leaf } from 'lucide-react';
import styles from './ImagePlaceholder.module.css';

/**
 * Muestra la imagen cuando hay `src`; de lo contrario (o si la imagen no carga)
 * un marcador con la descripción de la foto prevista. Ocupa todo el contenedor
 * padre. `credit` muestra autor y licencia de fotos externas.
 */
export default function ImagePlaceholder({ src, alt = '', label, credit, priority = false }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (src && failedSrc !== src) {
    return (
      <>
        <img
          className={styles.image}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
        {credit && <small className={styles.credit}>{credit}</small>}
      </>
    );
  }
  return (
    <div className={styles.placeholder} role="img" aria-label={label}>
      <Leaf size={28} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
