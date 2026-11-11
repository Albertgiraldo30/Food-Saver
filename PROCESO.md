# Cómo trabajamos con los agentes

Proyecto: Food Saver. Estado: las 5 capas del PLAN están terminadas, más 3 tandas de mejoras pedidas por el equipo. `node pruebas.js`: 117/117. El resumen para el jurado está en INFORME.md.

## 0. Después de la capa 5 (mejoras pedidas por el equipo)

### Tareas delegadas, siempre en pasos numerados con "un commit por paso, pruebas en verde, si algo falla detente"
- **Tanda 1:** restaurar datos de ejemplo con confirmación propia (`28292d1`); colores rojo / naranja / verde y próximo = 0 a 3 días en toda la app (`41a48dd`); resumen arriba (`0a06b8e`); aviso "Guardado" y confirmación al eliminar (`f411a36`). Antes de empezar, el agente preguntó dos cosas que cambiaban reglas acordadas: si los 3 días aplicaban a todo (sí) y qué contaba como "recetas posibles" (todas las sugeridas).
- **Tanda 2:** nombres completos de unidades con NOMBRES_UNIDAD (`2081398`), modal de edición (`a5e19a1`), toasts (`755cf92`), acabado con transiciones, hover y resaltado (`487a87a`).
- **Tanda 3:** recetas en vivo (el agente verificó que ya funcionaba y **no cambió nada**), "Cociné esta receta" (`36744ab`) y lista de compras (`7e0e2a7`). Antes de empezar, el agente preguntó 4 cosas: cocinar solo sin faltantes; agotados en sección aparte; lo que no alcanza entra a la lista con lo que falta; copiar solo lo pendiente.

### Resultados refinados o rechazados
- **Revisor de la tanda 1 (APTO):** 2 MEDIOS corregidos en `6281307`: al restaurar, si fallaba el guardado, el aviso de error se ocultaba; Tab salía de la caja de confirmación. También: foco perdido al eliminar, aviso "Guardado" mezclado con errores, resto de "5 días" en el PLAN.
- **Revisión completa (APTO):** 4 MEDIOS corregidos en `0d00673`:
  - Al cocinar, el redondeo a 2 decimales falseaba lo descontado (1 l − 15 ml quedaba 0.99 l; 1.5 kg − 1 g no descontaba). **La prueba que habíamos escrito esperaba 0.99, es decir, protegía el error.** Ahora la fila pasa a la unidad base (985 ml, 1499 g); prueba corregida y 2 casos nuevos.
  - Recetas guardadas sin id entero y único rompían "Quiero hacerla".
  - Editar un agotado mostraba "0" y un error confuso: ahora es "Reponer ingrediente" con cantidad vacía.
  - PLAN.md desactualizado: se agregaron las decisiones 22 a 25 y se marcaron las reemplazadas.
- El revisor afirmó que la carpeta "no es un repositorio": era falso (sus herramientas no incluyen git). El agente principal no lo tomó como cierto.

### Errores propios del agente en estas tandas
- Las expresiones regulares de dos funciones nuevas perdieron sus barras invertidas al pasar por la terminal. **Las pruebas fallaron (4)** y lo detectaron; se corrigió con la herramienta de edición y desde entonces los scripts de cambios se escriben en archivos.
- Al abrir y cerrar el modal se perdía el foco (el botón Editar se vuelve a crear): detectado en la simulación en Chrome; ahora vuelve al botón Editar de la fila.
- Una prueba de la lista de compras esperaba "Tomate" con mayúscula cuando el nombre viene de la receta ("tomate"): el error estaba en la prueba, no en el código.
- Un comentario del HTML contenía la palabra `alert(` y daba un falso positivo en la búsqueda de `alert(`: se reescribió.
- Al cambiar los ids del formulario, los scripts de prueba del agente dejaron de funcionar (salida vacía): se actualizaron y se volvieron a correr.

### Cambio de regla: productos nuevos vencidos
- Pedido del equipo: "el programa no acepte productos vencidos". El agente iba a preguntar el alcance; el equipo lo aclaró: los que ya están pasan a Vencidos, pero los nuevos deben tener una fecha válida. El agente interpretó que hoy sí se acepta (algo que vence hoy no está vencido) y lo informó.
- validarIngrediente rechaza al agregar una fecha anterior a hoy; al editar se permite. El calendario de Agregar ya no ofrece días pasados. 3 pruebas nuevas (119/119); en Chrome: limón de ayer rechazado, aguacate de hoy aceptado, editar Leche a una fecha pasada la lleva a Vencidos, el queso de ejemplo sigue en Vencidos; regresiones sin errores.
- La prueba vieja "fecha pasada => válida" se cambió: ahora documenta la regla nueva.

### Verificación de estas tandas
- `node pruebas.js` después de cada paso: 82 → 83 → 86 → 88 → 102 → 114 → 117, siempre sin fallas.
- Chrome sin ventana con clics simulados en cada paso: modal (17 escenarios), toasts (incluido que desaparecen entre 2.9 y 3.1 s), acabado (duraciones de 0.2 s, solo se anima lo nuevo), cocinar (12 − 5 = 7 huevos guardado, cebolla a Agotados, 1 l − 240 ml = 0.76 l), lista de compras (con recarga), recetas en vivo. Tras cada cambio se repitieron los escenarios anteriores: 0 errores de JavaScript.
- Contraste de los colores nuevos calculado con la fórmula WCAG (toasts 5.1 a 7.6:1).
- NO verificado: portapapeles real de "Copiar lista" (solo simulado); el probador no se ejecutó.

## 1. Tarea delegada
- Instrucción: al subagente `arquitecto` se le pidió el PLAN.md (5 capas, 240 minutos). Como CLAUDE.md aún no estaba guardado en disco, el encargo incluyó ENUNCIADO.md y el borrador completo de CLAUDE.md. CLAUDE.md se había llenado antes, con preguntas de opción múltiple a la usuaria, sin inventar datos. Ella decidió, entre otras cosas: las unidades, libra = 500 g, taza = 240 ml, cucharada = 15 ml, próximo a vencer = 0 a 5 días, cantidad mayor que 0 y hasta 10000 con decimales, vencidos en sección aparte, comparar nombre y cantidad, despensa precargada y 8 recetas propuestas por el agente y aprobadas por ella.
- Resultado: el arquitecto entregó un plan de 5 capas con 11 preguntas abiertas. El agente principal guardó el plan en PLAN.md.
- Segunda tarea (capa 1): el agente principal construyó `index.html` con el formulario (novalidate), las secciones Despensa, Vencidos y Recetas, las constantes UNIDADES, RECETAS y SEMILLA, las utilidades puras (normalizar, mismoNombre, hoyISO, sumarDias, diasPara, aBase), la lista ordenada por fecha y nombre, y agregar ingrediente.
- Tercera tarea (capa 2): el agente principal construyó la capa 2 en tres partes.
  - 2A: vencidos en sección aparte, en rojo; próximos (0 a 5 días) destacados en naranja; textos "Vence hoy / mañana / en N días" y "Venció ayer / hace N días".
  - 2B: las funciones evaluarReceta y sugerirRecetas. Suman todas las filas no vencidas del ingrediente con conversión de unidades. Orden: usa algo próximo a vencer, menos días, menos faltantes, orden original. La tarjeta muestra "Aprovecha:", "Usa:", "Te falta:" (con motivo: "no está", "vencido", "unidad no compatible") y "Preparación:". El motivo del faltante estaba como P2 y el agente lo adelantó; se informó a la usuaria.
  - 2C: editar (reusa el formulario, botones "Guardar cambios" y "Cancelar", nunca fusiona), eliminar (también en Vencidos) y fusionar al agregar solo con mismo nombre, tipo de unidad y fecha.
- Cuarta tarea (separación de la lógica): la usuaria pidió crear `logica.js` con las funciones puras, `pruebas.js` con los 23 casos (ejecutable con `node pruebas.js`) e `index.html` usando `logica.js`. Eso cambió la regla de stack de CLAUDE.md ("un solo index.html") por decisión de la usuaria (decisión 14 de PLAN.md). El agente:
  - Movió las constantes y las funciones puras a `logica.js`, y sumó validarCantidad, convertir, separarVencidos, faltantesDe, serializar y deserializar. Se carga con un `<script src>` normal (funciona con doble clic) y exporta para Node.
  - Para quitar tildes usó la clase Unicode de marcas (\p{M}) en lugar del rango anterior, para evitar de nuevo los caracteres invisibles.
  - Verificó con un script que UNIDADES, RECETAS, SEMILLA y CLAVE de `logica.js` son idénticas a las que tenía `index.html`.
  - Escribió `pruebas.js` con los 23 casos originales más casos nuevos: validarCantidad (vacío, 0, -3, abc, 1e3 y 10001 dan error; 10000, 0.5 y "1,5" son válidos), convertir, separar vencidos, faltantesDe y persistencia.
  - Commit 54dbb94.
- Quinta tarea (capa 3, persistencia): pedido de la usuaria: guardar la despensa Y las recetas (decisión 15). El agente principal construyó:
  - cargar(): sin clave carga la semilla y la guarda; con datos dañados muestra aviso en pantalla y usa la semilla; sin localStorage muestra aviso y sigue en memoria.
  - guardar() tras agregar, editar, eliminar y fusionar. Clave `foodsaver.v1`.
  - Commit 8b23b19.
- Sexta tarea (capa 4, validaciones): el agente principal construyó las validaciones según la sección "Validaciones obligatorias" de CLAUDE.md. Commit c88e73e.
  - En `logica.js`: validarIngrediente(crudos, lista, editando) devuelve { ok, errores por campo, datos }. Nombre obligatorio (sin contar espacios; los sobrantes se quitan). Cantidad con validarCantidad: número mayor que 0 y hasta 10000, con punto o coma decimal. Unidad obligatoria y de la lista. Fecha con validarFecha: obligatoria, real (rechaza 2026-02-30) y como máximo hoy + 5 años; las fechas pasadas se permiten y van a Vencidos. Al agregar, si se fusionaría con una fila (mismo nombre, tipo de unidad y fecha), el total no puede pasar de 10000. Para esto se extrajo la función buscarFusion.
  - En `index.html`: mensaje de error bajo cada campo, campo marcado en rojo, foco en el primer error y el error se borra al corregir. Con errores no se guarda ni se limpia el formulario. Cancelar y Editar limpian los errores. No hay `alert()`.
  - Documentación de la capa 3: se guardó en el commit 1a518b4.
- Séptima tarea (ejecución de punta a punta, a pedido de la usuaria): el agente corrió las pruebas, tomó capturas en Chrome (inicio, errores y demo) y abrió la app en el Chrome de la usuaria.
- Octava tarea (documentación de la capa 4): el agente principal revisó el borrador del documentador, verificó que no tuviera caracteres invisibles y aplicó PROCESO.md con ediciones puntuales. Commit a85f058.
- Novena tarea (capa 5, diseño): el agente principal construyó el diseño en `index.html` y `logica.js`. Commits 22cf52a y 1bbc5ac. Produjo:
  - Dos columnas desde 900 px (izquierda: formulario, despensa y vencidos; derecha: recetas) y una columna en celular. Encabezado verde y paneles con contadores (Despensa, Vencidos, Recetas).
  - Estados que no dependen solo del color: etiqueta de texto "PRÓXIMO" (franja naranja) y "VENCIDO" (franja roja). La fila en edición se resalta y el título del formulario cambia a "Editar ingrediente".
  - Recetas en tarjetas: "Aprovecha" resaltado, "Usa:" en verde, "Te falta:" en rojo (en verde si dice "nada") y "Preparación:".
  - Formatos para mostrar en `logica.js` (formatoCantidad, nombreUnidad, formatoFecha): singular en cantidades ("1 unidad", "1 libra", "1 taza", "1 cucharada") y fechas DD/MM/AAAA. Solo cambia lo que se ve; lo guardado no cambia. Se añadieron 5 pruebas de formato.
  - Letra de 17 px, botones con estilo y foco visible.
  - Hallazgo 3 del revisor de la capa 4 resuelto: el mensaje de error quedó FUERA de la etiqueta del campo, para que el lector de pantalla no lo lea dos veces.
- Las 5 capas del PLAN están terminadas.

## 2. Resultado refinado o rechazado

### Capa 5: medición inválida a 375 px (detectada y rehecha por el agente)
- Qué salió mal: para comprobar el celular, el agente midió la página con Chrome sin ventana a "375 px". Al revisar el dato vio que el ancho real era 485: Chrome sin ventana no baja de unos 485 px. La primera medición no era válida.
- Cómo se corrigió: el agente no dio por buena esa medida. Cargó la app dentro de un marco (iframe) de 375 px que le envía las medidas. Resultado: 360 px útiles, 1 columna y ningún elemento sobresale. Con 1366 px la app muestra 2 columnas, y en ambos casos no hay desplazamiento horizontal.
- Ajustes tras mirar las capturas (escritorio con la demo y celular con errores): el agente corrigió la alineación del encabezado y el margen del aviso en celular.

### Capa 5: tres hallazgos BAJOS del revisor (corregidos)
- [BAJO] El borde de los campos tenía contraste 2.17:1 y el anillo de foco 1.90:1, debajo del 3:1 que se pide para componentes. Se cambió el borde a #7d8a79 (3.63:1) y el foco a verde (5.12:1). Los valores se calcularon con un script.
- [BAJO] La fila en edición se veía poco. Se agregó un contorno verde fuerte.
- [BAJO] El contador de los paneles no tenía alto mínimo. Se corrigió.
- Las tres correcciones están en el commit ae2d843. Después: `node pruebas.js` 79/79, los 11 escenarios de la capa 4 sin cambios y 0 errores de JavaScript.
- Contraste de textos revisado por el revisor: todos de al menos 4.5:1. El más justo es "Aprovecha" (naranja sobre naranja claro), cerca de 4.7:1.

### Documentación de la capa 5: dos frases desactualizadas
- El borrador del `documentador` seguía diciendo que los hallazgos "sin validación aún" (capa 1) y "editar guarda datos inválidos" (capa 2) estaban pendientes. El agente principal lo detectó al revisar y los marcó como resueltos en la capa 4 antes de guardar.

### Capa 4: hallazgo MEDIO del revisor, "0.001" (corregido)
- Qué salió mal: la cantidad "0.001" pasaba la validación (era mayor que 0). Al redondear a dos decimales se guardaba como 0, un valor que la regla prohíbe.
- Cómo se corrigió: validarCantidad ahora rechaza lo que quedaría en 0 y muestra "La cantidad mínima es 0.01." Se añadieron 4 pruebas: 0.001 y 0.004 dan error, 0.005 se guarda como 0.01 y 0.01 es válido. Resultado: 74/74. Commit f12ceba.
- Otros hallazgos del revisor en la capa 4, sin cambio de código:
  - [BAJO] ".5" y "2." se rechazan. Cumple el PLAN. Se preguntó a la usuaria si quiere aceptar ".5". PENDIENTE: sin respuesta.
  - [BAJO] un lector de pantalla podía leer el error dos veces (el span estaba dentro del label). Resuelto en la capa 5 (el mensaje quedó fuera de la etiqueta).
  - [BAJO] al editar puede quedar una fila igual a otra. Es la decisión 3 (al editar no se fusiona) y se deja así.
- Observaciones propias para la capa 5, vistas en las capturas: "1 unidades" (falta el singular) y una sola columna con botones sin estilo. Ambas resueltas en la capa 5.

### Capa 3: hallazgos MEDIOS del revisor (corregidos)
- [MEDIO] Una receta guardada con unidad desconocida lanzaba un TypeError y dejaba la lista de recetas vacía. Se corrigió con la función recetaValida: si alguna receta guardada falla, se usan las predefinidas.
- [MEDIO] Las filas guardadas con cantidad, unidad o fecha inválidas se recargaban mostrando "null undefined". Se corrigió: esas filas se descartan con el aviso "Se descartaron N ingrediente(s)…" y se limpia lo guardado.
- Otros hallazgos del revisor, sin cambio de código o menores: las recetas guardadas ocultan cambios del código (documentado en PLAN: borrar `foodsaver.v1`); la sección 4 de PLAN estaba desactualizada (corregida); ids duplicados y dos pestañas a la vez no se cambian porque requieren edición manual.
- Las correcciones se publicaron en el commit c0cee09.

### Documentación de la capa 2: el documentador volvió a introducir caracteres invisibles
- Qué salió mal: el borrador del `documentador` para la capa 2 volvió a escribir la expresión de tildes con caracteres invisibles. Es el mismo error del hallazgo 4 de la capa 1.
- Cómo se corrigió: el agente principal lo detectó al revisar el texto, lo corrigió y verificó con un script que ningún archivo tuviera esos caracteres antes del commit ef20ce9, donde se guardó la documentación de la capa 2.
- Prevención: en el código, `logica.js` ya usa la clase \p{M} en lugar de un rango de caracteres, y el encargo al documentador prohíbe escribir ese rango.
- En la documentación de la capa 3, el agente principal también corrigió un título que atribuía este hecho a la capa 3.

### Capa 2: "usar lo que hay"
- Qué salió mal: el revisor señaló que una tarjeta mostraba "Aprovecha: tomate" junto a "tomate no alcanza". Parecía contradictorio.
- Pedido de la usuaria: "cuando el ingrediente no alcanza, ajustar la receta con los demás ingredientes".
- Qué hizo el agente: la frase era ambigua y NO la implementó directo. Le preguntó con dos opciones y una vista previa: (a) reducir toda la receta proporcionalmente o (b) usar lo que hay.
- Decisión: la usuaria eligió "usar lo que hay". La receta usa "tomate 1 de 3 unidades", no cuenta como faltante y los demás ingredientes quedan igual.
- Cambios: se modificó evaluarReceta (cantidades parciales); la tarjeta pasó de "Tienes:" a "Usa:" con cantidades; se cambió la regla R6 de CLAUDE.md y se creó la decisión 13 de PLAN.md, que reemplaza la 4.
- Errores propios al corregir: el agente insertó la decisión 13 antes de la 12 por error y lo corrigió. También actualizó 4 referencias viejas a "no alcanza" en el PLAN.
- Pruebas ajustadas: 1 tomate frente a 3 da "1 de 3"; 1 taza de leche frente a 500 ml da "240 de 500 ml". Resultado: 23/23 OK.
- Impacto pendiente: R8 (P2) dice "Cocinar solo sin faltantes". Con cantidades parciales, una receta podría cocinarse descontando todo lo que hay. Se preguntará a la usuaria si se llega a R8.

### Otro hallazgo del revisor en la capa 2 (corregido)
- [MEDIO] agregarIngrediente con cantidad inválida (texto da NaN, o negativa) fusionaba y dañaba la fila existente. Se corrigió: solo fusiona si la fila nueva es válida. Se añadió una prueba de regresión y el tomate original queda intacto.

### Observación de la usuaria en la capa 3: el nombre no se exige
- La usuaria notó que el formulario no exige el nombre. El agente explicó que todas las validaciones son de la capa 4 (la siguiente). Hasta entonces, una fila sin nombre se agregaba y se descartaba al recargar, con aviso. Resuelto en la capa 4: el nombre vacío se rechaza con error junto al campo (escenarios 1 y 9 de la verificación).

### Capa 1
- Qué produjo el agente: el subagente `arquitecto` propuso el PLAN.md con decisiones provisionales: (a) al agregar un ingrediente repetido con fecha distinta, fusionarlo y quedarse con la fecha más próxima; (b) un ingrediente que no alcanza la cantidad no cuenta para mostrar la receta ni para su urgencia; (c) el tope de 10000 solo aplica a lo que se escribe, no al total sumado.
- Por qué no nos sirvió: (a) fusionar fechas distintas pierde información de vencimiento; (b) si un ingrediente próximo a vencer no alcanza, igual conviene sugerir la receta para aprovecharlo, que es el objetivo del reto; (c) el total podía superar el límite válido.
- Cómo lo corregimos: la usuaria respondió las preguntas del arquitecto y se ajustaron CLAUDE.md y PLAN.md: fusión solo con la misma fecha, los ingredientes insuficientes cuentan para la urgencia y el tope aplica al total. También se fijó una fecha máxima de hoy + 5 años. (La parte de "no alcanza" como faltante se cambió después en la capa 2, ver arriba.)
- Segundo ajuste, plurales: la regla inicial quitaba solo la "s" final. Al entregar la capa 1, el agente principal advirtió que así "limones" no se igualaba con "limón"; la usuaria decidió quitar también "es". Se agregó la función mismoNombre(a, b) y se actualizaron CLAUDE.md y PLAN.md (decisión 12). Limitación pendiente: "Pechugas de pollo" no es igual a "pechuga de pollo", porque el plural solo se quita al final del nombre.
- Error propio del agente principal: dijo que "Yogur +3 días" quedaría entre Pechuga y Banano. El revisor aclaró que va después de Banano, porque hay empate de fecha y se ordena por nombre. Se corrigió la explicación.
- Revisión de la documentación: el borrador del `documentador` atribuía a la usuaria el hallazgo de los plurales y usaba la ruta local del equipo en el README. El agente principal lo corrigió antes de guardarlo.

## 3. Verificación

### Capa 5
- Pruebas automáticas: `node pruebas.js` pasó 79/79 (5 pruebas nuevas de formato). Tras las correcciones del revisor (commit ae2d843) sigue en 79/79.
- Chrome sin ventana, hecho por el agente: los 11 escenarios de la capa 4 se repitieron con el nuevo HTML, con los mismos resultados y 0 errores de JavaScript.
- Medidas de ancho, sin desplazamiento horizontal: 1366 px da 2 columnas; a 375 px (medido en un marco de 375 px, ver sección 2) da 360 px útiles, 1 columna y ningún elemento sobresale.
- Capturas revisadas a ojo por el agente: escritorio con la demo y celular con errores. De ahí salieron dos ajustes (encabezado y margen del aviso).
- Subagente `revisor` (capa 5): APTO PARA PRUEBAS, sin críticos ni altos y sin regresiones. Comprobó que todos los ids existen y que editar, cancelar, eliminar, errores y persistencia siguen coherentes. Contraste de textos: todos de al menos 4.5:1. Limitación: solo leyó el código, no ejecutó nada. Hallazgos BAJOS, todos CORREGIDOS en el commit ae2d843 (ver sección 2):
  1. Borde de campos 2.17:1 y anillo de foco 1.90:1, debajo de 3:1.
  2. Fila en edición poco visible.
  3. Contador sin alto mínimo.
- Tras corregir: 79/79 y los 11 escenarios sin cambios, 0 errores de JavaScript. No se volvió a llamar al revisor: NO VERIFICADO por un segundo revisor.
- Sugerencias de prueba manual del revisor, NO realizadas: foco con Tab en proyector, nombre muy largo y flujo completo con F5. NO VERIFICADO.
- Subagente `probador`: NO se ejecutó en la capa 5. NO VERIFICADO por el probador.
- Pruebas manuales de la usuaria en el navegador: sin registro. NO VERIFICADO. Los escenarios fueron simulados por el agente en Chrome sin ventana.

### Capa 4
- Pruebas automáticas: `node pruebas.js` pasó 70/70 tras construir la capa (17 pruebas nuevas de validación) y 74/74 tras la corrección del revisor (4 pruebas más).
- 11 escenarios con clics simulados en el navegador, hechos por el agente. Se hicieron primero en Edge. Luego la usuaria pidió cambiar el navegador a Chrome y se repitieron todos en Chrome con el mismo resultado. También se repitió en Chrome la persistencia A a E de la capa 3. Escenarios:
  1. Formulario vacío: 4 errores, foco en Nombre, no guarda.
  2. Cantidad "-2": "La cantidad debe ser mayor que 0." El nombre escrito se conserva.
  3. Al corregir el campo, su error desaparece.
  4. Cantidad "1,5": se guarda como 1.5.
  5. Fecha de hoy + 5 años + 1 día: error.
  6. "arroz 9999.5 kg" con la misma fecha del arroz: "Ya tienes 1 kg con esa fecha; el total (10000.5 kg) pasaría de 10000."
  7. Fecha pasada: el ingrediente va a Vencidos.
  8. Nombre `<b>Pan</b>`: se muestra como texto, no como etiqueta.
  9. Editar con el nombre vacío: error, no guarda.
  10. Cancelar limpia los errores.
  11. Demo (aguacate hoy y limón ayer): la primera receta es "Ensalada de aguacate".
- Resultado de los escenarios: 0 errores de JavaScript y 0 `alert(` en el código.
- Capturas en Chrome (inicio, errores y demo), a pedido de la usuaria; el agente también abrió la app en el Chrome de ella. Confirmaron: errores en rojo bajo cada campo; en la demo el aguacate sube como "Vence hoy", el limón va a Vencidos y la primera receta es "Ensalada de aguacate" con "Aprovecha: aguacate (vence hoy)" y "Te falta: limón (vencido)". También mostraron "1 unidades" y una sola columna con botones sin estilo (resueltos en la capa 5).
- Subagente `revisor` (capa 4): APTO PARA PRUEBAS, sin críticos ni altos y sin regresiones en las capas 1 a 3. Limitación: solo leyó el código, no ejecutó nada. Revisó sin hallar problema: "  2 ", "2.", "1,5,2", "1e5", "+5", "-0", años de menos de 4 dígitos, fecha parcial y editar con errores. Hallazgos:
  1. [MEDIO] "0.001" se guardaba como 0. CORREGIDO (ver sección 2, commit f12ceba).
  2. [BAJO] ".5" y "2." se rechazan. Cumple el PLAN. PENDIENTE: respuesta de la usuaria.
  3. [BAJO] el lector de pantalla lee el error dos veces. CORREGIDO en la capa 5.
  4. [BAJO] al editar puede quedar una fila igual a otra. Decisión 3, se deja.
- No se volvió a llamar al revisor tras la corrección del 0.001: NO VERIFICADO por un segundo revisor. La corrección sí se cubrió con las 4 pruebas nuevas (74/74).
- Subagente `probador`: NO se ejecutó en la capa 4. NO VERIFICADO por el probador.
- Pruebas manuales de la usuaria en el navegador: sin registro. NO VERIFICADO. Los escenarios fueron clics simulados por el agente.

### Capa 3 y separación de la lógica
- Prueba de mutación (separación): en una copia de `logica.js` con libra = 453 g y "próximo" = 4 días fallaron exactamente esas 2 pruebas. Conclusión: las pruebas sí detectan errores.
- Pruebas automáticas: `node pruebas.js` pasó 53/53 tras las correcciones del revisor.
- Constantes: un script confirmó que UNIDADES, RECETAS, SEMILLA y CLAVE de `logica.js` son idénticas a las que tenía `index.html`.
- Separación en Edge headless: la página se ve igual que antes (commit 54dbb94).
- Persistencia en Edge headless, con perfil persistente (commit 8b23b19):
  - (A) Primera vez: se guardan 11 ingredientes y 8 recetas.
  - (B) Copia de la app con clics simulados (agregar Mango, eliminar Arroz, editar Leche a 3, sumar 2 a "Tomates"): lo guardado refleja los 4 cambios.
  - (C) Recargar la app real: todo sigue.
  - (D) Despensa vacía guardada: sigue vacía, el ejemplo no reaparece.
  - (E) Valor guardado `{`: aparece el aviso, se carga el ejemplo y los datos quedan reparados.
- Problema durante la verificación: Edge no podía abrir los archivos auxiliares que el agente creó con su herramienta de escritura en la carpeta temporal (error ERR_FILE_NOT_FOUND). El agente lo investigó (icacls) y lo resolvió copiando los archivos desde la terminal. También corrigió su propio script de prueba, porque `cut` no acepta el guion largo como separador.
- Subagente `revisor` (capa 3): APTO PARA PRUEBAS, sin críticos ni altos, y sin diferencias de comportamiento por la separación. Limitación: solo leyó el código, no ejecutó nada. Hallazgos:
  1. [MEDIO] receta guardada con unidad desconocida. CORREGIDO (ver sección 2).
  2. [MEDIO] filas guardadas inválidas mostraban "null undefined". CORREGIDO (ver sección 2).
  3. [BAJO] recetas guardadas ocultan cambios del código. Documentado en PLAN.
  4. [BAJO] PLAN sección 4 desactualizada. CORREGIDO.
  5. [BAJO] ids duplicados y dos pestañas. No se cambia (requiere edición manual).
- Verificación de las correcciones (commit c0cee09): 53/53 pruebas. Con el escenario exacto del revisor (una fila sin cantidad y una receta con unidad "zz") en Edge: aparece el aviso, queda solo la fila válida, vuelven las 8 recetas, hay 0 errores en la consola y localStorage queda reparado.
- No se volvió a llamar al revisor tras estas correcciones: NO VERIFICADO por un segundo revisor.
- Subagente `probador`: NO se ejecutó en esta etapa. NO VERIFICADO por el probador.
- Pruebas manuales de la usuaria en el navegador (persistencia incluida): sin registro. NO VERIFICADO.

### Capa 2
- Pruebas del agente principal: un script Node con 22 comprobaciones, 22/22 OK. Luego se añadió la prueba de regresión del revisor: 23/23 OK. Después del cambio "usar lo que hay", las pruebas se ajustaron y siguen en 23/23 OK.
  - El orden de recetas con la despensa de ejemplo coincide exactamente con la tabla del PLAN.
  - Flujo demo (aguacate hoy + limón ayer): la primera receta es "Ensalada de aguacate" con falta "limón (vencido)".
  - Fusiones, conversiones (tazas, cucharadas) y estados en los límites (hoy, +5, +6, −1) correctos.
- Edge headless (`--dump-dom`) sobre la página real: el queso aparece solo en Vencidos, hay 4 próximos con class="proximo" y las tarjetas son correctas. No hay `alert(`, `innerHTML` ni `http` en el código.
- Clics de Editar, Eliminar y Cancelar: no se pueden probar con ese método. Quedaron para prueba manual de la usuaria. No hay registro de su resultado: NO VERIFICADO. (En la capa 3, los clics de agregar, eliminar, editar y fusionar se simularon en una copia de la app, ver arriba.)
- Subagente `revisor` (capa 2): APTO PARA PRUEBAS. Solo leyó index.html y PLAN.md, no CLAUDE.md (limitación de esa revisión). Hallazgos:
  1. [MEDIO] fusión con cantidad inválida dañaba la fila existente. CORREGIDO (ver sección 2).
  2. [BAJO] editar guarda datos inválidos. Resuelto en la capa 4.
  3. [BAJO] "Aprovecha: tomate" junto a "no alcanza" parecía contradictorio. Llevó a la decisión 13. CORREGIDO.
  4. [BAJO] una pestaña abierta pasada la medianoche no actualiza los estados. No afecta la demo; no se cambió.
- Subagente `probador`: NO se ejecutó en la capa 2 (la usuaria pasó directo al documentador). NO VERIFICADO por el probador.
- No se volvió a llamar al revisor tras el cambio "usar lo que hay": NO VERIFICADO por un segundo revisor.

### Capa 1
- Pruebas con Node, hechas por el agente principal sobre las utilidades: normalizar("  TomátES ") da "tomate"; diasPara(hoyISO()) da 0; el cambio de año y de mes se calcula bien; aBase(1, "libras") da 500 g; mismoNombre Limones/limón da true; tomate/papa da false. Además, index.html no contiene `alert(` ni `http`.
- Subagente `revisor`: APTO PARA PRUEBAS, sin problemas críticos ni altos.
- Subagente `probador`: NO VERIFICADO. No se ejecutó en la capa 1 por decisión de la usuaria, para ahorrar tiempo.
- Se instaló la extensión Live Server en VS Code para probar el HTML en el navegador. No quedó registro de pruebas manuales en el navegador: NO VERIFICADO.
- El revisor dio 5 hallazgos de gravedad BAJA:
  1. Sin validación aún. Resuelto en la capa 4.
  2. render() tenía un return temprano que habría dejado secciones sin pintar al llegar la capa 2. Corregido.
  3. Limitación de plurales en medio del nombre. Pendiente.
  4. La expresión de tildes tenía caracteres invisibles literales en vez de un rango de marcas de tilde escrito como texto. Corregido. (Más tarde, en la separación, se reemplazó por la clase \p{M}.)
  5. Fecha mostrada en crudo. Corregido en la capa 2A (textos "Vence hoy", "Venció ayer", etc.).
- Cómo validamos la corrección: la primera corrección de las tildes no quedó aplicada, porque una edición posterior reescribió el archivo. El agente principal lo detectó revisando con grep, la reaplicó con un script y la verificó con grep y con Node.
- Commits: db823d6 "Capa 1: base" y 3c5d1b4 "Capa 1: escape de tildes". No se volvió a llamar al revisor después de las correcciones: NO VERIFICADO por un segundo revisor.

## Pendientes al cierre
- Decisiones pendientes: ¿aceptar ".5"? y los extras P2 (crear o editar recetas, IA, integraciones). R8 "Cocinar esta receta" ya está hecho.
- Probador: no ejecutado en ninguna capa. NO VERIFICADO.
- Pruebas manuales de la usuaria: sin registro. NO VERIFICADO.
- Cierre según la GUIA: probar los pasos del README desde cero, confirmar el último commit y guardar una copia en USB o Drive. PENDIENTE.

## Bitácora por capa
- Capa 1, Base: terminada. Revisor APTO PARA PRUEBAS. Probador no ejecutado. Commits db823d6 y 3c5d1b4.
- Capa 2, Vencidos y recetas: terminada. Revisor APTO PARA PRUEBAS (1 hallazgo MEDIO corregido). Pruebas Node 23/23 OK y Edge headless sobre la página real. Probador no ejecutado. Clics de Editar, Eliminar y Cancelar: NO VERIFICADO (prueba manual de la usuaria sin registro). Commits dfffb4b "Capa 2: vencidos, recetas sugeridas y actualizar ingredientes" y 6c26e16 "Capa 2: usar lo que hay cuando un ingrediente no alcanza", subidos a GitHub. Documentación guardada en el commit ef20ce9.
- Separación de la lógica (logica.js y pruebas.js, pedida por la usuaria, decisión 14): hecha. Prueba de mutación: las pruebas detectan los errores introducidos. Commit 54dbb94.
- Capa 3, Persistencia: terminada. Revisor APTO PARA PRUEBAS (2 hallazgos MEDIOS corregidos). Pruebas Node 53/53 y verificación de persistencia en Edge headless (A a E). Probador no ejecutado. Pruebas manuales de la usuaria: NO VERIFICADO. Commits 8b23b19 y c0cee09.
- Capa 4, Validaciones: terminada. Revisor APTO PARA PRUEBAS (1 hallazgo MEDIO corregido; ".5" PENDIENTE de respuesta de la usuaria). Pruebas Node 74/74. 11 escenarios con clics simulados en Edge y repetidos en Chrome (con la persistencia A a E), 0 errores JS, 0 `alert(`. Capturas en Chrome. Probador no ejecutado. Pruebas manuales de la usuaria: NO VERIFICADO. Commits c88e73e y f12ceba. Documentación guardada en el commit a85f058.
- Capa 5, Diseño: terminada. Commits 22cf52a y 1bbc5ac. Revisor APTO PARA PRUEBAS (3 hallazgos BAJOS de contraste, foco y edición, corregidos en el commit ae2d843; solo leyó código). Pruebas Node 79/79. Los 11 escenarios de la capa 4 repetidos en Chrome sin ventana, 0 errores JS. Sin desplazamiento horizontal a 1366 px (2 columnas) y a 375 px (1 columna, medido en un marco tras detectar una primera medición inválida de 485 px). Probador no ejecutado. Pruebas manuales de la usuaria: NO VERIFICADO.
- Las 5 capas del PLAN están terminadas. Falta el cierre (ver "Pendientes al cierre").
- Mejoras posteriores (tandas 1 a 3): hechas. Commits 28292d1 a 7e0e2a7. Revisor APTO en la tanda 1 (2 MEDIOS corregidos en 6281307) y en la revisión completa (4 MEDIOS corregidos en 0d00673). Pruebas 117/117. Probador no ejecutado.
