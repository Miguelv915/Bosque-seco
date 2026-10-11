import amotapeImage from '../../../assets/images/hero-senderismo.png';
import angoloImage from '../../../assets/images/coto-caza-el-angolo.png';
import algarrobalImage from '../../../assets/images/algarrobal.jpg';
import { REMOTE_IMAGES } from '../../../lib/remoteImages';

// Datos no traducibles de cada destino. Los textos viven en i18n/locales
// bajo la clave `destinations.<id>`. `image` es opcional (sin ella se muestra un marcador);
// `credit` acompaña a las fotos externas.
export const DESTINATIONS = [
  { id: 'angolo', lat: -4.35, lon: -80.85, image: angoloImage },
  { id: 'amotape', lat: -3.95, lon: -80.55, image: amotapeImage },
  { id: 'fernandez', lat: -4.15, lon: -80.92 },
  { id: 'lancones', lat: -4.58, lon: -80.55, image: algarrobalImage },
  { id: 'poechos', lat: -4.68, lon: -80.5, image: REMOTE_IMAGES.poechos.src, credit: REMOTE_IMAGES.poechos.credit },
  { id: 'chira', lat: -4.85, lon: -80.8, image: REMOTE_IMAGES.chira.src, credit: REMOTE_IMAGES.chira.credit },
];

export const CITIES = [
  { name: 'MÁNCORA', lat: -4.1, lon: -81.05 },
  { name: 'SULLANA', lat: -4.9, lon: -80.68 },
];
