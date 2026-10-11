import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localized } from '../../lib/localized';
import { useAsync } from '../../lib/useAsync';
import { getSubspaceById } from '../../services/associations.service';
import ActivityList from '../../features/associations/components/ActivityList';
import GuideContact from '../../features/associations/components/GuideContact';
import MediaGallery from '../../features/associations/components/MediaGallery';
import PaymentMethods from '../../features/associations/components/PaymentMethods';
import styles from './PublicPage.module.css';

export default function SubspacePage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const { data, error, loading } = useAsync(() => getSubspaceById(id), [id]);

  if (loading) return <p className={styles.page}>{t('common.loading')}</p>;
  if (error) return <p className={styles.page}>{t('common.error')}</p>;
  if (!data) return <p className={styles.page}>{t('associations.notFound')}</p>;

  const { subspace, association } = data;
  const attractions = (lang?.startsWith('en') && subspace.attractions_en.length
    ? subspace.attractions_en
    : subspace.attractions_es);

  // Guías asignados al sector; si no hay, se ofrecen los de toda la asociación.
  const assigned = subspace.subspace_providers.map((link) => link.providers).filter(Boolean);
  const guides = (assigned.some((p) => p.kind === 'guide') ? assigned : association.providers)
    .filter((p) => p.is_active);

  return (
    <article className={styles.page}>
      <Link to={`/espacios/${subspace.space_id}`} className={styles.back}>
        ← {subspace.spaces.name}
      </Link>

      <header className={styles.header}>
        <p className={styles.kicker}>{subspace.spaces.departments.join(' · ')}</p>
        <h1 className={styles.title}>{subspace.name}</h1>
        <p className={styles.badge}>
          {t('associations.endorsed', {
            by: association.endorsed_by,
            association: association.acronym || association.name,
          })}
        </p>
        <p className={styles.summary}>{localized(subspace, 'description', lang)}</p>
      </header>

      {attractions.length > 0 && (
        <section className={styles.block}>
          <h2 className={styles.heading}>{t('associations.attractions')}</h2>
          <ul className={styles.tags}>
            {attractions.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>
      )}

      <ActivityList activities={subspace.activities.filter((a) => a.is_active)} />
      <GuideContact guides={guides} />
      <PaymentMethods methods={association.payment_methods.filter((m) => m.is_active)} />
      <MediaGallery media={subspace.media} fallbackAlt={subspace.name} />
    </article>
  );
}
