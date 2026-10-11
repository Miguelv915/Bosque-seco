import ImagePlaceholder from './ImagePlaceholder';
import styles from './PageHero.module.css';

/** Cabecera de página con foto de fondo, título y contenido opcional (chips o botones). */
export default function PageHero({ image, imageAlt, eyebrow, title, lead, children }) {
  return (
    <header className={styles.hero}>
      <div className={styles.media}>
        <ImagePlaceholder src={image} alt={imageAlt} label={imageAlt} priority />
      </div>
      <div className={styles.fade} />
      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children && <div className={styles.extra}>{children}</div>}
      </div>
    </header>
  );
}
