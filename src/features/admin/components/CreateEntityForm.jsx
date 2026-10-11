import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createRequest } from '../../../services/changeRequests.service';
import { collectPayload } from '../lib/formData';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import FormFeedback from './FormFeedback';
import styles from '../admin.module.css';

function Field({ field, t, error }) {
  const {
    name,
    type = 'text',
    labelKey,
    required,
    options = [],
    emptyOption,
    hint,
    min,
    max,
    step,
  } = field;
  const label = t(labelKey);
  const describedBy = hint || error ? `${name}-help` : undefined;

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

  let control;
  if (type === 'textarea' || type === 'lines') {
    control = <textarea name={name} rows={3} required={required} aria-describedby={describedBy} />;
  } else if (type === 'select') {
    control = (
      <select name={name} required={required} aria-describedby={describedBy}>
        {emptyOption && <option value="">{t('admin.fields.none')}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else {
    control = (
      <input
        name={name}
        type={type === 'number' ? 'number' : type === 'tel' ? 'tel' : 'text'}
        inputMode={type === 'tel' ? 'tel' : undefined}
        min={min}
        max={max}
        step={type === 'number' ? (step ?? 'any') : undefined}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
    );
  }

  return (
    <label className={styles.field}>
      <span>
        {label}
        {required && <abbr title={t('admin.required')}> *</abbr>}
      </span>
      {control}
      {(hint || error) && (
        <small id={`${name}-help`} className={error ? styles.fieldError : styles.fieldHint}>
          {error ? t(error) : t(hint)}
        </small>
      )}
    </label>
  );
}

/**
 * Formulario genérico que envía una solicitud `create` del líder.
 * Cada campo puede traer `validate(valor) → clave de error | null` y
 * `transform(valor)` para normalizar lo que se envía.
 */
export default function CreateEntityForm({
  associationId,
  entityType,
  title,
  description,
  fields,
  onSent,
}) {
  const { t } = useTranslation();
  const { busy, result, run } = useSubmitRequest();
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = collectPayload(new FormData(form), fields);

    const nextErrors = {};
    const payload = {};
    for (const field of fields) {
      const value = raw[field.name];
      if (value === undefined) continue;
      const errorKey = field.validate?.(value);
      if (errorKey) {
        nextErrors[field.name] = errorKey;
        continue;
      }
      payload[field.name] = field.transform ? field.transform(value) : value;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
      <h3 className={styles.cardTitle}>{title}</h3>
      {description && <p className={styles.hint}>{description}</p>}
      <div className={styles.row}>
        {fields.map((field) => (
          <Field key={field.name} field={field} t={t} error={errors[field.name]} />
        ))}
      </div>
      <FormFeedback result={result} />
      <button type="submit" className={styles.primary} disabled={busy}>
        {t('admin.sections.submit')}
      </button>
    </form>
  );
}
