import styles from './SectionHeader.module.css';

/** Cabecera de sección: etiqueta mono + título (dos líneas) + texto de apoyo opcional. */
export default function SectionHeader({ id, eyebrow, titleA, titleB, lead }) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={id} className={styles.title}>
          {titleA}
          <br />
          {titleB && <span className={styles.muted}>{titleB}</span>}
        </h2>
      </div>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  );
}
