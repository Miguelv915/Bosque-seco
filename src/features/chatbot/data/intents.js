// Preguntas frecuentes del turista. Las respuestas están en i18n bajo
// `chatbot.answers.<id>`; aquí solo viven los datos que no se muestran:
// las palabras clave (español e inglés, sin tildes), el enlace de apoyo y si
// la intención aparece como sugerencia (`chip`).
//
// El orden importa: en un empate gana la primera. Las de cortesía
// (`smalltalk`) solo responden si ninguna otra coincide.
export const INTENTS = [
  {
    id: 'destinations',
    chip: true,
    link: { type: 'route', to: '/lugares' },
    keywords: [
      'destino', 'lugar', 'lugares', 'sitios', 'visitar', 'conocer', 'atractivo',
      'que hay', 'que ver', 'que hacer', 'donde ir', 'lugares para',
      'destination', 'places', 'visit', 'sights', 'what to see', 'what to do', 'where to go',
    ],
  },
  {
    id: 'access',
    chip: true,
    link: { type: 'route', to: '/rutas' },
    keywords: [
      'llegar', 'llego', 'llegada', 'como llego', 'como llegar', 'ruta', 'rutas',
      'transporte', 'movilidad', 'carro', 'auto', 'moto', 'mototaxi', '4x4',
      'camioneta', 'bus', 'taxi', 'acceso', 'ubicacion', 'direccion',
      'get there', 'getting there', 'how to get', 'transport', 'directions', 'route',
      'car', 'access', 'location', 'address',
    ],
  },
  {
    id: 'season',
    chip: true,
    link: { type: 'route', to: '/#visita' },
    keywords: [
      'temporada', 'epoca', 'cuando', 'mejor epoca', 'mejor momento', 'clima', 'lluvia',
      'llueve', 'verano', 'invierno', 'estacion', 'calor', 'mes', 'meses',
      'season', 'when', 'weather', 'rain', 'best time', 'climate', 'dry', 'green',
    ],
  },
  {
    id: 'signal',
    link: { type: 'route', to: '/#app' },
    keywords: [
      'senal', 'cobertura', 'internet', 'wifi', 'conexion', 'offline', 'sin senal',
      'datos moviles', 'celular',
      'signal', 'coverage', 'connection', 'reception', 'phone',
    ],
  },
  {
    id: 'app',
    chip: true,
    link: { type: 'route', to: '/#app' },
    keywords: [
      'app', 'aplicacion', 'descargar', 'descarga', 'mapa', 'gps', 'sello', 'sellos',
      'descuento', 'play store', 'apk',
      'download', 'application', 'map', 'stamps', 'discounts',
    ],
  },
  {
    id: 'payments',
    link: { type: 'route', to: '/#antes-de-ir' },
    keywords: [
      'pago', 'pagos', 'pagar', 'efectivo', 'yape', 'tarjeta', 'dinero', 'soles',
      'billetera', 'payment', 'payments', 'pay', 'cash', 'card', 'credit card', 'money', 'wallet',
    ],
  },
  {
    id: 'pack',
    chip: true,
    link: { type: 'route', to: '/#antes-de-ir' },
    keywords: [
      'llevar', 'llevo', 'lleve', 'mochila', 'ropa', 'equipaje', 'protector', 'bloqueador',
      'repelente', 'agua', 'zapatos', 'calzado', 'que necesito',
      'bring', 'pack', 'packing', 'clothes', 'wear', 'sunscreen', 'shoes', 'luggage', 'what to bring',
    ],
  },
  {
    id: 'prices',
    link: { type: 'whatsapp' },
    keywords: [
      'precio', 'tarifa', 'costo', 'cuanto cuesta', 'cuanto cobran', 'cuanto sale', 'cuanto es',
      'cobran', 'cobro', 'entrada', 'gratis', 'barato',
      'price', 'prices', 'cost', 'how much', 'fee', 'fees', 'rate', 'rates', 'free', 'ticket',
    ],
  },
  {
    id: 'guides',
    chip: true,
    link: { type: 'route', to: '/#asociaciones' },
    keywords: [
      'guia', 'guias', 'guiado', 'contacto', 'contactar', 'whatsapp', 'telefono', 'numero',
      'escribir', 'hablar', 'asociacion', 'asociaciones', 'lider', 'reservar', 'reserva',
      'cupo', 'disponibilidad',
      'guide', 'guides', 'contact', 'book', 'booking', 'reserve', 'reservation', 'speak', 'talk', 'message',
    ],
  },
  {
    id: 'about',
    link: { type: 'route', to: '/#comunidades' },
    keywords: [
      'ecorumbo', 'que es', 'quienes son', 'quienes somos', 'aider', 'proyecto',
      'organizacion', 'comunidad', 'comunidades', 'turismo comunitario',
      'who are you', 'what is', 'about', 'community', 'communities', 'project', 'mission',
    ],
  },
  {
    id: 'thanks',
    smalltalk: true,
    keywords: ['gracias', 'muchas gracias', 'agradezco', 'genial', 'perfecto', 'thanks', 'thank you', 'great'],
  },
  {
    id: 'bye',
    smalltalk: true,
    keywords: ['adios', 'chao', 'chau', 'hasta luego', 'nos vemos', 'bye', 'goodbye', 'see you'],
  },
  {
    id: 'greeting',
    smalltalk: true,
    keywords: [
      'hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey',
      'hi', 'hello', 'good morning', 'good afternoon', 'good evening',
    ],
  },
];

/** Respuesta cuando nada coincide: ofrece las sugerencias y el contacto con un guía. */
export const FALLBACK = { id: 'fallback', link: { type: 'whatsapp' } };

/** Intenciones que se ofrecen como botones de pregunta rápida. */
export const SUGGESTIONS = INTENTS.filter((intent) => intent.chip).map((intent) => intent.id);

const BY_ID = new Map([...INTENTS, FALLBACK].map((intent) => [intent.id, intent]));

export const intentById = (id) => BY_ID.get(id) ?? null;
