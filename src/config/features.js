// Funciones que existen en el código pero están apagadas.
// `routes`: rutas con puntos QR y productos canjeables. Las pide la app móvil
// (DATOS-PORTAL-WEB.md) pero el alcance de la web no las incluye; se mantienen
// las tablas y los formularios y se activan aquí cuando se confirme.
//
// `approvals`: el administrador aprueba cada cambio del líder. Apagada, los
// cambios del líder se publican en el momento (el registro en change_requests
// se conserva) y se ocultan las pantallas de revisión y de solicitudes.
export const features = {
  routes: false,
  approvals: false,
};
