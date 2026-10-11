import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/useAuth';
import styles from '../../features/admin/admin.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/admin" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(false);
    try {
      await signIn(form.get('email'), form.get('password'));
      navigate('/admin', { replace: true });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${styles.card} ${styles.narrow}`} onSubmit={handleSubmit}>
      <h1 className={styles.title}>{t('admin.login')}</h1>
      <label className={styles.field}>
        <span>{t('admin.loginForm.email')}</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label className={styles.field}>
        <span>{t('admin.loginForm.password')}</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {t('admin.loginForm.error')}
        </p>
      )}
      <button type="submit" className={styles.primary} disabled={busy}>
        {t('admin.loginForm.submit')}
      </button>
    </form>
  );
}
