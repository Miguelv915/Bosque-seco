import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localized } from '../../lib/localized';
import { useAsync } from '../../lib/useAsync';
import { getAssociationBySlug } from '../../services/associations.service';
import ActivityList from '../../features/associations/components/ActivityList';
import GuideContact from '../../features/associations/components/GuideContact';
import PaymentMethods from '../../features/associations/components/PaymentMethods';
import styles from './PublicPage.module.css';

export default function AssociationPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const { data: association, error, loading } = useAsync(() => getAssociationBySlug(slug), [slug]);

  if (loading) return <p className={styles.page}>{t('common.loading')}</p>;
  if (error) return <p className={styles.page}>{t('common.error')}</p>;
  if (!association) return <p className={styles.page}>{t('associations.notFound')}</p>;

  const spaces = [...association.spaces].sort((a, b) => a.sort_order - b.sort_order);
  const generalOffer = association.activities.filter((a) => a.is_active && !a.subspace_id);

  return (
    <article className={styles.page}>
      <Link to="/#asociaciones" className={styles.back}>
        ← {t('common.back')}
      </Link>

      <header className={styles.header}>
        {association.acronym && <p className={styles.kicker}>{association.acronym}</p>}
        <h1 className={styles.title}>{association.name}</h1>
        <p className={styles.badge}>
          {t('associations.endorsed', { by: association.endorsed_by, association: association.acronym || association.name })}
        </p>
        <p className={styles.summary}>{localized(association, 'summary', lang)}</p>
      </header>

      {association.description_es && (
        <p className={styles.description}>{localized(association, 'description', lang)}</p>
      )}

      <section className={styles.block}>
        <h2 className={styles.heading}>{t('associations.spaces')}</h2>
        {spaces.length === 0 ? (
          <p className={styles.muted}>{t('associations.noSpaces')}</p>
        ) : (
          <ul className={styles.list}>
            {spaces.map((space) => (
              <li key={space.id}>
                <Link to={`/espacios/${space.id}`} className={styles.item}>
                  <h3>{space.name}</h3>
                  <p className={styles.meta}>{space.departments.join(' · ')}</p>
                  <p>{localized(space, 'description', lang)}</p>
                  <span className={styles.more}>{t('associations.viewSpace').toUpperCase()} →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ActivityList
        activities={generalOffer}
        title={t('associations.generalOffer')}
      />
      <GuideContact guides={association.providers.filter((p) => p.is_active)} />
      <PaymentMethods methods={association.payment_methods.filter((m) => m.is_active)} />
    </article>
  );
}
