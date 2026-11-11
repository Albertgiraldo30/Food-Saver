# Food Saver

Aplicación web para no desperdiciar comida. Registra los ingredientes de la despensa con su fecha de vencimiento, separa los vencidos, destaca los que están por vencer y sugiere recetas que aprovechen lo que vence primero. Los datos se guardan en el navegador.

Repositorio: https://github.com/Albertgiraldo30/Food-Saver (rama main)

## Estado del avance (por capas)
- Capa 1, Base: TERMINADA. Formulario, despensa ordenada por fecha, datos de ejemplo.
- Capa 2, Vencidos y recetas: TERMINADA. Vencidos aparte, próximos destacados, recetas sugeridas, editar, eliminar y fusionar.
- Capa 3, Persistencia con localStorage: TERMINADA. La despensa y las recetas se guardan y se recuperan al recargar.
- Capa 4, Validaciones con errores junto al campo: TERMINADA. Ver sección "Validaciones".
- Capa 5, Diseño: pendiente. Ver detalle en PLAN.md.

## Qué se puede hacer hoy (capas 1 a 4)
- Ver la despensa precargada, ordenada por fecha de vencimiento (empate: por nombre).
- Agregar un ingrediente con nombre, cantidad, unidad y fecha.
- Unidades disponibles: unidades, g, kg, ml, l, tazas, cucharadas, libras.
- Ver los vencidos en una sección aparte, en rojo, con texto "Venció ayer" o "Venció hace N días".
- Ver los próximos a vencer (0 a 5 días) destacados en naranja, con texto "Vence hoy", "Vence mañana" o "Vence en N días".
- Editar un ingrediente: reusa el formulario, con los botones "Guardar cambios" y "Cancelar". Editar nunca fusiona filas.
- Eliminar un ingrediente, también desde la sección de vencidos.
- Al agregar, se fusiona con una fila existente solo si coinciden nombre, tipo de unidad y fecha (las cantidades se suman).
- Ver recetas sugeridas. Cada tarjeta muestra "Aprovecha:", "Usa:", "Te falta:" (con el motivo) y "Preparación:".
- Recargar la página sin perder nada: se guardan la despensa y las recetas.
- Ver errores de validación en rojo, bajo cada campo, al agregar o editar.

## Validaciones (capa 4)
Se aplican al agregar y al editar. Los errores salen bajo el campo, nunca con `alert()`.
- Nombre: obligatorio. Los espacios no cuentan y los sobrantes se quitan.
- Cantidad: número mayor que 0, mínimo 0.01 y máximo 10000. Acepta punto o coma decimal ("1,5" = 1.5).
- Unidad: obligatoria y de la lista permitida.
- Fecha: obligatoria, real (se rechaza 2026-02-30) y como máximo hoy + 5 años. Las fechas pasadas se permiten y el ingrediente va a Vencidos.
- Al agregar, si se fusionaría con una fila (mismo nombre, tipo de unidad y fecha), el total no puede pasar de 10000.

Cómo se comporta el formulario:
- Cada campo con error se marca en rojo y muestra su mensaje.
- El foco va al primer campo con error.
- El error desaparece al corregir ese campo.
- Con errores no se guarda nada y el formulario no se limpia.
- Cancelar y Editar limpian los errores.

Ejemplos de mensajes:
- Cantidad "-2": "La cantidad debe ser mayor que 0."
- Cantidad "0.001": "La cantidad mínima es 0.01."
- Agregar arroz 9999.5 kg con la misma fecha del arroz que ya existe: "Ya tienes 1 kg con esa fecha; el total (10000.5 kg) pasaría de 10000."

## Cómo funcionan las recetas
- Para cada ingrediente se suman todas las filas no vencidas, convirtiendo unidades (por ejemplo tazas a ml).
- Orden: primero las que usan algo próximo a vencer, luego las de menos días para vencer, luego las de menos faltantes y por último el orden original.
- "Te falta:" aparece si el ingrediente no está, solo está vencido o la unidad no es compatible. Se indica el motivo: "no está", "vencido" o "unidad no compatible".
- Si el ingrediente está pero no alcanza, la receta usa lo que hay (por ejemplo "tomate 1 de 3 unidades"). No cuenta como faltante y los demás ingredientes quedan igual.

## Cómo funciona la persistencia (capa 3)
- Todo se guarda en localStorage, en la clave `foodsaver.v1` (despensa y recetas).
- Primera vez (sin clave): se carga la despensa de ejemplo con las 8 recetas y se guarda.
- Se guarda después de agregar, editar, eliminar y fusionar.
- Una despensa vacía guardada sigue vacía: el ejemplo no reaparece.
- Si lo guardado está dañado, se muestra un aviso en pantalla, se carga el ejemplo y se repara lo guardado.
- Si una fila guardada tiene cantidad, unidad o fecha inválidas, se descarta con el aviso "Se descartaron N ingrediente(s)…" y se limpia lo guardado.
- Si una receta guardada es inválida (por ejemplo, unidad desconocida), se usan las 8 recetas predefinidas.
- Si el navegador no tiene localStorage, se muestra un aviso y la app sigue funcionando solo en memoria.
- Aviso sobre recetas guardadas: como las recetas también se guardan, si el código cambia las recetas predefinidas no se verán hasta borrar la clave `foodsaver.v1` (ver "Empezar de cero").

## Flujo de la demo
1. Agrega aguacate con vencimiento hoy.
2. Agrega limón con vencimiento ayer (aparece en Vencidos).
3. Mira las recetas: la primera es "Ensalada de aguacate", con "Aprovecha: aguacate (vence hoy)" y "Te falta: limón (vencido)".
4. Intenta agregar una cantidad -2: se rechaza con un error junto al campo.
5. Recarga con F5: todo sigue ahí.

## Todavía NO existe
- Diseño de la capa 5 (estilos, singular/plural, distribución de la pantalla).
- Botón "Cocinar esta receta" (R8, opcional, P2).

## Requisitos
- Un navegador moderno (Chrome, Edge o Firefox).
- Para usar la app no hay que instalar nada ni tener internet. Funciona sin librerías.
- Para correr las pruebas: Node.js instalado (cualquier versión reciente).
- Opcional: Visual Studio Code con la extensión Live Server.

## Estructura de archivos
- `index.html`: la pantalla (HTML, CSS y JavaScript del DOM), los errores de validación y la persistencia con localStorage.
- `logica.js`: constantes y funciones puras (sin DOM ni localStorage), incluidas las validaciones. Se carga desde `index.html` con un `<script src>` normal, por eso funciona con doble clic. También se puede usar desde Node.
- `pruebas.js`: pruebas de `logica.js`.
- `PLAN.md`, `PROCESO.md`, `CLAUDE.md`, `ENUNCIADO.md`: plan, evidencias del proceso y reglas del proyecto.

Importante: `index.html` y `logica.js` deben estar en la misma carpeta.

## Cómo abrirlo
Opción A, sin instalar nada:
1. Abre la carpeta del proyecto (clonada o descargada de GitHub).
2. Haz doble clic en `index.html`. Se abre en el navegador.

Opción B, con Live Server:
1. Abre la carpeta en VS Code (Archivo > Abrir carpeta).
2. Instala la extensión "Live Server" si no la tienes.
3. Clic derecho sobre `index.html` > "Open with Live Server".

Aviso: al abrir con doble clic (`file://`) y con Live Server (`http://127.0.0.1`) el navegador guarda los datos por separado. No se comparten. Usa siempre la misma forma de abrirlo.

## Cómo correr las pruebas
1. Abre una terminal (PowerShell o CMD) en la carpeta del proyecto.
2. Ejecuta: `node pruebas.js`
3. Debe terminar sin fallas. El último resultado registrado fue 74/74 pruebas OK.

## Cómo usarlo ahora
1. Revisa la despensa de ejemplo, los vencidos y las recetas sugeridas.
2. Escribe nombre, cantidad, unidad y fecha de vencimiento y pulsa Agregar. Si algo está mal, verás el error bajo el campo. Si todo está bien, las recetas se recalculan.
3. Usa Editar o Eliminar en cada fila. En edición, pulsa "Guardar cambios" o "Cancelar".
4. Recarga con F5: tus cambios siguen guardados.

## Empezar de cero
1. Abre la app y pulsa F12.
2. Ve a Application (Aplicación) > Local Storage.
3. Borra la clave `foodsaver.v1`.
4. Recarga con F5: vuelve la despensa de ejemplo con las recetas predefinidas.

## Datos de ejemplo (ficticios)
Se cargan con fechas relativas al día en que se abre la app por primera vez:
queso 200 g (ya vencido, ayer), tomate 4 unidades (+1 día), leche 1 l (+2), pechuga de pollo 1 libras (+2), banano 3 unidades (+3), cebolla 3 unidades (+7), huevo 12 unidades (+10), papa 6 unidades (+14), pasta 500 g (+90), aceite 1 l (+120), arroz 1 kg (+180).

## Reglas de comparación y conversión
- Los nombres ignoran mayúsculas, tildes, espacios extra y la "s" o "es" final: "Limones" = "limón".
- 1 kg = 1000 g; 1 libra = 500 g; 1 l = 1000 ml; 1 taza = 240 ml; 1 cucharada = 15 ml.

## Limitaciones conocidas
- Las cantidades ".5" y "2." se rechazan (hay que escribir "0.5" y "2"). Cumple el PLAN. Se preguntó a la usuaria si quiere aceptar ".5": sin respuesta, PENDIENTE.
- Al editar, una fila puede quedar igual a otra (mismo nombre, unidad y fecha), porque editar no fusiona. Es una decisión del proyecto.
- Falta el singular en el texto: se ve "1 unidades". Queda para la capa 5.
- Accesibilidad: un lector de pantalla puede leer el mensaje de error dos veces (el mensaje está dentro de la etiqueta del campo). Queda para la capa 5.
- Diseño básico: una sola columna y botones sin estilo. Queda para la capa 5.
- Las recetas guardadas ocultan cambios hechos en el código. Para verlos hay que borrar `foodsaver.v1`.
- Si dos ingredientes guardados tuvieran el mismo id (solo por edición manual de localStorage) o se usan dos pestañas a la vez, no hay control: la última que guarda gana. No se cambió.
- Solo se quita el plural al final del nombre completo. "Pechugas de pollo" no se reconoce como "pechuga de pollo".
- Si la pestaña queda abierta pasada la medianoche, los estados (vence hoy, vencido) no se actualizan hasta recargar.
- Como una receta puede usar solo parte de un ingrediente, si más adelante se hace el botón "Cocinar" (R8) habrá que decidir su regla. NO decidido.
- Las pruebas manuales de la usuaria en el navegador (Editar, Eliminar, Cancelar y la persistencia a mano) no tienen registro: NO VERIFICADO (ver PROCESO.md). La capa 4 se probó con clics simulados por el agente, no por la usuaria.
- El probador no se ejecutó en las capas 1, 2, 3 ni 4 (ver PROCESO.md).
