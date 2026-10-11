import algarrobo from '../../../assets/images/algarrobal.jpg';
import ceibo from '../../../assets/images/ceibo.jpg';
import venado from '../../../assets/images/venado-cola-blanca.jpg';
import zorro from '../../../assets/images/zorro-sechura.jpg';

// Los nombres comunes y notas están en i18n bajo `species.<id>`.
// `image` es opcional: sin ella se muestra un marcador.
export const SPECIES = [
  { id: 'algarrobo', kind: 'flora', scientific: 'Prosopis pallida', image: algarrobo },
  { id: 'ceibo', kind: 'flora', scientific: 'Ceiba trichistandra', image: ceibo },
  { id: 'palosanto', kind: 'flora', scientific: 'Bursera graveolens' },
  { id: 'venado', kind: 'fauna', scientific: 'Odocoileus virginianus', image: venado },
  { id: 'ardilla', kind: 'fauna', scientific: 'Simosciurus stramineus' },
  { id: 'zorro', kind: 'fauna', scientific: 'Lycalopex sechurae', image: zorro },
];
