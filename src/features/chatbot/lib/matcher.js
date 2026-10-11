// Marcas diacríticas combinadas (U+0300–U+036F) que deja normalize('NFD').
const COMBINING_MARKS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g');

/** Minúsculas, sin tildes ni signos, con espacios simples: «¿Cómo llego?» → «como llego». */
export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Una palabra clave de 5 letras o más también coincide con sus derivadas
// («destino» → «destinos»); las cortas solo con la palabra exacta, para que
// «hi» no coincida con «historia» ni «auto» con «autorizado».
const PREFIX_MIN = 5;

function hits(keyword, text, tokens) {
  const key = normalize(keyword);
  if (!key) return false;
  if (key.includes(' ')) return ` ${text} `.includes(` ${key} `);
  return tokens.some(
    (token) => token === key || (key.length >= PREFIX_MIN && token.startsWith(key)),
  );
}

function best(intents, text, tokens) {
  let winner = null;
  let top = 0;
  for (const intent of intents) {
    const score = intent.keywords.filter((keyword) => hits(keyword, text, tokens)).length;
    if (score > top) {
      top = score;
      winner = intent.id;
    }
  }
  return winner;
}

/**
 * Elige la intención que mejor coincide con el mensaje o devuelve null.
 * Las intenciones informativas ganan a las de cortesía (`smalltalk`): «hola,
 * ¿cómo llego?» se responde con el acceso, no con el saludo. En un empate gana
 * la que aparece primero en la lista.
 */
export function matchIntent(message, intents) {
  const text = normalize(message);
  if (!text) return null;
  const tokens = text.split(' ');
  return (
    best(
      intents.filter((intent) => !intent.smalltalk),
      text,
      tokens,
    ) ??
    best(
      intents.filter((intent) => intent.smalltalk),
      text,
      tokens,
    )
  );
}
