import algarrobalImage from '../../../assets/images/algarrobal.jpg';
import angoloImage from '../../../assets/images/coto-caza-el-angolo.png';
import { REMOTE_IMAGES } from '../../../lib/remoteImages';

// Portadas de respaldo mientras la asociación no sube una propia desde el panel.
// Se eligen por el lugar que aparece en el nombre; cada foto corresponde a ese lugar.
export const FALLBACK_COVERS = [
  { match: /amotape/i, src: REMOTE_IMAGES.amotapeTrail.src, credit: REMOTE_IMAGES.amotapeTrail.credit },
  { match: /lancones/i, src: algarrobalImage },
  { match: /angolo/i, src: angoloImage },
];
