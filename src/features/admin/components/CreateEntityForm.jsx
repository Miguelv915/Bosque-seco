import { useTranslation } from 'react-i18next';
import { createRequest } from '../../../services/changeRequests.service';
import { collectPayload } from '../lib/formData';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import FormFeedback from './FormFeedback';
import styles from '../admin.module.css';

function Field({ field, t }) {
  const { name, type = 'text', labelKey, required, options = [], emptyOption } = field;
  const label = t(labelKey);

  if (type === 'checkboxes') {
    return (
      <fieldset className={styles.fieldset}>
        <legend>{label}</legend>
        {options.map((option) => (
          <label key={option.value} className={styles.check}>
            <input type="checkbox" name={name} value={option.value} />
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <label className={styles.field}>
      <span>{label}</span>
      {type === 'textarea' || type === 'lines' ? (
        <textarea name={name} rows={3} required={required} />
      ) : type === 'select' ? (
        <select name={name} required={required}>
          {emptyOption && <option value="">{t('admin.fields.none')}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type === 'number' ? 'number' : 'text'}
          min={type === 'number' ? 0 : undefined}
          step={type === 'number' ? 'any' : undefined}
          required={required}
        />
      )}
    </label>
  );
}

/**
 * Formulario genérico que envía una solicitud `create` del líder.
 * `fields` describe los campos; `normalize` ajusta el payload antes de enviar.
 */
export default function CreateEntityForm({
  associationId,
  entityType,
  title,
  fields,
  onSent,
  normalize = (payload) => payload,
}) {
  const { t } = useTranslation();
  const { busy, result, run } = useSubmitRequest();

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = normalize(collectPayload(new FormData(form), fields));

    const ok = await run(() =>
      createRequest({ associationId, entityType, action: 'create', payload }),
    );
    if (ok) {
      form.reset();
      onSent();
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <div className={styles.row}>
        {fields.map((field) => (
          <Field key={field.name} field={field} t={t} />
        ))}
      </div>
      <FormFeedback result={result} />
      <button type="submit" className={styles.primary} disabled={busy}>
        {t('admin.sections.submit')}
      </button>
    </form>
  );
}
