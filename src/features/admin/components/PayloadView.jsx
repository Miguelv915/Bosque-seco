import { mediaUrl } from '../../../services/associations.service';
import styles from '../admin.module.css';

/** Muestra el contenido de una solicitud como lista campo → valor (+ vista previa de imagen). */
export default function PayloadView({ request }) {
  const { payload, entity_type: entityType } = request;
  const entries = Object.entries(payload).filter(([key]) => key !== 'storage_path');

  return (
    <>
      {entityType === 'media' && payload.storage_path && (
        <img className={styles.preview} src={mediaUrl(payload.storage_path)} alt="" />
      )}
      <dl className={styles.payload}>
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{String(value)}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
