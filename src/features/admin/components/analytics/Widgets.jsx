import styles from '../../admin.module.css';

/** Cifra destacada con su etiqueta. */
export function Stat({ label, value, hint }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

export function StatGrid({ children }) {
  return <div className={styles.statGrid}>{children}</div>;
}

/** Barras horizontales: una fila por elemento, proporcional al mayor valor. */
export function BarList({ title, rows, empty }) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <section className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {rows.length === 0 ? (
        <p className={styles.hint}>{empty}</p>
      ) : (
        <ul className={styles.bars}>
          {rows.map((row) => (
            <li key={row.label}>
              <span className={styles.barLabel}>{row.label}</span>
              <span className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: `${(row.value / max) * 100}%` }} />
              </span>
              <span className={styles.barValue}>{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
