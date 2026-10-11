import styles from './ImagePlaceholder.module.css';

/**
 * Muestra la imagen cuando hay `src`; de lo contrario un marcador con la
 * descripción de la foto prevista. Ocupa todo el contenedor padre.
 */
export default function ImagePlaceholder({ src, alt = '', label, priority = false }) {
  if (src) {
    return <img className={styles.image} src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} />;
  }
  return (
    <div className={styles.placeholder} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}
