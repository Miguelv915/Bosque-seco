import { useTranslation } from 'react-i18next';
import { createRequest, uploadAssociationImage } from '../../../services/changeRequests.service';
import { filledFields } from '../lib/formData';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import FormFeedback from './FormFeedback';
import styles from '../admin.module.css';

const CATEGORIES = ['landscape', 'flora', 'fauna', 'facilities'];

/** Sube una imagen a un espacio o subespacio (queda pendiente de aprobación). */
export default function ImageForm({ associationId, spaces, onSent }) {
  const { t } = useTranslation();
  const { busy, result, run } = useSubmitRequest();

  // Destinos posibles: cada espacio y cada uno de sus subespacios.
  const targets = spaces.flatMap((space) => [
    { value: `space:${space.id}`, label: space.name },
    ...space.subspaces.map((sub) => ({
      value: `subspace:${sub.id}`,
      label: `${space.name} › ${sub.name}`,
    })),
  ]);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('file');
    if (!(file instanceof File) || file.size === 0) return;

    const [parent, parentId] = String(data.get('target')).split(':');

    const ok = await run(async () => {
      const storagePath = await uploadAssociationImage(associationId, file);
      await createRequest({
        associationId,
        entityType: 'media',
        action: 'create',
        payload: {
          storage_path: storagePath,
          [parent === 'space' ? 'space_id' : 'subspace_id']: parentId,
          category: data.get('category'),
          is_cover: data.get('is_cover') === 'on',
          ...filledFields(data, ['alt_es', 'alt_en']),
        },
      });
    });
    if (ok) {
      form.reset();
      onSent();
    }
  }

  if (targets.length === 0) return null;

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2 className={styles.cardTitle}>{t('admin.imageForm.title')}</h2>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{t('admin.fields.parent')}</span>
          <select name="target" required>
            {targets.map((target) => (
              <option key={target.value} value={target.value}>
                {target.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>{t('admin.fields.category')}</span>
          <select name="category" required>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {t(`admin.categories.${category}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={styles.field}>
        <span>{t('admin.imageForm.file')}</span>
        <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
      </label>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{t('admin.imageForm.altEs')}</span>
          <input name="alt_es" />
        </label>
        <label className={styles.field}>
          <span>{t('admin.imageForm.altEn')}</span>
          <input name="alt_en" />
        </label>
      </div>
      <label className={styles.check}>
        <input name="is_cover" type="checkbox" />
        {t('admin.imageForm.cover')}
      </label>
      <FormFeedback result={result} />
      <button type="submit" className={styles.primary} disabled={busy}>
        {t('admin.imageForm.submit')}
      </button>
    </form>
  );
}
