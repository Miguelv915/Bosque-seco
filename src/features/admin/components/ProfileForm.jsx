import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createRequest } from '../../../services/changeRequests.service';
import { filledFields } from '../lib/formData';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import { isValidPhone, normalizePhone } from '../lib/validation';
import FormFeedback from './FormFeedback';
import { copy } from '../lib/copy';
import styles from '../admin.module.css';

const FIELDS = ['summary_es', 'description_es', 'region', 'contact_whatsapp'];

export default function ProfileForm({ associationId, onSent }) {
  const { t } = useTranslation();
  const { busy, result, run } = useSubmitRequest();
  const [phoneError, setPhoneError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = filledFields(new FormData(form), FIELDS);
    if (Object.keys(payload).length === 0) return;

    if (payload.contact_whatsapp) {
      if (!isValidPhone(payload.contact_whatsapp)) {
        setPhoneError(true);
        return;
      }
      payload.contact_whatsapp = normalizePhone(payload.contact_whatsapp);
    }
    setPhoneError(false);

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
      <label className={styles.field}>
        <span>{t('admin.profileForm.region')}</span>
        <input name="region" />
      </label>
      <label className={styles.field}>
        <span>{t('admin.profileForm.summary')}</span>
        <textarea name="summary_es" rows={2} />
      </label>
      <label className={styles.field}>
        <span>{t('admin.profileForm.description')}</span>
        <textarea name="description_es" rows={4} />
      </label>
      <label className={styles.field}>
        <span>{t('admin.profileForm.contactWhatsapp')}</span>
        <input
          name="contact_whatsapp"
          type="tel"
          inputMode="tel"
          aria-invalid={phoneError}
          aria-describedby="contact-whatsapp-hint"
        />
        <small id="contact-whatsapp-hint" className={styles.fieldHint}>
          {t('admin.profileForm.contactWhatsappHint')}
        </small>
        {phoneError && <small className={styles.fieldError}>{t('admin.errors.phone')}</small>}
      </label>
      <FormFeedback result={result} />
      <button type="submit" className={styles.primary} disabled={busy}>
        {t(copy('admin.profileForm.submit'))}
      </button>
    </form>
  );
}
