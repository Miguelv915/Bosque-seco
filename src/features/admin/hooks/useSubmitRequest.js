import { useState } from 'react';

/**
 * Envuelve el envío de un formulario: controla `busy` y el resultado
 * (`ok` | `error` | null) para mostrar mensajes.
 */
export function useSubmitRequest() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function run(task) {
    setBusy(true);
    setResult(null);
    try {
      await task();
      setResult('ok');
      return true;
    } catch (error) {
      setResult(error?.message === 'FILE_TOO_LARGE' ? 'tooLarge' : 'error');
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, result, run };
}
