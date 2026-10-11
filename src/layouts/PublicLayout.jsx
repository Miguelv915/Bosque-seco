import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/shared/LanguageSwitcher';
import styles from './PublicLayout.module.css';

const NAV_ITEMS = [
  { hash: 'explorar', labelKey: 'nav.explore' },
  { hash: 'asociaciones', labelKey: 'nav.associations' },
  { hash: 'ecosistema', labelKey: 'nav.ecosystem' },
  { hash: 'comunidades', labelKey: 'nav.communities' },
];

/** Lleva la vista al ancla indicada en la URL (p. ej. `/#explorar`). */
function useScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);
}

export default function PublicLayout() {
  const { t } = useTranslation();
  useScrollToHash();

  return (
    <>
      <header className={styles.nav}>
        <Link to="/#inicio" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            <span className={styles.logoDot} />
          </span>
          <span className={styles.brandName}>
            {t('app.name').toUpperCase()}
            <span className={styles.brandSep}> / </span>
            {t('app.region').toUpperCase()}
          </span>
        </Link>

        <nav className={styles.links} aria-label="Principal">
          {NAV_ITEMS.map(({ hash, labelKey }) => (
            <Link key={hash} to={`/#${hash}`} className={styles.link}>
              {t(labelKey).toUpperCase()}
            </Link>
          ))}
          <Link to="/#visita" className={styles.cta}>
            {t('nav.plan').toUpperCase()} →
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <span>{t('footer.left')}</span>
        <span>{t('footer.right')}</span>
      </footer>
    </>
  );
}
