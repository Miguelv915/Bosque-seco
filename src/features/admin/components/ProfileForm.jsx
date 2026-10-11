import { useTranslation } from 'react-i18next';
import { createRequest } from '../../../services/changeRequests.service';
import { filledFields } from '../lib/formData';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import FormFeedback from './FormFeedback';
import styles from '../admin.module.css';

const FIELDS = ['summary_es', 'summary_en', 'description_es', 'description_en', 'acronym', 'region'];

export default function ProfileForm({ associationId, onSent }) {
  const { t } = useTranslation();
  const { busy, result, run } = useSubmitRequest();

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = filledFields(new FormData(form), FIELDS);
    if (Object.keys(payload).length === 0) return;

    const ok = await run(() =>
      createRequest({ associationId, entityType: 'association', action: 'update', payload }),
    );
    if (ok) {
      form.reset();
      onSent();
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2 className={styles.cardTitle}>{t('admin.profileForm.title')}</h2>
      <p className={styles.hint}>{t('admin.optionalHint')}</p>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{t('admin.profileForm.acronym')}</span>
          <input name="acronym" />
        </label>
        <label className={styles.field}>
          <span>{t('admin.profileForm.region')}</span>
          <input name="region" />
        </label>
      </div>
      <label className={styles.field}>
        <span>{t('admin.profileForm.summaryEs')}</span>
        <textarea name="summary_es" rows={2} />
      </label>
      <label className={styles.field}>
        <span>{t('admin.profileForm.summaryEn')}</span>
        <textarea name="summary_en" rows={2} />
      </label>
      <label className={styles.field}>
        <span>{t('admin.profileForm.descriptionEs')}</span>
        <textarea name="description_es" rows={4} />
      </label>
      <label className={styles.field}>
        <span>{t('admin.profileForm.descriptionEn')}</span>
        <textarea name="description_en" rows={4} />
      </label>
      <FormFeedback result={result} />
      <button type="submit" className={styles.primary} disabled={busy}>
        {t('admin.profileForm.submit')}
      </button>
    </form>
  );
}
