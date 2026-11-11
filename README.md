# Food Saver

Aplicación web para no desperdiciar comida. Registra los ingredientes de la despensa con su fecha de vencimiento, separa los vencidos, destaca los que están por vencer y sugiere recetas que aprovechen lo que vence primero.

Repositorio: https://github.com/Albertgiraldo30/Food-Saver (rama main)

## Estado del avance (por capas)
- Capa 1, Base: TERMINADA. Formulario, despensa ordenada por fecha, datos de ejemplo.
- Capa 2, Vencidos y recetas: TERMINADA. Vencidos aparte, próximos destacados, recetas sugeridas, editar, eliminar y fusionar.
- Capa 3, Persistencia con localStorage: pendiente.
- Capa 4, Validaciones con errores junto al campo: pendiente.
- Capa 5, Diseño: pendiente. Ver detalle en PLAN.md.

## Qué se puede hacer hoy (capas 1 y 2)
- Ver la despensa precargada, ordenada por fecha de vencimiento (empate: por nombre).
- Agregar un ingrediente con nombre, cantidad, unidad y fecha.
- Unidades disponibles: unidades, g, kg, ml, l, tazas, cucharadas, libras.
- Ver los vencidos en una sección aparte, en rojo, con texto "Venció ayer" o "Venció hace N días".
- Ver los próximos a vencer (0 a 5 días) destacados en naranja, con texto "Vence hoy", "Vence mañana" o "Vence en N días".
- Editar un ingrediente: reusa el formulario, con los botones "Guardar cambios" y "Cancelar". Editar nunca fusiona filas.
- Eliminar un ingrediente, también desde la sección de vencidos.
- Al agregar, se fusiona con una fila existente solo si coinciden nombre, tipo de unidad y fecha (las cantidades se suman).
- Ver recetas sugeridas. Cada tarjeta muestra "Aprovecha:", "Usa:", "Te falta:" (con el motivo) y "Preparación:".

## Cómo funcionan las recetas
- Para cada ingrediente se suman todas las filas no vencidas, convirtiendo unidades (por ejemplo tazas a ml).
- Orden: primero las que usan algo próximo a vencer, luego las de menos días para vencer, luego las de menos faltantes y por último el orden original.
- "Te falta:" aparece si el ingrediente no está, solo está vencido o la unidad no es compatible. Se indica el motivo: "no está", "vencido" o "unidad no compatible".
- Si el ingrediente está pero no alcanza, la receta usa lo que hay (por ejemplo "tomate 1 de 3 unidades"). No cuenta como faltante y los demás ingredientes quedan igual.

## Flujo de la demo
1. Agrega aguacate con vencimiento hoy.
2. Agrega limón con vencimiento ayer (aparece en Vencidos).
3. Mira las recetas: la primera es "Ensalada de aguacate", con "Te falta: limón (vencido)".

## Todavía NO existe
- Los datos se pierden al recargar la página (pendiente, capa 3).
- Sin validaciones: el formulario y la edición aún aceptan valores incorrectos (pendiente, capa 4).
- Botón "Cocinar esta receta" (opcional, P2).

## Requisitos
- Un navegador moderno (Chrome, Edge o Firefox).
- No hay que instalar nada ni tener internet. Es un solo archivo, `index.html`, sin librerías.
- Opcional: Visual Studio Code con la extensión Live Server.

## Cómo abrirlo
Opción A, sin instalar nada:
1. Abre la carpeta del proyecto (clonada o descargada de GitHub).
2. Haz doble clic en `index.html`. Se abre en el navegador.

Opción B, con Live Server:
1. Abre la carpeta en VS Code (Archivo > Abrir carpeta).
2. Instala la extensión "Live Server" si no la tienes.
3. Clic derecho sobre `index.html` > "Open with Live Server".

Aviso: al abrir con doble clic (`file://`) y con Live Server (`http://127.0.0.1`) el navegador guarda los datos por separado. No se comparten. Esto importará desde la capa 3, cuando haya persistencia. Usa siempre la misma forma de abrirlo.

## Cómo usarlo ahora
1. Revisa la despensa de ejemplo, los vencidos y las recetas sugeridas.
2. Escribe nombre, cantidad, unidad y fecha de vencimiento y pulsa Agregar. Las recetas se recalculan.
3. Usa Editar o Eliminar en cada fila. En edición, pulsa "Guardar cambios" o "Cancelar".

## Empezar de cero
Aplica desde la capa 3 (hoy no hay nada guardado). Cuando exista la persistencia:
1. Abre la app y pulsa F12.
2. Ve a Application (Aplicación) > Local Storage.
3. Borra la clave `foodsaver.v1`.
4. Recarga con F5: vuelve la despensa de ejemplo.

## Datos de ejemplo (ficticios)
Se cargan con fechas relativas al día en que se abre la app:
queso 200 g (ya vencido, ayer), tomate 4 unidades (+1 día), leche 1 l (+2), pechuga de pollo 1 libras (+2), banano 3 unidades (+3), cebolla 3 unidades (+7), huevo 12 unidades (+10), papa 6 unidades (+14), pasta 500 g (+90), aceite 1 l (+120), arroz 1 kg (+180).

## Reglas de comparación y conversión
- Los nombres ignoran mayúsculas, tildes, espacios extra y la "s" o "es" final: "Limones" = "limón".
- 1 kg = 1000 g; 1 libra = 500 g; 1 l = 1000 ml; 1 taza = 240 ml; 1 cucharada = 15 ml.

## Limitaciones conocidas
- Solo se quita el plural al final del nombre completo. "Pechugas de pollo" no se reconoce como "pechuga de pollo".
- Sin persistencia ni validaciones hasta las capas 3 y 4. Editar puede guardar datos inválidos (capa 4).
- Si la pestaña queda abierta pasada la medianoche, los estados (vence hoy, vencido) no se actualizan hasta recargar.
- Como una receta puede usar solo parte de un ingrediente, si más adelante se hace el botón "Cocinar" (R8) habrá que decidir su regla. NO decidido.
- Las pruebas de los botones Editar, Eliminar y Cancelar en el navegador quedan a cargo de la usuaria: NO VERIFICADO (ver PROCESO.md).
- El probador no se ejecutó en las capas 1 ni 2 (ver PROCESO.md).
