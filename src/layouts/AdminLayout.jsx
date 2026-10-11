import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/shared/LanguageSwitcher';
import logo from '../assets/images/logo-ecorumbo.png';
import { useAuth } from '../features/auth/useAuth';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { session, profile, signOut } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <img src={logo} alt={t('app.name')} className={styles.logo} />
          <span>{t('admin.title').toUpperCase()}</span>
        </Link>
        <div className={styles.actions}>
          {profile && <span className={styles.user}>{profile.full_name || session?.user?.email}</span>}
          <LanguageSwitcher />
          {session && (
            <button type="button" className={styles.signOut} onClick={signOut}>
              {t('admin.signOut')}
            </button>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
