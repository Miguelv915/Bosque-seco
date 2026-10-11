import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/shared/LanguageSwitcher';
import { useAuth } from '../features/auth/useAuth';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { session, profile, signOut } = useAuth();

  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          {t('app.name').toUpperCase()} · {t('admin.title').toUpperCase()}
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
    </>
  );
}
