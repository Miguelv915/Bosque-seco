import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  ClipboardList,
  Gift,
  HandHelping,
  Image,
  LayoutDashboard,
  MapPinned,
  Route,
  Trees,
} from 'lucide-react';
import styles from '../admin.module.css';

const ICONS = {
  summary: LayoutDashboard,
  association: Trees,
  spaces: MapPinned,
  providers: HandHelping,
  routes: Route,
  rewards: Gift,
  gallery: Image,
  analytics: BarChart3,
  requests: ClipboardList,
  review: ClipboardList,
};

/** Navegación lateral del backoffice: recibe la lista de secciones a mostrar. */
export default function SectionNav({ sections, current, onChange, badge }) {
  const { t } = useTranslation();

  return (
    <nav className={styles.sectionNav} aria-label={t('admin.nav.label')}>
      {sections.map((section) => {
        const Icon = ICONS[section];
        return (
          <button
            key={section}
            type="button"
            className={styles.sectionTab}
            aria-current={current === section ? 'page' : undefined}
            onClick={() => onChange(section)}
          >
            <Icon size={18} aria-hidden="true" />
            <span className={styles.tabLabel}>{t(`admin.nav.${section}`)}</span>
            {badge?.section === section && badge.count > 0 && (
              <span className={styles.count}>{badge.count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
