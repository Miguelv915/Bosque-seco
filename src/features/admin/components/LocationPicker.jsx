import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { parseLatitude, parseLongitude } from '../lib/validation';
import styles from './LocationPicker.module.css';

// Norte de Piura: la vista inicial cuando aún no hay punto elegido.
const DEFAULT_CENTER = [-4.7, -80.5];
const DEFAULT_ZOOM = 9;
const POINT_ZOOM = 14;

const pinIcon = L.divIcon({ className: styles.pin, iconSize: [22, 22], iconAnchor: [11, 11] });

const format = (value) => value.toFixed(6);

function ClickToPlace({ onPick }) {
  useMapEvents({ click: (event) => onPick(event.latlng.lat, event.latlng.lng) });
  return null;
}

/** Centra el mapa cuando el punto cambia desde fuera (teclado o GPS). */
function Follow({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), POINT_ZOOM));
  }, [map, position]);
  return null;
}

/**
 * Elige una ubicación tocando el mapa, arrastrando el marcador, escribiendo las
 * coordenadas o con el GPS del dispositivo. Los campos `lat` y `lon` viajan en el
 * formulario como cualquier otro.
 */
export default function LocationPicker({ label, hint, error }) {
  const { t } = useTranslation();
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [gps, setGps] = useState(null);

  const latitude = parseLatitude(lat);
  const longitude = parseLongitude(lon);
  const position = latitude !== null && longitude !== null ? [latitude, longitude] : null;

  function pick(nextLat, nextLon) {
    setLat(format(nextLat));
    setLon(format(nextLon));
    setGps(null);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGps('unsupported');
      return;
    }
    setGps('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        pick(coords.latitude, coords.longitude);
        setGps('ok');
      },
      () => setGps('denied'),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function clear() {
    setLat('');
    setLon('');
    setGps(null);
  }

  return (
    <fieldset className={styles.picker}>
      <legend>{label}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}

      <div className={styles.map}>
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPick={pick} />
          <Follow position={position} />
          {position && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const { lat: newLat, lng } = event.target.getLatLng();
                  pick(newLat, lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className={styles.row}>
        <label className={styles.coord}>
          <span>{t('admin.location.lat')}</span>
          <input
            name="lat"
            inputMode="decimal"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </label>
        <label className={styles.coord}>
          <span>{t('admin.location.lon')}</span>
          <input
            name="lon"
            inputMode="decimal"
            value={lon}
            onChange={(event) => setLon(event.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={useMyLocation}>
          {gps === 'loading' ? t('admin.location.locating') : t('admin.location.useMine')}
        </button>
        {(lat || lon) && (
          <button type="button" className={styles.action} onClick={clear}>
            {t('admin.location.clear')}
          </button>
        )}
      </div>

      <p className={styles.hint}>{t('admin.location.help')}</p>
      {gps === 'denied' && <p className={styles.error}>{t('admin.location.denied')}</p>}
      {gps === 'unsupported' && <p className={styles.error}>{t('admin.location.unsupported')}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {t(error)}
        </p>
      )}
    </fieldset>
  );
}
