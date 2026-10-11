import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Gift,
  HandHelping,
  Image,
  LayoutDashboard,
  MapPinned,
  Route,
  Trees,
} from 'lucide-react';
import { features } from '../../../config/features';
import styles from '../admin.module.css';

const ALL_SECTIONS = [
  ['summary', LayoutDashboard],
  ['association', Trees],
  ['spaces', MapPinned],
  ['providers', HandHelping],
  ['routes', Route],
  ['rewards', Gift],
  ['gallery', Image],
  ['requests', ClipboardList],
];

const SECTIONS = ALL_SECTIONS.filter(
  ([section]) => features.routes || (section !== 'routes' && section !== 'rewards'),
);

/** Navegación por secciones del panel del líder. */
export default function SectionNav({ current, onChange, pendingCount }) {
  const { t } = useTranslation();

  return (
    <nav className={styles.sectionNav} aria-label={t('admin.nav.label')}>
      {SECTIONS.map(([section, Icon]) => (
        <button
          key={section}
          type="button"
          className={styles.sectionTab}
          aria-current={current === section ? 'page' : undefined}
          onClick={() => onChange(section)}
        >
          <Icon size={18} aria-hidden="true" />
          <span className={styles.tabLabel}>{t(`admin.nav.${section}`)}</span>
          {section === 'requests' && pendingCount > 0 && (
            <span className={styles.count}>{pendingCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
