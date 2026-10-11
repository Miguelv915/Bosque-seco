import { useTranslation } from 'react-i18next';
import styles from '../admin.module.css';

const SECTIONS = [
  'summary',
  'association',
  'spaces',
  'providers',
  'routes',
  'rewards',
  'gallery',
  'requests',
];

/** Navegación por secciones del panel del líder. */
export default function SectionNav({ current, onChange, pendingCount }) {
  const { t } = useTranslation();

  return (
    <nav className={styles.sectionNav} aria-label={t('admin.nav.label')}>
      {SECTIONS.map((section) => (
        <button
          key={section}
          type="button"
          className={styles.sectionTab}
          aria-current={current === section ? 'page' : undefined}
          onClick={() => onChange(section)}
        >
          {t(`admin.nav.${section}`)}
          {section === 'requests' && pendingCount > 0 && (
            <span className={styles.count}>{pendingCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
