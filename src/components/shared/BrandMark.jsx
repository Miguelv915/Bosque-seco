/**
 * Marca gráfica: árbol sostenido por una mano junto a un marcador de ruta.
 * Usa `currentColor`, así toma el color del contenedor.
 * Para usar el logo oficial, reemplazar este SVG por la imagen real.
 */
export default function BrandMark({ size = 120, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* copa del árbol */}
      <circle cx="42" cy="34" r="15" />
      <circle cx="30" cy="46" r="12" />
      <circle cx="54" cy="46" r="13" />
      <circle cx="42" cy="50" r="12" />
      {/* tronco */}
      <path d="M40 52h5l1 22h-7z" />
      {/* marcador de ruta */}
      <path
        fillRule="evenodd"
        d="M84 8c-9 0-16 7-16 16 0 11 12 21 16 31 4-10 16-20 16-31 0-9-7-16-16-16zm0 10a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"
      />
      {/* mano */}
      <path d="M8 84c0-4 3-6 7-6h14c6 0 10-3 16-3h14c5 0 8 3 8 6s-3 6-8 6H50l26-4c7-1 15-6 22-14 3-3 8 0 6 4-8 16-24 25-40 29-14 4-34 4-48 0-4-1-6-8-6-12z" />
    </svg>
  );
}
