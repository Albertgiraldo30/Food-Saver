# Food Saver

Aplicación web para no desperdiciar comida. Registra los ingredientes de la despensa con su fecha de vencimiento y los ordena para que se vea qué usar primero. En capas posteriores separará los vencidos y sugerirá recetas que aprovechen lo que está por vencer.

Repositorio: https://github.com/Albertgiraldo30/Food-Saver (rama main)

## Estado del avance (por capas)
- Capa 1, Base: TERMINADA. Formulario, despensa ordenada por fecha, datos de ejemplo.
- Capa 2, Vencidos y recetas: pendiente (capa 2).
- Capa 3, Persistencia con localStorage: pendiente (capa 3).
- Capa 4, Validaciones con errores junto al campo: pendiente (capa 4).
- Capa 5, Diseño: pendiente (capa 5). Ver detalle en PLAN.md.

## Qué se puede hacer hoy (capa 1)
- Ver la despensa precargada, ordenada por fecha de vencimiento (empate: por nombre).
- Agregar un ingrediente con nombre, cantidad, unidad y fecha.
- Unidades disponibles: unidades, g, kg, ml, l, tazas, cucharadas, libras.

## Todavía NO existe
- Los datos se pierden al recargar la página (pendiente, capa 3).
- Sin validaciones: el formulario aún acepta valores incorrectos (pendiente, capa 4).
- Los vencidos aún no van en una sección aparte (pendiente, capa 2).
- Sugerencia de recetas con disponibles y faltantes (pendiente, capa 2).
- Editar y eliminar ingredientes, y sumar duplicados (pendiente, capa 2).
- Destacar los próximos a vencer (0 a 5 días) con color y texto (pendiente, capa 2).

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
1. Revisa la lista de ejemplo en la sección Despensa.
2. Escribe nombre, cantidad, unidad y fecha de vencimiento.
3. Pulsa Agregar. El ingrediente aparece en su lugar según la fecha.

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
- Las fechas se muestran en formato crudo (se mejora en la capa 2).
- Sin persistencia ni validaciones hasta las capas 3 y 4.
- El probador no se ejecutó en la capa 1 (ver PROCESO.md).
