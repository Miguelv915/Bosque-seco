import styles from '../admin.module.css';

/** Bloque "ya registrado": título con contador y, si no hay nada, un texto vacío. */
export function Registered({ title, count, empty, children }) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <span className={styles.counter}>{count}</span>
      </header>
      {count === 0 ? <p className={styles.hint}>{empty}</p> : children}
    </section>
  );
}

/** Rejilla de tarjetas. */
export function CardGrid({ children }) {
  return <ul className={styles.cardGrid}>{children}</ul>;
}

/** Tarjeta de un elemento registrado. */
export function ItemCard({ title, subtitle, tags = [], children }) {
  return (
    <li className={styles.itemCard}>
      <strong className={styles.itemTitle}>{title}</strong>
      {subtitle && <span className={styles.hint}>{subtitle}</span>}
      {children}
      {tags.length > 0 && (
        <span className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag.label} className={styles.tag} data-tone={tag.tone}>
              {tag.label}
            </span>
          ))}
        </span>
      )}
    </li>
  );
}

/** Tabla con desplazamiento horizontal en pantallas angostas. */
export function DataTable({ columns, rows, rowKey }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
