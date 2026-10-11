import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, MessageCircle, Smartphone, X } from 'lucide-react';
import LanguageSwitcher from '../components/shared/LanguageSwitcher';
import { buttonClass } from '../components/shared/buttonClass';
import ChatWidget from '../features/chatbot/components/ChatWidget';
import logo from '../assets/images/logo-ecorumbo.png';
import { AIDER_URL, APP_URL, WHATSAPP_URL } from '../lib/contact';
import styles from './PublicLayout.module.css';

const YEAR = new Date().getFullYear();

// Mismo orden que el recorrido de la portada. `to` es una ruta propia (NavLink
// marca la página actual) o un ancla de la portada; `sections` son las secciones
// que resaltan ese enlace mientras se desplaza.
const NAV_ITEMS = [
  { to: '/lugares', labelKey: 'nav.destinations' },
  { to: '/rutas', labelKey: 'nav.routes' },
  { to: '/#ecosistema', labelKey: 'nav.ecosystem', sections: ['ecosistema', 'comunidades'] },
  { to: '/#asociaciones', labelKey: 'nav.associations', sections: ['asociaciones'] },
  { to: '/#antes-de-ir', labelKey: 'nav.beforeYouGo', sections: ['visita', 'antes-de-ir'] },
];

// El pie suma las comunidades, que en el menú comparten el enlace del ecosistema.
const FOOTER_ITEMS = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  { to: '/#comunidades', labelKey: 'nav.communities' },
  NAV_ITEMS[3],
  NAV_ITEMS[4],
];

const SECTION_IDS = NAV_ITEMS.flatMap((item) => item.sections ?? []);

/** Lleva la vista al ancla indicada en la URL (p. ej. `/#explorar`); sin ancla, arriba. */
function useScrollToHash() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (!hash) {
      // «instant»: al cambiar de página no se anima un viaje hasta arriba.
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    document.getElementById(hash.slice(1))?.scrollIntoView();
    // `key` cambia en cada navegación: repetir el mismo ancla vuelve a desplazar.
  }, [pathname, hash, key]);
}

/** Id de la sección de la portada que cruza la parte alta de la pantalla; null fuera de ella. */
function useActiveSection(enabled) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          // Al salir de la franja se limpia solo si seguía siendo la activa.
          if (isIntersecting) setActive(target.id);
          else setActive((current) => (current === target.id ? null : current));
        });
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [enabled]);
  return enabled ? active : null;
}

/** Enlace a la app: la tienda si está configurada; si no, la sección que la presenta. */
function AppLink({ className, children }) {
  return APP_URL ? (
    <a href={APP_URL} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link to="/#app" className={className}>
      {children}
    </Link>
  );
}

function NavItem({ to, children, className, onClick, current = false }) {
  const isRoute = !to.includes('#');
  return isRoute ? (
    <NavLink to={to} className={className} onClick={onClick}>
      {children}
    </NavLink>
  ) : (
    <Link
      to={to}
      className={className}
      onClick={onClick}
      aria-current={current ? 'location' : undefined}
    >
      {children}
    </Link>
  );
}

export default function PublicLayout() {
  const { t } = useTranslation();
  const { pathname, hash } = useLocation();
  // El menú recuerda en qué URL se abrió: al navegar queda cerrado solo.
  const here = pathname + hash;
  const [openAt, setOpenAt] = useState(null);
  const menuOpen = openAt === here;
  const closeMenu = () => setOpenAt(null);
  useScrollToHash();
  const activeSection = useActiveSection(pathname === '/');
  const isCurrent = (item) => Boolean(item.sections?.includes(activeSection));

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpenAt(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <a href="#contenido" className={styles.skip}>
        {t('nav.skip')}
      </a>

      <header className={styles.nav}>
        <Link to="/#inicio" className={styles.brand} aria-label={t('app.name')}>
          <img src={logo} alt="" className={styles.logo} />
        </Link>

        <nav className={styles.links} aria-label={t('nav.label')}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} to={item.to} className={styles.link} current={isCurrent(item)}>
              {t(item.labelKey)}
            </NavItem>
          ))}
        </nav>

        <div className={styles.tools}>
          <AppLink className={`${buttonClass('primary')} ${styles.appCta}`}>
            <Smartphone size={16} aria-hidden="true" />
            {t('nav.app')}
          </AppLink>
          <LanguageSwitcher />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
            onClick={() => setOpenAt(menuOpen ? null : here)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>

        <nav
          id="menu-movil"
          className={styles.mobileMenu}
          data-open={menuOpen}
          aria-label={t('nav.label')}
          hidden={!menuOpen}
        >
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              className={styles.mobileLink}
              onClick={closeMenu}
              current={isCurrent(item)}
            >
              {t(item.labelKey)}
            </NavItem>
          ))}
          <AppLink className={buttonClass('primary', { size: 'lg', block: true })}>
            <Smartphone size={18} aria-hidden="true" />
            {t('nav.app')}
          </AppLink>
        </nav>
      </header>

      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <p className={styles.footerName}>{t('app.name')}</p>
            <p className={styles.footerText}>{t('footer.tagline')}</p>
            <p className={styles.footerMotto}>{t('footer.motto')}</p>
          </div>

          <div>
            <h2 className={styles.footerHeading}>{t('footer.explore')}</h2>
            <ul className={styles.footerList}>
              {FOOTER_ITEMS.map(({ to, labelKey }) => (
                <li key={to}>
                  <Link to={to} className={styles.footerLink}>
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={styles.footerHeading}>{t('footer.contact')}</h2>
            <ul className={styles.footerList}>
              <li>
                {WHATSAPP_URL ? (
                  <a href={WHATSAPP_URL} className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={16} aria-hidden="true" />
                    {t('footer.whatsapp')}
                  </a>
                ) : (
                  <Link to="/#asociaciones" className={styles.footerLink}>
                    <MessageCircle size={16} aria-hidden="true" />
                    {t('footer.contactGuides')}
                  </Link>
                )}
              </li>
              <li>
                <a href={AIDER_URL} className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                  {t('footer.aider')}
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.footerApp}>
            <h2 className={styles.footerHeading}>{t('footer.appTitle')}</h2>
            <p className={styles.footerText}>{t('footer.appText')}</p>
            <AppLink className={buttonClass('primary', { size: 'lg' })}>
              <Smartphone size={18} aria-hidden="true" />
              {t('nav.app')}
            </AppLink>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>{t('footer.rights', { year: YEAR })}</span>
          <span>{t('footer.photos')}</span>
        </div>
      </footer>

      <ChatWidget />
    </>
  );
}
