import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocateFixed } from 'lucide-react';
import {
  createRequest,
  isPointCodeTaken,
  uploadAssociationImage,
} from '../../../services/changeRequests.service';
import {
  finalizePointCode,
  isValidPointCode,
  normalizePointCode,
  parseLatitude,
  parseLongitude,
  parsePath,
} from '../lib/validation';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import FormFeedback from './FormFeedback';
import QrPreview from './QrPreview';
import styles from '../admin.module.css';

const EMPTY = { code: '', lat: '', lon: '', name: '' };

/**
 * Alta de un punto de ruta. El código es el texto del QR del cartel: único,
 * en minúsculas, sin espacios ni tildes y empezando con letra.
 */
export default function RoutePointForm({ associationId, routes, onSent }) {
  const { t } = useTranslation();
  const { busy, result, run } = useSubmitRequest();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [geoState, setGeoState] = useState('idle');

  if (routes.length === 0) {
    return (
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>{t('admin.routePoint.title')}</h3>
        <p className={styles.hint}>{t('admin.routePoint.needRoute')}</p>
      </section>
    );
  }

  const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const finalCode = finalizePointCode(values.code);
  const codeIsValid = isValidPointCode(finalCode);

  function fillFromGps() {
    if (!navigator.geolocation) {
      setGeoState('unsupported');
      return;
    }
    setGeoState('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValues((current) => ({
          ...current,
          lat: coords.latitude.toFixed(6),
          lon: coords.longitude.toFixed(6),
        }));
        setGeoState('ok');
      },
      () => setGeoState('denied'),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors = {};

    if (!isValidPointCode(finalCode)) nextErrors.code = 'admin.errors.code';

    const hasLat = values.lat.trim() !== '';
    const hasLon = values.lon.trim() !== '';
    const latitude = parseLatitude(values.lat);
    const longitude = parseLongitude(values.lon);
    if (hasLat !== hasLon) nextErrors.geo = 'admin.errors.geoPair';
    else if (hasLat && (latitude === null || longitude === null)) nextErrors.geo = 'admin.errors.geoRange';

    const pathText = String(data.get('path') ?? '');
    const parsed = parsePath(pathText);
    if (parsed.error) nextErrors.path = 'admin.errors.path';

    if (!nextErrors.code) {
      try {
        if (await isPointCodeTaken(finalCode)) nextErrors.code = 'admin.errors.codeTaken';
      } catch {
        // si no se puede comprobar, el servidor lo valida al aprobar
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const photo = data.get('photo');
    const payload = {
      route_id: data.get('route_id'),
      code: finalCode,
      position: Number(data.get('position') || 0),
      name_es: String(data.get('name_es')).trim(),
      description_es: String(data.get('description_es')).trim(),
      meters_from_previous: Number(data.get('meters') || 0),
      minutes_from_previous: Number(data.get('minutes') || 0),
    };
    if (hasLat) {
      payload.lat = latitude;
      payload.lon = longitude;
    }
    if (parsed.path?.length) payload.path = parsed.path;

    const ok = await run(async () => {
      if (photo instanceof File && photo.size > 0) {
        payload.photo_path = await uploadAssociationImage(associationId, photo);
      }
      await createRequest({
        associationId,
        entityType: 'route_point',
        action: 'create',
        payload,
      });
    });

    if (ok) {
      form.reset();
      setValues(EMPTY);
      setGeoState('idle');
      onSent();
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h3 className={styles.cardTitle}>{t('admin.routePoint.title')}</h3>
      <p className={styles.hint}>{t('admin.routePoint.intro')}</p>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>
            {t('admin.fields.route')}
            <abbr title={t('admin.required')}> *</abbr>
          </span>
          <select name="route_id" required>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name_es}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>{t('admin.routePoint.position')}</span>
          <input name="position" type="number" min="0" step="1" defaultValue="0" />
          <small className={styles.fieldHint}>{t('admin.routePoint.positionHint')}</small>
        </label>
      </div>

      <label className={styles.field}>
        <span>
          {t('admin.routePoint.code')}
          <abbr title={t('admin.required')}> *</abbr>
        </span>
        <input
          value={values.code}
          onChange={(event) => setValue('code', normalizePointCode(event.target.value))}
          placeholder="mirador"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          aria-invalid={errors.code ? true : undefined}
          aria-describedby="point-code-help"
        />
        <small
          id="point-code-help"
          className={errors.code ? styles.fieldError : styles.fieldHint}
        >
          {errors.code ? t(errors.code) : t('admin.routePoint.codeHint')}
        </small>
      </label>

      {codeIsValid && <QrPreview code={finalCode} name={values.name} />}

      <div className={styles.row}>
        <label className={styles.field}>
          <span>
            {t('admin.fields.nameEs')}
            <abbr title={t('admin.required')}> *</abbr>
          </span>
          <input
            name="name_es"
            value={values.name}
            onChange={(event) => setValue('name', event.target.value)}
            required
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>
          {t('admin.fields.descriptionEs')}
          <abbr title={t('admin.required')}> *</abbr>
        </span>
        <textarea name="description_es" rows={3} required />
        <small className={styles.fieldHint}>{t('admin.routePoint.descriptionHint')}</small>
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>{t('admin.routePoint.meters')}</span>
          <input name="meters" type="number" min="0" step="1" defaultValue="0" />
        </label>
        <label className={styles.field}>
          <span>{t('admin.routePoint.minutes')}</span>
          <input name="minutes" type="number" min="0" step="1" defaultValue="0" />
        </label>
      </div>
      <p className={styles.fieldHint}>{t('admin.routePoint.fromPreviousHint')}</p>

      <fieldset className={styles.fieldset}>
        <legend>{t('admin.routePoint.gps')}</legend>
        <div className={styles.row}>
          <label className={styles.field}>
            <span>{t('admin.routePoint.lat')}</span>
            <input
              value={values.lat}
              onChange={(event) => setValue('lat', event.target.value)}
              inputMode="decimal"
              placeholder="-3.835500"
            />
          </label>
          <label className={styles.field}>
            <span>{t('admin.routePoint.lon')}</span>
            <input
              value={values.lon}
              onChange={(event) => setValue('lon', event.target.value)}
              inputMode="decimal"
              placeholder="-80.240200"
            />
          </label>
        </div>
        <button type="button" className={styles.secondary} onClick={fillFromGps}>
          <LocateFixed size={16} aria-hidden="true" /> {t('admin.routePoint.useLocation')}
        </button>
        <small className={errors.geo ? styles.fieldError : styles.fieldHint}>
          {errors.geo ? t(errors.geo) : t('admin.routePoint.gpsHint')}
        </small>
        {geoState !== 'idle' && geoState !== 'ok' && (
          <small className={styles.fieldHint}>{t(`admin.routePoint.geo.${geoState}`)}</small>
        )}
      </fieldset>

      <label className={styles.field}>
        <span>{t('admin.routePoint.path')}</span>
        <textarea name="path" rows={3} placeholder={'-3.8312, -80.2441\n-3.8355, -80.2402'} />
        <small className={errors.path ? styles.fieldError : styles.fieldHint}>
          {errors.path ? t(errors.path) : t('admin.routePoint.pathHint')}
        </small>
      </label>

      <label className={styles.field}>
        <span>{t('admin.routePoint.photo')}</span>
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
        <small className={styles.fieldHint}>{t('admin.routePoint.photoHint')}</small>
      </label>

      <FormFeedback result={result} />
      <button type="submit" className={styles.primary} disabled={busy}>
        {t('admin.sections.submit')}
      </button>
    </form>
  );
}
