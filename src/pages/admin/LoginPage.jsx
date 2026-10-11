import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import BrandMark from '../../components/shared/BrandMark';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import { useAuth } from '../../features/auth/useAuth';
import loginImage from '../../assets/images/login-bosque.jpg';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className={styles.screen}>
      <aside className={styles.brand} style={{ backgroundImage: `url(${loginImage})` }}>
        <div className={styles.brandContent}>
          <BrandMark className={styles.mark} />
          <p className={styles.brandName}>{t('admin.loginPage.brand')}</p>
          <p className={styles.tagline}>{t('admin.loginPage.tagline')}</p>
        </div>
      </aside>

      <main className={styles.panel}>
        <div className={styles.topBar}>
          <Link to="/" className={styles.back}>
            ← {t('admin.loginPage.back')}
          </Link>
          <LanguageSwitcher />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>{t('admin.loginPage.welcome')}</h1>
          <p className={styles.subtitle}>{t('admin.loginPage.subtitle')}</p>

          <label className={styles.field}>
            <span>{t('admin.loginForm.email')}</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>{t('admin.loginForm.password')}</span>
            <div className={styles.passwordRow}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
                aria-label={t(
                  showPassword ? 'admin.loginPage.hidePassword' : 'admin.loginPage.showPassword',
                )}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {t('admin.loginForm.error')}
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={busy}>
            {busy ? t('admin.loginPage.signingIn') : t('admin.loginForm.submit')}
          </button>

          <p className={styles.note}>{t('admin.loginPage.noAccount')}</p>
        </form>
      </main>
    </div>
  );
}
