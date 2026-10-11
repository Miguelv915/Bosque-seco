/** Texto en español de un campo `<campo>_es` (null seguro). */
export function esText(row, field) {
  return row?.[`${field}_es`] ?? '';
}
