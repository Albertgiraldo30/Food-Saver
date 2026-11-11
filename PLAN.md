# PLAN.md — Food Saver

Concurso de 4 horas (240 min). Stack fijo: un solo `index.html` con HTML, CSS y JavaScript puro, sin librerías ni CDN, con localStorage.

Plan propuesto por el subagente `arquitecto` y ajustado con las decisiones de la usuaria (ver "Decisiones de la usuaria" al final).

## 0. Enfoques comparados

| Tema | Opción A (elegida) | Opción B (descartada) | Motivo |
|---|---|---|---|
| Arquitectura | Arreglo en memoria, un único `render()` que redibuja todo y `guardar()` tras cada cambio | Varios archivos o módulos ES, actualizaciones finas del DOM | CLAUDE.md exige un solo archivo. Los módulos ES fallan al abrir con doble clic (`file://`). |
| Ingredientes repetidos | Una entrada por nombre, tipo de unidad **y fecha**; al agregar con la misma fecha se suma (R2) | Fusionar siempre, sin importar la fecha | Decisión de la usuaria: fechas distintas van en filas aparte. |
| Edición | Reutilizar el mismo formulario en "modo edición" | Edición dentro de la fila | Una sola validación para agregar y editar. |
| Fechas | Texto `YYYY-MM-DD` y cálculo con fecha local | `new Date("YYYY-MM-DD")` y `toISOString()` | Lo segundo usa UTC y en Colombia (UTC-5) puede correr un día. |
| Campo cantidad | `type="text"` con `inputmode="decimal"` y validación propia | `type="number"` | Control total del mensaje de error; acepta coma decimal; rechaza texto y `1e3` de forma predecible. |

## 1. Requisitos con prioridad

### P0 — flujo principal y cumplimiento del concurso
- **R1.** Agregar ingrediente: nombre, cantidad, unidad, fecha de vencimiento.
- **R3.** Lista ordenada por vencimiento (más próxima primero). Destacar "próximo a vencer": de 0 a 3 días (decisión 17).
- **R4.** Vencidos (fecha anterior a hoy) en sección aparte, en rojo, excluidos de las recetas.
- **R5.** Sugerir recetas con al menos 1 ingrediente presente y no vencido (aunque no alcance). Orden: urgencia y luego menos faltantes.
- **R6.** Mostrar disponibles y faltantes por receta, con conversión de unidades (la despensa de ejemplo la necesita: `1 l` frente a `15 ml`, `1 libras` frente a `300 g`).
- **R7.** Los datos persisten al recargar (localStorage).
- Comparación de nombres normalizada (mayúsculas, tildes, espacios, "s" final).
- Cantidad inválida rechazada con error junto al campo (está en el flujo de la demo).
- Despensa precargada (11 ingredientes) y 8 recetas fijas en el código.
- Entregables: `README.md` (uso) y `PROCESO.md` (tarea delegada, resultado rechazado o refinado, verificación).

### P1 — enunciado completo
- **R2.** Editar, eliminar, y sumar cantidad al agregar un duplicado con unidad compatible y misma fecha.
- Resto de validaciones: campos vacíos, unidad de la lista, fecha válida (máx. hoy + 5 años), tope de 10000 (también tras sumar), coma decimal.
- Errores junto a cada campo, sin `alert()`.
- Estados vacíos (sin ingredientes, sin vencidos, sin recetas).
- Tolerar localStorage dañado o no disponible sin romper la app.

### P2 — mejoras y extras
- Diseño cuidado: colores, etiquetas "Vence hoy / en N días", tarjetas, adaptación a móvil.
- Motivo del faltante ("no está", "vencido", "unidad no compatible").
- Confirmación en pantalla antes de eliminar.
- **R8.** Botón "Cocinar esta receta" (solo si sobra tiempo): activo solo sin faltantes; descuenta desde la fila que vence primero; elimina la fila que queda en 0.
- **Pendiente de decisión de la usuaria, sin tiempo asignado:** crear o editar recetas, IA dentro de la app, integraciones externas.

## 2. Flujo principal (punta a punta)

1. Abrir `index.html`: se ve la despensa precargada, ordenada, con próximos destacados y vencidos aparte.
2. Registrar un ingrediente que vence hoy (aguacate, 1, unidades): sube al inicio de la lista como "próximo".
3. Registrar uno vencido (limón, 2, unidades, ayer) e intentar uno con cantidad `-2`: el primero va a "Vencidos"; el segundo se rechaza con error junto al campo.
4. Ver "Recetas sugeridas": la primera es "Ensalada de aguacate", con disponibles (aguacate, tomate, cebolla) y faltante (limón).
5. Pulsar F5: todo sigue igual.

## 3. Estructura de archivos

```
C:\Users\sofia\Desktop\Concurso IA\
  index.html     Pantalla (HTML, CSS y JS del DOM)
  logica.js      Funciones puras y constantes (sin DOM)
  pruebas.js     Pruebas de logica.js: node pruebas.js
  README.md      Instrucciones breves de uso (entregable)
  PROCESO.md     Tres ejemplos de trabajo con el agente (entregable)
  PLAN.md        Este plan
  CLAUDE.md      Contexto y reglas
  ENUNCIADO.md   Enunciado
  .gitignore
```

Orden interno del `<script>`, con un comentario por sección:
1. Constantes: `UNIDADES`, `RECETAS`, `SEMILLA`, `CLAVE`.
2. Utilidades puras: `normalizar`, `hoyISO`, `sumarDias`, `diasPara`, `aBase`.
3. Almacenamiento: `cargar`, `guardar`.
4. Recetas: `evaluarReceta`, `sugerirRecetas`.
5. Validación: `validar`.
6. `render`.
7. Eventos.
8. Inicio.

Las funciones de lógica no tocan el DOM, para poder probarlas desde la consola.

## 4. Modelo de datos

### Qué se guarda
Los ingredientes de la despensa **y las recetas** (decisión 15).

```json
{
  "version": 1,
  "ingredientes": [
    { "id": "m3x9a1", "nombre": "Tomate", "cantidad": 4,   "unidad": "unidades", "vence": "2026-11-12" },
    { "id": "m3x9a2", "nombre": "Queso",  "cantidad": 200, "unidad": "g",        "vence": "2026-11-10" },
    { "id": "m3x9a3", "nombre": "Leche",  "cantidad": 1,   "unidad": "l",        "vence": "2026-11-13" }
  ],
  "recetas": [ { "id": 1, "nombre": "Huevos pericos", "ingredientes": [ ... ], "preparacion": "..." } ]
}
```

Al leer (`deserializar` en logica.js): las filas de despensa inválidas se descartan con aviso en pantalla; si alguna receta guardada es inválida se usan las predefinidas. Si se cambian las recetas en el código, hay que borrar `foodsaver.v1` para verlas.

- `id`: texto único (`Date.now()` más un aleatorio). No usar `crypto.randomUUID`.
- `nombre`: como lo escribió la persona, sin espacios sobrantes.
- `cantidad`: número mayor que 0, redondeado a 2 decimales.
- `unidad`: una de `unidades, g, kg, ml, l, tazas, cucharadas, libras`.
- `vence`: texto `YYYY-MM-DD`.

### Qué no se guarda
- Estado (vencido, próximo, normal), nombre normalizado y sugerencias: se calculan en cada `render()`.
- (Las recetas predefinidas siguen como constante `RECETAS` en logica.js; se usan la primera vez y como respaldo.)

```json
{
  "id": 6,
  "nombre": "Batido de banano",
  "ingredientes": [
    { "nombre": "banano", "cantidad": 2,   "unidad": "unidades" },
    { "nombre": "leche",  "cantidad": 500, "unidad": "ml" }
  ],
  "preparacion": "Licuar y servir frío."
}
```

### Tabla de unidades (constante)

| Unidad | Tipo | Factor a base |
|---|---|---|
| unidades | unidad | 1 |
| g | peso | 1 |
| kg | peso | 1000 |
| libras | peso | 500 |
| ml | volumen | 1 |
| l | volumen | 1000 |
| tazas | volumen | 240 |
| cucharadas | volumen | 15 |

Solo son compatibles las unidades del mismo tipo.

### Dónde se guarda
- localStorage, clave `foodsaver.v1`. Lo acepta el concurso, lo exige CLAUDE.md y no necesita servidor.
- Precarga: solo si `getItem` devuelve `null`. Un arreglo vacío no dispara la precarga.
- Las fechas de la semilla se calculan una vez, relativas al día de la primera carga, y se guardan como fechas fijas.

### Reglas de cálculo
- `diasPara(vence)`: menor que 0 es vencido; de 0 a 3 es próximo; mayor que 3 es normal (decisión 17).
- Cantidad disponible de un ingrediente = suma convertida de **todas sus filas no vencidas** de tipo compatible.
- Ingrediente de receta **disponible**: esa suma alcanza. **Parcial**: está pero no alcanza; se usa lo que hay ("tomate 1 de 3") y no es faltante (decisión 13). **Faltante**: no está, solo vencido o unidad no compatible.
- Ingrediente **presente**: tiene al menos una fila no vencida de tipo compatible, aunque no alcance.
- Una receta se muestra si tiene al menos 1 ingrediente presente.
- La urgencia de una receta = menos días entre sus ingredientes presentes (incluye los que no alcanzan).
- Cada receta se evalúa por separado; no se reparte la despensa entre recetas.
- Orden de recetas:
  1. Primero las que usan algún próximo a vencer.
  2. Entre ellas, menos días del ingrediente más urgente.
  3. Luego, menos faltantes.
  4. Por último, el orden original.
- Orden de la lista: fecha ascendente; en empate, por nombre.

## 5. Plan por capas

Cada tiempo incluye la revisión del `revisor` y el commit.

### Capa 1 — Base (30 min)
- [ ] Crear `index.html`: encabezado, formulario (nombre, cantidad, unidad, fecha) con `novalidate`, y secciones "Despensa", "Vencidos" y "Recetas sugeridas".
- [ ] Selector de unidad con opción vacía "Selecciona" y las 8 unidades.
- [ ] Constantes: `UNIDADES`, `RECETAS` (8, cada una con 1 o 2 líneas de preparación) y `SEMILLA` (11 ingredientes con días relativos).
- [ ] Utilidades puras: `normalizar`, `hoyISO`, `sumarDias`, `diasPara`, `aBase`.
- [ ] Estado en memoria cargado desde la semilla y un único `render()`.
- [ ] Agregar ingrediente: aparece en la lista ordenada por fecha.
- [ ] Pintar textos del usuario con `textContent`, nunca con `innerHTML`.

**Criterios de aceptación**
- Abre con doble clic y la consola no muestra errores.
- Se ven los 11 ingredientes de ejemplo, ordenados por fecha ascendente.
- Agregar "Yogur, 2, unidades, +3 días" lo ubica en su posición correcta.
- En consola: `normalizar("  TomátES ")` devuelve `"tomate"`; `diasPara(hoyISO())` devuelve `0`.
- No hay librerías ni enlaces externos.

### Capa 2 — Flujo principal (60 min)
Tres encargos separados, en este orden.

**2A. Lista por estado (P0, 10 min)**
- [ ] Separar los vencidos en la sección "Vencidos".
- [ ] Marcar los próximos (0 a 3 días, decisión 17) con clase y texto: "Vence hoy", "Vence mañana", "Vence en N días".

**2B. Recetas (P0, 30 min)**
- [ ] `evaluarReceta(receta, despensa)`: devuelve disponibles, faltantes, presentes y días del más urgente.
- [ ] `sugerirRecetas(despensa)`: filtra las que tienen al menos 1 presente y las ordena.
- [ ] Pintar cada receta: nombre, preparación, disponibles, faltantes y qué ingrediente próximo aprovecha.

**2C. Actualizar ingredientes (P1, 20 min)**
- [ ] Eliminar un ingrediente.
- [ ] Editar: carga el ingrediente en el formulario, con botones "Guardar cambios" y "Cancelar". Al editar nunca se fusiona.
- [ ] Fusionar al agregar: mismo nombre normalizado, unidad compatible **y misma fecha** suma la cantidad, convertida a la unidad existente.
- [ ] Fecha distinta o unidad no compatible: crea una entrada aparte.

**Criterios de aceptación**
- Queso aparece solo en "Vencidos". Tomate, leche, pechuga de pollo y banano aparecen destacados.
- Con la despensa de ejemplo, el orden de recetas es exactamente:

| # | Receta | Más urgente | Faltantes |
|---|---|---|---|
| 1 | Huevos pericos | tomate (1 día) | ninguno |
| 2 | Pasta con salsa de tomate | tomate (1 día) | queso (vencido) |
| 3 | Ensalada de aguacate | tomate (1 día) | aguacate, limón |
| 4 | Batido de banano | leche (2 días) | ninguno |
| 5 | Arroz con pollo | pechuga de pollo (2 días) | zanahoria |
| 6 | Papas con huevo | ninguno próximo | ninguno |
| 7 | Sopa de verduras | ninguno próximo | zanahoria, arveja |
| — | Arepa con queso | no se muestra (0 presentes) | — |

- Al agregar "aguacate, 1, unidades, hoy", "Ensalada de aguacate" pasa al primer lugar con faltante limón.
- Agregar "Tomates, 2, unidades, +1 día" deja una sola fila de tomate con 6 unidades.
- Agregar "arroz, 500, g, +180 días" deja arroz en 1.5 kg.
- Agregar "tomate, 2, unidades, +10 días" crea otra fila de tomate (fecha distinta).
- Agregar "tomate, 200, g" crea otra fila y no cambia las recetas.
- Editar la fecha de un ingrediente lo reubica; eliminarlo lo quita de la lista y de las recetas.

### Capa 3 — Persistencia (15 min)
- [ ] `cargar()`: lee `foodsaver.v1`; si es `null`, guarda la semilla.
- [ ] `guardar()` después de agregar, editar, eliminar y fusionar.
- [ ] `try/catch` al leer y escribir. Si el JSON está dañado, cargar la semilla y mostrar un aviso en pantalla.

**Criterios de aceptación**
- F5 después de agregar, editar y eliminar: el estado es idéntico.
- Cerrar y reabrir el navegador: los datos siguen.
- Eliminar todo y pulsar F5: la lista queda vacía; la semilla no reaparece.
- En DevTools, la clave `foodsaver.v1` tiene el JSON del modelo.
- Ejecutar `localStorage.setItem('foodsaver.v1','{')` y pulsar F5: la app no se rompe.

### Capa 4 — Validaciones y errores (25 min)
- [ ] `validar(datos)`: una sola función para agregar y editar; devuelve errores por campo.
- [ ] Nombre: obligatorio tras quitar espacios.
- [ ] Cantidad: obligatoria, numérica, mayor que 0 y menor o igual a 10000; acepta decimales con punto o coma.
- [ ] Tope tras fusionar: si la suma con la fila existente supera 10000 (en la unidad existente), error junto a cantidad y no se guarda.
- [ ] Unidad: obligatoria y de la lista permitida.
- [ ] Fecha: obligatoria, real y como máximo hoy + 5 años. Se permiten fechas pasadas (van a "Vencidos").
- [ ] Mensaje de error bajo cada campo, campo marcado y foco en el primer error.
- [ ] El error se borra al corregir. Si hay errores, no se guarda ni se limpia el formulario.
- [ ] Estados vacíos: sin ingredientes, sin vencidos, sin recetas.

**Criterios de aceptación**

| Entrada en cantidad | Resultado |
|---|---|
| vacío | error |
| `0` | error |
| `-3` | error |
| `abc` | error |
| `10001` | error |
| `10000` | se guarda |
| `0.5` | se guarda |
| `1,5` | se guarda como 1.5 |

- Enviar el formulario vacío muestra 4 errores a la vez, cada uno junto a su campo.
- Una fecha pasada se guarda sin error y aparece en "Vencidos".
- Una fecha a más de 5 años de hoy muestra error junto a la fecha.
- Agregar "arroz, 9999.5, kg, +180 días" (arroz ya tiene 1 kg con esa fecha) muestra error de tope.
- Buscar `alert(` en `index.html` da 0 resultados.
- Un nombre con `<b>` se muestra como texto.

### Capa 5 — Diseño (30 min)
- [ ] Dos columnas en escritorio (despensa y recetas); una columna en pantallas angostas.
- [ ] Vencidos en rojo; próximos en naranja con etiqueta de texto (no solo color).
- [ ] Recetas como tarjetas: disponibles y faltantes bien diferenciados.
- [ ] Formulario y botones consistentes; letra legible en proyector.
- [ ] Si sobra tiempo (P2): motivo del faltante, confirmación al eliminar, R8 (activo solo sin faltantes; descuenta desde la fila que vence primero; borra la fila en 0).

**Criterios de aceptación**
- A 1366 x 768 no hay desplazamiento horizontal y el flujo se entiende sin explicación.
- A 375 px de ancho sigue siendo usable.
- Se distingue vencido, próximo y normal sin depender solo del color.
- Regresión: repetir el flujo principal completo y F5 sin fallos.

### Pruebas y correcciones (40 min)
- [ ] Borrar `foodsaver.v1` y ejecutar el flujo principal completo dos veces.
- [ ] Comprobar la tabla de orden de recetas de la capa 2.
- [ ] Límites de fecha: hoy y +3 son próximos; +4 es normal (decisión 17); -1 es vencido; hoy + 5 años + 1 día es error.
- [ ] Conversiones: leche `1 tazas` frente a 500 ml es faltante; `3 tazas` es disponible; aceite `2 cucharadas` frente a 30 ml es disponible.
- [ ] Cantidad insuficiente: con 1 tomate, "Pasta con salsa de tomate" se muestra, tomate como parcial "1 de 3" (no faltante), y cuenta para la urgencia.
- [ ] Normalización: "Tomates", " TOMATE " y "tomáte" cuentan como tomate; "Limones" cuenta como limón.
- [ ] `README.md`: cómo abrir, cómo usar y cómo borrar los datos para empezar de cero.
- [ ] `PROCESO.md`: los 3 ejemplos (se anotan durante el trabajo, no al final).
- [ ] Probar en el navegador de la demo. Commit final y copia.

## 6. Distribución del tiempo

| Bloque | Minutos | Reloj |
|---|---|---|
| Capa 0: plan y arranque | 20 | 0:00–0:20 |
| Capa 1: base | 30 | 0:20–0:50 |
| Capa 2: flujo principal | 60 | 0:50–1:50 |
| Capa 3: persistencia | 15 | 1:50–2:05 |
| Capa 4: validaciones y errores | 25 | 2:05–2:30 |
| Capa 5: diseño | 30 | 2:30–3:00 |
| Pruebas, correcciones, README y PROCESO | 40 | 3:00–3:40 |
| Margen (no empezar nada nuevo) | 20 | 3:40–4:00 |
| **Total** | **240** | |

Si el plan no cuenta dentro de las 4 horas, esos 20 minutos pasan a pruebas.

## 7. Riesgos y recortes

### Riesgos
| Riesgo | Mitigación |
|---|---|
| Fechas corridas un día por UTC | Guardar `YYYY-MM-DD`; construir fechas con `new Date(año, mes-1, día)`; no usar `toISOString()` para "hoy". |
| Lógica de recetas con errores (conversión y orden) | Funciones puras y la tabla de orden esperado como prueba. |
| localStorage con datos viejos el día de la demo | Borrar `foodsaver.v1` antes de la demo. Las fechas de la semilla se fijan en la primera carga. |
| Decimales imprecisos al sumar | Redondear a 2 decimales al guardar; comparar con tolerancia mínima. |
| Globos de validación nativos del navegador | `novalidate` en el formulario y mensajes propios. |
| El archivo único crece y el agente lo reescribe entero | Secciones comentadas; pedir cambios acotados por sección. |
| El agente agrega funciones o librerías no pedidas | El `revisor` lo comprueba en cada capa. |
| El diseño consume tiempo de pruebas | Tope fijo de 30 min. |

### Qué recortar primero
1. Pendientes de decisión (recetas editables, IA, integraciones): no se empiezan.
2. R8 "Cocinar esta receta".
3. Resto de P2: confirmación al eliminar, motivo del faltante, adaptación a móvil, pulido visual.
4. P1, en este orden:
   1. Aviso de datos dañados (se deja solo el `try/catch`).
   2. Foco en el primer error.
   3. Fusión entre unidades distintas (queda solo con la misma unidad).
   4. Editar en el formulario (queda eliminar y volver a agregar).
5. Nunca se recorta P0: agregar, lista ordenada, próximos destacados, vencidos aparte, recetas con faltantes, rechazo de cantidad inválida, persistencia, README y PROCESO.

## Decisiones de la usuaria

Respuestas a las preguntas que dejó el arquitecto:

1. **Fusión con fechas distintas:** no se fusiona; fila aparte. (El arquitecto proponía quedarse con la fecha más próxima.)
2. **Fusión con un vencido:** no; filas separadas.
3. **Fusión al editar:** no; solo al agregar.
4. **Cantidad insuficiente:** sí cuenta para mostrar la receta y para su urgencia; se usa lo que hay (ver decisión 13, que reemplaza el faltante "no alcanza"). (El arquitecto proponía que no contara.)
5. **Coma decimal:** se acepta `1,5` y `1.5`.
6. **Tope tras sumar:** el máximo de 10000 aplica también al total. (El arquitecto proponía solo a lo escrito.)
7. **Demo:** "aguacate, 1, unidades, hoy" + "limón, 2, unidades, ayer" + cantidad `-2` rechazada.
8. **Restablecer datos de ejemplo:** no se construye; el README explica cómo borrar los datos.
9. **R8:** activo solo sin faltantes; descuenta desde la fila que vence primero; elimina la fila que queda en 0.
10. **Límite de fecha:** máximo hoy + 5 años.
11. **Carpeta:** se queda en `C:\Users\sofia\Desktop\Concurso IA`.
12. **Plurales en "es":** también se quitan ("Limones" = "limón"). Se compara con `mismoNombre(a, b)`, que prueba quitando "s" y quitando "es".
13. **Ingrediente que no alcanza (cambia la decisión 4):** la receta usa lo que hay ("tomate 1 de 3 unidades") y los demás ingredientes quedan igual; ya no cuenta como faltante "no alcanza". Sigue contando para mostrar la receta y para su urgencia. La tarjeta muestra "Usa:" con cantidades en lugar de "Tienes:".
14. **Separar la lógica (pedido de la usuaria, tras la capa 2):** `logica.js` con las funciones puras y constantes, `pruebas.js` con los 23 casos de la capa 2 más los nuevos (`node pruebas.js`), e `index.html` solo con la pantalla. Reemplaza "un solo index.html" del stack.
15. **Persistencia de recetas:** en la capa 3 se guardan en localStorage la despensa **y las recetas** (pedido de la usuaria). Si las recetas guardadas están dañadas, se usan las predefinidas.
16. **Restaurar datos de ejemplo (cambia la decisión 8):** la usuaria pidió el botón "Restaurar datos de ejemplo" con confirmación en la página (sin alert ni confirm del navegador). Requisito R9 de CLAUDE.md.
17. **Próximo a vencer = 0 a 3 días (cambia R3):** la usuaria pidió colores rojo (vencido), naranja (vence en 3 días o menos) y verde (ok), y decidió que el cambio aplique a todo: lista, resumen y recetas (Aprovecha y orden).
18. **Resumen arriba (pedido de la usuaria):** tres tarjetas: vencen pronto (0 a 3 días), vencidos y recetas posibles. "Recetas posibles" = todas las sugeridas (decisión de la usuaria), no solo las sin faltantes.
19. **Aviso "Guardado" y confirmación al eliminar (pedido de la usuaria):** tras agregar o editar aparece "Guardado" (y "Eliminado" al borrar) junto al botón, 4 segundos, solo si localStorage guardó de verdad. Eliminar pide confirmación en la página con nombre y cantidad. Los errores en línea bajo cantidad y fecha ya existían desde la capa 4.
20. **Cociné esta receta (R8, reemplaza la decisión 9):** solo sin faltantes; modal con cantidad usada editable por ingrediente (0 a lo disponible); descuenta desde la fila que vence primero, con conversión, sin vencidos y sin negativos; en 0 la fila queda "Agotada" en una sección aparte (ya no se borra). Las filas con cantidad 0 se guardan y se recargan.
21. **Lista de compras (R10):** agotados + vencidos + faltantes de recetas marcadas; lo que no alcanza entra con la cantidad que falta (decisión de la usuaria); copiar solo lo pendiente (decisión de la usuaria). Decisión del agente, informada: un agotado o vencido no entra si todavía hay ese ingrediente disponible, y lo marcado como comprado se olvida cuando el ingrediente sale de la lista. Restaurar también limpia la lista.
