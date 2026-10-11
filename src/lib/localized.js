/**
 * Devuelve `row[<campo>_<idioma>]` con respaldo al español.
 * Ej.: localized(asociacion, 'summary', 'en') → summary_en || summary_es
 */
export function localized(row, field, lang) {
  if (!row) return '';
  const code = lang?.startsWith('en') ? 'en' : 'es';
  return row[`${field}_${code}`] || row[`${field}_es`] || '';
}
