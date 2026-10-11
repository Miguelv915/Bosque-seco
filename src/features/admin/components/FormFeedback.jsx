import { useTranslation } from 'react-i18next';
import { copy } from '../lib/copy';
import styles from '../admin.module.css';

/** Mensaje de resultado de un envío (`ok`, `error` o `tooLarge`). */
export default function FormFeedback({ result }) {
  const { t } = useTranslation();
  if (!result) return null;
  if (result === 'ok') {
    return <p className={styles.ok} role="status">{t(copy('admin.sent'))}</p>;
  }
  const key = result === 'tooLarge' ? 'admin.imageForm.tooLarge' : 'admin.sendError';
  return <p className={styles.error} role="alert">{t(key)}</p>;
}
