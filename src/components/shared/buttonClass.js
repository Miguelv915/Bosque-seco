import styles from './Button.module.css';

/**
 * Clases del botón compartido para aplicarlas a `<a>`, `<Link>` o `<button>`.
 * Variantes: primary · secondary · onDark · dark. Tamaño: `lg`. `block` = ancho completo.
 */
export function buttonClass(variant = 'primary', { size, block = false } = {}) {
  return [styles.button, styles[variant], size === 'lg' && styles.lg, block && styles.block]
    .filter(Boolean)
    .join(' ');
}
