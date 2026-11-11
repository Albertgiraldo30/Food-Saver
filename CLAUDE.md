# Proyecto: Food Saver

## Problema
Los hogares botan comida porque olvidan qué ingredientes están por vencer. Food Saver registra la despensa, la ordena por vencimiento, separa los vencidos y sugiere recetas que aprovechan primero lo que está por vencer, mostrando qué falta. El enunciado completo está en ENUNCIADO.md: léelo antes de planear o revisar. El plan por capas está en PLAN.md.

## Usuario
Persona de hogar que hace mercado y cocina en casa; quiere saber rápido qué usar primero y qué cocinar sin desperdiciar.

## Requisitos (en orden de prioridad)
R1. Agregar ingrediente: nombre, cantidad, unidad, fecha de vencimiento.
R2. Actualizar ingredientes: editar y eliminar. Al AGREGAR, si ya existe uno con el mismo nombre (normalizado), unidad compatible y la MISMA fecha, se suma la cantidad (convertida a la unidad existente). Si la fecha es distinta, o uno está vencido, va en fila aparte. Al EDITAR nunca se fusiona.
R3. Lista ordenada por fecha de vencimiento (más próxima primero; empate por nombre). "Próximo a vencer" = vence en 0 a 5 días: se destaca con color y texto.
R4. Vencidos (fecha anterior a hoy) en sección aparte "Vencidos", en rojo, y EXCLUIDOS de las sugerencias de recetas.
R5. Sugerir recetas que usan al menos 1 ingrediente presente y no vencido (aunque no alcance la cantidad). Orden: primero las que usan algún próximo a vencer (el de menos días primero), luego menos faltantes, luego orden original.
R6. Para cada receta: mostrar lo que usa y los faltantes. Faltante = no está, solo está vencido o unidad no compatible. La cantidad disponible es la suma (convertida) de todas las filas no vencidas de ese ingrediente. Si un ingrediente está pero NO alcanza, la receta usa lo que hay ("tomate 1 de 3 unidades"), no cuenta como faltante y los demás ingredientes quedan igual.
R7. Los datos NO se pierden al recargar la página (localStorage).
R8 (P2, solo si sobra tiempo). Botón "Cocinar esta receta": activo solo si no hay faltantes; descuenta empezando por la fila que vence primero; elimina la fila que queda en 0.

## Reglas de comparación
- Nombres: ignorar mayúsculas, tildes, espacios extra y el plural: "s" final ("Tomates" = "tomate") o "es" final ("Limones" = "limón"). Se comparan con `mismoNombre(a, b)`.
- Unidades permitidas (selector): unidades, g, kg, ml, l, tazas, cucharadas, libras.
- Conversiones: 1 kg = 1000 g; 1 libra = 500 g (libra colombiana); 1 l = 1000 ml; 1 taza = 240 ml; 1 cucharada = 15 ml.
- Peso (g, kg, libras) solo con peso; volumen (ml, l, tazas, cucharadas) solo con volumen; "unidades" solo con "unidades". No convertible → faltante.

## Flujo principal (el que se demuestra en vivo)
Abrir la app con la despensa precargada → registrar "aguacate, 1, unidades, vence hoy" (sube como próximo a vencer) → registrar "limón, 2, unidades, ayer" (va a Vencidos) e intentar cantidad "-2" (se rechaza con error junto al campo) → en Recetas sugeridas la primera es "Ensalada de aguacate", con faltante limón → F5: todo sigue ahí.

## Datos de ejemplo (ficticios)
Despensa precargada solo si la clave de localStorage no existe. Fechas relativas al día de la primera carga:
- Vencido: queso 200 g (−1 día)
- Próximos: tomate 4 unidades (+1), leche 1 l (+2), pechuga de pollo 1 libras (+2), banano 3 unidades (+3)
- Normales: cebolla 3 unidades (+7), huevo 12 unidades (+10), papa 6 unidades (+14), pasta 500 g (+90), aceite 1 l (+120), arroz 1 kg (+180)

Recetas predefinidas (fijas en el código):
1. Huevos pericos — huevo 3 unidades, tomate 1 unidades, cebolla 1 unidades, aceite 15 ml. Picar tomate y cebolla, sofreír, agregar los huevos batidos y revolver.
2. Arroz con pollo — arroz 250 g, pechuga de pollo 300 g, cebolla 1 unidades, zanahoria 1 unidades. Cocinar y desmechar el pollo, sofreír las verduras, agregar arroz y agua, cocinar 20 min.
3. Pasta con salsa de tomate — pasta 250 g, tomate 3 unidades, cebolla 1 unidades, queso 100 g. Cocinar la pasta, hacer la salsa con tomate y cebolla, servir con queso.
4. Ensalada de aguacate — aguacate 1 unidades, tomate 2 unidades, cebolla 1 unidades, limón 1 unidades. Picar todo, mezclar y aliñar con limón.
5. Sopa de verduras — papa 3 unidades, zanahoria 2 unidades, cebolla 1 unidades, arveja 200 g. Picar y hervir 25 min en agua con sal.
6. Batido de banano — banano 2 unidades, leche 500 ml. Licuar y servir frío.
7. Arepa con queso — harina de maíz 250 g, queso 150 g, mantequilla 20 g. Amasar la harina con agua y sal, rellenar con queso y asar.
8. Papas con huevo — papa 4 unidades, huevo 2 unidades, aceite 30 ml. Cocinar las papas en cubos, dorarlas y agregar los huevos.

## Stack (no cambiar)
- Un solo index.html con HTML, CSS y JavaScript puro.
- Sin librerías externas ni CDN.
- Persistencia con localStorage.

## Validaciones obligatorias
- No permitir campos vacíos (nombre, cantidad, unidad, fecha).
- Cantidad: número > 0 y ≤ 10000; acepta decimales con punto o coma (1,5 = 1.5). Rechazar 0, negativos, texto y mayores a 10000. El tope aplica también al total después de sumar un duplicado.
- Fecha: obligatoria, válida y como máximo 5 años después de hoy. Se permiten fechas pasadas: el ingrediente va directo a "Vencidos".
- Unidad: solo de la lista permitida.
- Mostrar errores en pantalla junto al campo, nunca con alert().

## Reglas de trabajo
1. Haz UNA capa del PLAN.md a la vez y espera aprobación antes de seguir.
2. Antes de cambiar código, explica tu plan en máximo 3 líneas.
3. Después de cada cambio, dime exactamente cómo probarlo.
4. No agregues funciones que no estén en los requisitos.
5. Si algo no está claro, pregunta en lugar de suponer.
6. Usa los subagentes solo en estos momentos, no después de cada cambio pequeño:
   - `arquitecto`: al inicio, para el plan (o antes de un cambio grande).
   - `revisor`: al terminar cada capa. Si dice BLOQUEADO, corrige y vuelve a revisar.
   - `probador`: cuando el revisor diga APTO PARA PRUEBAS.
   - `documentador`: cuando el probador termine, pasándole en el encargo los resultados del revisor y del probador.
     El documentador no escribe archivos: guarda tú en README.md y PROCESO.md el contenido que entregue.
   - `arquitecto`: tampoco escribe archivos: guarda tú en PLAN.md el plan aprobado.
7. Los subagentes no ven la conversación: en cada encargo incluye la capa, lo que cambió y los resultados que necesiten.
8. Haz commit al terminar cada capa, antes de llamar al probador. Si después un agente cambió algo que no debía, avísame.

## Fuera de alcance
- Inicio de sesión, pagos, backend.
- Botón "Restablecer datos de ejemplo" (el README explica cómo borrar localStorage).
- PENDIENTE de decisión de la usuaria (no empezar sin su aprobación): crear/editar recetas, IA dentro de la app, integraciones externas.
