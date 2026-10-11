# Contexto del proyecto: EcoRumbo

Documento de contexto para el desarrollo de la plataforma EcoRumbo (backoffice + portal público).
Úsalo como referencia al implementar modelos, APIs y vistas.

---

## 1. Cambio clave en el modelo de datos

> **Antes:** una asociación tenía **un solo** punto de visita (relación 1:1).
> **Ahora:** una asociación puede gestionar **varios espacios de visita** (relación 1:N), y cada espacio puede tener **varios subespacios** (1:N).

Motivo: en el caso real, una asociación comunitaria opera en un territorio amplio (por ejemplo, un parque nacional con varios sectores de ingreso) y puede sumar más destinos con el tiempo.

### Jerarquía correcta

```
Organización (AIDER, super administrador)
└── Asociación (ej. ATEC Amotape)
    ├── Líder (usuario con acceso al backoffice)
    ├── Prestadores locales (guías, comida, alojamiento)
    └── Espacios de visita  ← AHORA ES UNA LISTA (1:N)
        └── Subespacios / sectores (1:N)
            ├── Actividades con tarifa
            └── Galería multimedia
```

### Implicaciones para el código

- La FK `asociacion_id` vive en `espacio`, **no** `espacio_id` en `asociacion`.
- Eliminar cualquier restricción `UNIQUE` sobre `asociacion_id` en la tabla de espacios.
- Formularios del backoffice: el líder ve un **listado** de sus espacios con botón "Agregar espacio", no un formulario único.
- Portal público: la ficha de una asociación debe listar todos sus espacios; cada espacio tiene su propia página.
- Los prestadores pertenecen a la asociación y pueden asignarse a uno o varios espacios/subespacios (relación N:M).
- Revisar seeds, migraciones y endpoints que asuman `asociacion.espacio` en singular → cambiar a `asociacion.espacios`.

### Contacto por WhatsApp: es de los guías, no del líder

> El botón de WhatsApp del portal público conecta al turista con **los guías** de la asociación (prestadores de tipo `guia`), **no** con el líder.

- El líder es un usuario interno del backoffice; su teléfono **no** se muestra en el portal.
- El número de WhatsApp vive en `prestador.telefono_whatsapp` y solo se publica para prestadores de tipo `guia`.
- Una asociación puede tener **varios guías**, así que el portal muestra un botón de WhatsApp por cada guía disponible para el subespacio o la actividad.

---

## 2. Modelo de datos sugerido

| Entidad | Campos principales | Relaciones |
|---|---|---|
| `asociacion` | id, nombre, siglas, region, estado, avalado_por | 1:N espacios, 1:N prestadores, 1:N usuarios |
| `usuario` | id, nombre, email, telefono (interno, no público), rol (`super_admin`, `lider`) | N:1 asociacion (nulo para super_admin) |
| `espacio` | id, asociacion_id, nombre, descripcion, departamento, provincia, ubicacion, tipo | N:1 asociacion, 1:N subespacios, 1:N multimedia |
| `subespacio` | id, espacio_id, nombre, descripcion, atractivos (lista) | N:1 espacio, 1:N actividades, 1:N multimedia |
| `prestador` | id, asociacion_id, nombre, tipo (`guia`, `comida`, `alojamiento`), especialidad, telefono_whatsapp (público solo si `tipo = guia`) | N:1 asociacion, N:M subespacios |
| `actividad` | id, subespacio_id, prestador_id, nombre, duracion, tarifa, unidad_tarifa, capacidad_max | N:1 subespacio, N:1 prestador |
| `medio_pago` | id, asociacion_id o espacio_id, tipo (`efectivo`, `yape`), nota | — |
| `multimedia` | id, espacio_id o subespacio_id, url, tipo, descripcion, categoria (`flora`, `fauna`, `paisaje`, `instalaciones`) | — |
| `manual` | id, titulo, archivo_url, modulo | Subido por AIDER |

---

## 3. Roles y flujo

### Paso 1 — AIDER (super administrador)
- Registra la asociación.
- Crea al líder y le asigna credenciales del backoffice.
- Sube manuales de capacitación (Módulo 1).

### Paso 2 — Líder de asociación (backoffice)
| Requisito | Qué hace |
|---|---|
| RF-04 | Registra **uno o más** espacios principales y sus subespacios |
| RF-05 | Registra prestadores locales |
| RF-06 | Configura actividades, tarifas estandarizadas y medios de pago |
| RF-07 | Sube galerías de fotos por espacio/subespacio |

### Paso 3 — Turista (portal público EcoRumbo)
| Requisito | Qué ve |
|---|---|
| RF-08 | Explora por departamento y encuentra destinos (con aval de AIDER y la asociación) |
| RF-09 | Navegación jerárquica: espacio → subespacio |
| RF-10 | Oferta local desglosada (guía, comida, alojamiento, precios) + botón de WhatsApp de cada guía de la asociación |
| RF-11 | Carrusel multimedia de flora y fauna |

---

## 4. Datos de ejemplo (caso real: Cerros de Amotape)

### Asociación
- **Nombre:** Asociación de Turismo Ecológico Comunitario Amotape Sostenible
- **Siglas:** ATEC Amotape
- **Avalada por:** AIDER
- **Líder:** Héctor Silva (acceso exclusivo al backoffice; su contacto no se publica en el portal)

### Espacio principal
- **Nombre:** Parque Nacional Cerros de Amotape (PNCA)
- **Ubicación:** Tumbes y Piura (zona de amortiguamiento)

### Subespacios
1. **Sector Rica Playa** — puerta principal de ingreso, quebrada de Ucumares, Bocana Carrillo.
2. **Sector El Caucho** — Bosque Tropical del Pacífico, Quebrada Faical, Poza del Pato.

### Prestadores
| Nombre | Tipo | Especialidad | WhatsApp en portal |
|---|---|---|---|
| Isabel Mendoza | Comida | Gastronomía local (chivo, seco de cabrito) | No |
| Mauricio Zapata | Alojamiento | Albergue y zona de campamento en Rica Playa | No |
| Felipe Torres | Guía oficial | Avistamiento de aves y trekking | **Sí** (contacto para coordinar la visita) |

> Si la asociación suma más guías, cada uno aparece con su propio botón de WhatsApp.

### Actividades y tarifas
| Actividad | Subespacio | Prestador | Tarifa | Detalle |
|---|---|---|---|---|
| Trekking guiado Quebrada Faical | El Caucho | Felipe Torres | S/ 80 por grupo | 4 horas, máx. 6 personas |
| Avistamiento de aves (perico macareño) | El Caucho | Felipe Torres | S/ 100 por jornada | Jornada matutina |
| Plato típico | — | Isabel Mendoza | S/ 25 por porción | — |

### Medios de pago
- Efectivo y Yape.
- **Nota visible para el turista:** la señal móvil es limitada en el sector; el pago con Yape se hace al retornar al pueblo.

### Multimedia
- Mono coto de Tumbes, ceibos, río Tumbes en Bocana Carrillo, instalaciones de campamento.
- Flora: angolo, guayacanes. Fauna: tigrillo, perico macareño.

---

## 5. Seed de referencia (JSON)

> El espacio va dentro de un **arreglo** para reflejar la relación 1:N. Se deja un segundo espacio como placeholder para probar el listado múltiple.

```json
{
  "asociacion": {
    "nombre": "Asociación de Turismo Ecológico Comunitario Amotape Sostenible",
    "siglas": "ATEC Amotape",
    "avalado_por": "AIDER",
    "lider": {
      "nombre": "Héctor Silva",
      "rol": "lider"
    },
    "prestadores": [
      { "id": "p1", "nombre": "Isabel Mendoza", "tipo": "comida", "especialidad": "Chivo y seco de cabrito" },
      { "id": "p2", "nombre": "Mauricio Zapata", "tipo": "alojamiento", "especialidad": "Albergue y campamento en Rica Playa" },
      { "id": "p3", "nombre": "Felipe Torres", "tipo": "guia", "especialidad": "Aves y trekking", "telefono_whatsapp": "+51XXXXXXXXX" },
      { "id": "p4", "nombre": "Guía de prueba", "tipo": "guia", "especialidad": "Trekking", "telefono_whatsapp": "+51YYYYYYYYY" }
    ],
    "medios_pago": [
      { "tipo": "efectivo" },
      { "tipo": "yape", "nota": "Señal limitada: pagar al retornar al pueblo" }
    ],
    "espacios": [
      {
        "nombre": "Parque Nacional Cerros de Amotape",
        "siglas": "PNCA",
        "departamentos": ["Tumbes", "Piura"],
        "ubicacion": "Zona de amortiguamiento",
        "subespacios": [
          {
            "nombre": "Sector Rica Playa",
            "atractivos": ["Puerta principal de ingreso", "Quebrada de Ucumares", "Bocana Carrillo"],
            "actividades": []
          },
          {
            "nombre": "Sector El Caucho",
            "atractivos": ["Bosque Tropical del Pacífico", "Quebrada Faical", "Poza del Pato"],
            "actividades": [
              { "nombre": "Trekking guiado Quebrada Faical", "prestador_id": "p3", "tarifa": 80, "unidad": "grupo", "duracion_horas": 4, "capacidad_max": 6 },
              { "nombre": "Avistamiento de aves", "prestador_id": "p3", "tarifa": 100, "unidad": "jornada matutina" },
              { "nombre": "Plato típico", "prestador_id": "p1", "tarifa": 25, "unidad": "porción" }
            ]
          }
        ],
        "multimedia": [
          { "categoria": "fauna", "descripcion": "Mono coto de Tumbes" },
          { "categoria": "fauna", "descripcion": "Tigrillo" },
          { "categoria": "fauna", "descripcion": "Perico macareño" },
          { "categoria": "flora", "descripcion": "Ceibos" },
          { "categoria": "flora", "descripcion": "Angolo" },
          { "categoria": "flora", "descripcion": "Guayacanes" },
          { "categoria": "paisaje", "descripcion": "Río Tumbes en Bocana Carrillo" },
          { "categoria": "instalaciones", "descripcion": "Zona de campamento" }
        ]
      },
      {
        "nombre": "Segundo espacio de prueba",
        "departamentos": ["Tumbes"],
        "subespacios": [],
        "multimedia": []
      }
    ]
  }
}
```

---

## 6. Pantallas a implementar o ajustar

### Backoffice (líder)
- **Mis espacios:** tabla/tarjetas con todos los espacios de la asociación + botón "Agregar espacio".
- **Detalle de espacio:** datos generales, lista de subespacios, galería.
- **Detalle de subespacio:** atractivos, actividades con tarifa y prestador asignado.
- **Prestadores:** CRUD a nivel asociación; al crear una actividad se elige el prestador.
- **Medios de pago:** con campo de nota (ej. aviso de señal limitada).

### Portal público (turista)
- **Explorar por departamento** → lista de espacios (un espacio puede aparecer en más de un departamento, ej. Tumbes y Piura).
- **Ficha de asociación** → muestra todos sus espacios.
- **Ficha de espacio** → subespacios, aval (AIDER + asociación), galería.
- **Ficha de subespacio** → oferta local desglosada, precios, medios de pago con nota y la lista de guías, cada uno con su botón de WhatsApp.
- **Carrusel multimedia** filtrable por flora / fauna / paisaje.

---

## 7. Reglas de negocio

- Solo AIDER (super_admin) crea asociaciones y líderes.
- Un líder solo ve y edita los espacios de **su** asociación.
- Una asociación puede tener 0..N espacios; un espacio pertenece a una sola asociación.
- Las tarifas son fijas (estandarizadas) y las define el líder.
- El guiado es obligatorio en el parque: el portal debe dirigir al turista a coordinar por WhatsApp **con un guía de la asociación** antes de la visita.
- El WhatsApp público pertenece a los guías (`prestador.tipo = guia`), nunca al líder. Si no hay guías registrados, el portal no muestra el botón y lo indica.
- Un espacio puede abarcar más de un departamento (relación N:M o campo arreglo).

---

## 8. Checklist de migración (1:1 → 1:N)

- [ ] Mover la FK a `espacio.asociacion_id` y quitar `UNIQUE`.
- [ ] Migrar datos existentes: cada asociación conserva su espacio actual como primer elemento de la lista.
- [ ] Renombrar `asociacion.espacio` → `asociacion.espacios` en modelos, serializers y tipos.
- [ ] Actualizar endpoints: `GET /asociaciones/:id/espacios`, `POST /asociaciones/:id/espacios`.
- [ ] Ajustar vistas del backoffice para mostrar listado en vez de formulario único.
- [ ] Ajustar portal público para listar varios espacios por asociación.
- [ ] Actualizar seeds y tests con el caso Amotape (incluido el segundo espacio de prueba).
- [ ] Mover el WhatsApp público del líder a `prestador.telefono_whatsapp` (solo guías) y mostrar un botón por guía en el portal.
