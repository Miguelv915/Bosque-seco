import amotapeImage from '../../../assets/images/hero-senderismo.png';
import angoloImage from '../../../assets/images/coto-caza-el-angolo.png';
import algarrobalImage from '../../../assets/images/algarrobal.jpg';
import bosqueImage from '../../../assets/images/login-bosque.jpg';
import ceiboImage from '../../../assets/images/ceibo.jpg';
import venadoImage from '../../../assets/images/venado-cola-blanca.jpg';
import zorroImage from '../../../assets/images/zorro-sechura.jpg';
import { REMOTE_IMAGES } from '../../../lib/remoteImages';

// Datos no traducibles de cada destino. Los textos viven en i18n/locales
// bajo la clave `destinations.<id>`. `image` es opcional (sin ella se muestra un marcador);
// `credit` acompaña a las fotos externas o referenciales. `gallery` son fotos
// extra para la ficha de detalle (cada una `{ src, credit? }`).
const remote = (key) => ({ src: REMOTE_IMAGES[key].src, credit: REMOTE_IMAGES[key].credit });

export const DESTINATIONS = [
  {
    id: 'angolo',
    lat: -4.35,
    lon: -80.85,
    image: angoloImage,
    gallery: [{ src: venadoImage }, { src: zorroImage }, { src: algarrobalImage }],
  },
  {
    id: 'amotape',
    lat: -3.95,
    lon: -80.55,
    image: amotapeImage,
    gallery: [remote('amotapeTrail'), remote('amotapeVisit'), remote('ardilla')],
  },
  {
    // Foto referencial de bosque seco hasta que la asociación suba las suyas.
    id: 'fernandez',
    lat: -4.15,
    lon: -80.92,
    image: bosqueImage,
    credit: 'Foto referencial',
    gallery: [{ src: ceiboImage }, { src: algarrobalImage }, remote('palosanto')],
  },
  {
    id: 'lancones',
    lat: -4.58,
    lon: -80.55,
    image: algarrobalImage,
    gallery: [{ src: ceiboImage }, { src: bosqueImage }, remote('palosanto')],
  },
  {
    id: 'poechos',
    lat: -4.68,
    lon: -80.5,
    image: REMOTE_IMAGES.poechos.src,
    credit: REMOTE_IMAGES.poechos.credit,
    gallery: [{ src: algarrobalImage }, { src: ceiboImage }],
  },
  {
    id: 'chira',
    lat: -4.85,
    lon: -80.8,
    image: REMOTE_IMAGES.chira.src,
    credit: REMOTE_IMAGES.chira.credit,
    gallery: [{ src: algarrobalImage }, { src: bosqueImage }],
  },
];

export const findDestination = (id) => DESTINATIONS.find((d) => d.id === id);

export const CITIES = [
  { name: 'MÁNCORA', lat: -4.1, lon: -81.05 },
  { name: 'SULLANA', lat: -4.9, lon: -80.68 },
];
