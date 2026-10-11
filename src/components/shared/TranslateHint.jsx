import { useTranslation } from 'react-i18next';
import styles from './TranslateHint.module.css';

/**
 * Aviso para quien navega en inglés: el contenido de las asociaciones está en
 * español y se traduce con la opción de traducir del navegador.
 */
export default function TranslateHint() {
  const { t, i18n } = useTranslation();
  if (i18n.resolvedLanguage !== 'en') return null;
  return (
    <p className={styles.hint} role="note" translate="no">
      {t('common.translateHint')}
    </p>
  );
}
