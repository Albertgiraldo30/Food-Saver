# Cómo trabajamos con los agentes

Proyecto: Food Saver. Estado: capas 1 (Base) y 2 (Vencidos y recetas) de 5 terminadas.

## 1. Tarea delegada
- Instrucción: al subagente `arquitecto` se le pidió el PLAN.md (5 capas, 240 minutos). Como CLAUDE.md aún no estaba guardado en disco, el encargo incluyó ENUNCIADO.md y el borrador completo de CLAUDE.md. CLAUDE.md se había llenado antes, con preguntas de opción múltiple a la usuaria, sin inventar datos. Ella decidió, entre otras cosas: las unidades, libra = 500 g, taza = 240 ml, cucharada = 15 ml, próximo a vencer = 0 a 5 días, cantidad mayor que 0 y hasta 10000 con decimales, vencidos en sección aparte, comparar nombre y cantidad, despensa precargada y 8 recetas propuestas por el agente y aprobadas por ella.
- Resultado: el arquitecto entregó un plan de 5 capas con 11 preguntas abiertas. El agente principal guardó el plan en PLAN.md.
- Segunda tarea (capa 1): el agente principal construyó `index.html` con el formulario (novalidate), las secciones Despensa, Vencidos y Recetas, las constantes UNIDADES, RECETAS y SEMILLA, las utilidades puras (normalizar, mismoNombre, hoyISO, sumarDias, diasPara, aBase), la lista ordenada por fecha y nombre, y agregar ingrediente.
- Tercera tarea (capa 2): el agente principal construyó la capa 2 en tres partes.
  - 2A: vencidos en sección aparte, en rojo; próximos (0 a 5 días) destacados en naranja; textos "Vence hoy / mañana / en N días" y "Venció ayer / hace N días".
  - 2B: las funciones evaluarReceta y sugerirRecetas. Suman todas las filas no vencidas del ingrediente con conversión de unidades. Orden: usa algo próximo a vencer, menos días, menos faltantes, orden original. La tarjeta muestra "Aprovecha:", "Usa:", "Te falta:" (con motivo: "no está", "vencido", "unidad no compatible") y "Preparación:". El motivo del faltante estaba como P2 y el agente lo adelantó; se informó a la usuaria.
  - 2C: editar (reusa el formulario, botones "Guardar cambios" y "Cancelar", nunca fusiona), eliminar (también en Vencidos) y fusionar al agregar solo con mismo nombre, tipo de unidad y fecha.
- Aún no hay persistencia (capa 3) ni validaciones (capa 4).

## 2. Resultado refinado o rechazado

### Ejemplo más claro (capa 2): "usar lo que hay"
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

### Revisión de la documentación (capa 2)
- El borrador del `documentador` para la capa 2 volvió a escribir la expresión de tildes con caracteres invisibles (el mismo error del hallazgo 4 de la capa 1). El agente principal lo detectó al revisar el texto, lo corrigió con un script y lo verificó con grep antes del commit.

### Capa 1
- Qué produjo el agente: el subagente `arquitecto` propuso el PLAN.md con decisiones provisionales: (a) al agregar un ingrediente repetido con fecha distinta, fusionarlo y quedarse con la fecha más próxima; (b) un ingrediente que no alcanza la cantidad no cuenta para mostrar la receta ni para su urgencia; (c) el tope de 10000 solo aplica a lo que se escribe, no al total sumado.
- Por qué no nos sirvió: (a) fusionar fechas distintas pierde información de vencimiento; (b) si un ingrediente próximo a vencer no alcanza, igual conviene sugerir la receta para aprovecharlo, que es el objetivo del reto; (c) el total podía superar el límite válido.
- Cómo lo corregimos: la usuaria respondió las preguntas del arquitecto y se ajustaron CLAUDE.md y PLAN.md: fusión solo con la misma fecha, los ingredientes insuficientes cuentan para la urgencia y el tope aplica al total. También se fijó una fecha máxima de hoy + 5 años. (La parte de "no alcanza" como faltante se cambió después en la capa 2, ver arriba.)
- Segundo ajuste, plurales: la regla inicial quitaba solo la "s" final. Al entregar la capa 1, el agente principal advirtió que así "limones" no se igualaba con "limón"; la usuaria decidió quitar también "es". Se agregó la función mismoNombre(a, b) y se actualizaron CLAUDE.md y PLAN.md (decisión 12). Limitación pendiente: "Pechugas de pollo" no es igual a "pechuga de pollo", porque el plural solo se quita al final del nombre.
- Error propio del agente principal: dijo que "Yogur +3 días" quedaría entre Pechuga y Banano. El revisor aclaró que va después de Banano, porque hay empate de fecha y se ordena por nombre. Se corrigió la explicación.
- Revisión de la documentación: el borrador del `documentador` atribuía a la usuaria el hallazgo de los plurales y usaba la ruta local del equipo en el README. El agente principal lo corrigió antes de guardarlo.

## 3. Verificación

### Capa 2
- Pruebas del agente principal: un script Node con 22 comprobaciones, 22/22 OK. Luego se añadió la prueba de regresión del revisor: 23/23 OK. Después del cambio "usar lo que hay", las pruebas se ajustaron y siguen en 23/23 OK.
  - El orden de recetas con la despensa de ejemplo coincide exactamente con la tabla del PLAN.
  - Flujo demo (aguacate hoy + limón ayer): la primera receta es "Ensalada de aguacate" con falta "limón (vencido)".
  - Fusiones, conversiones (tazas, cucharadas) y estados en los límites (hoy, +5, +6, −1) correctos.
- Edge headless (`--dump-dom`) sobre la página real: el queso aparece solo en Vencidos, hay 4 próximos con class="proximo" y las tarjetas son correctas. No hay `alert(`, `innerHTML` ni `http` en el código.
- Clics de Editar, Eliminar y Cancelar: no se pueden probar con ese método. Quedaron para prueba manual de la usuaria. No hay registro de su resultado: NO VERIFICADO.
- Subagente `revisor` (capa 2): APTO PARA PRUEBAS. Solo leyó index.html y PLAN.md, no CLAUDE.md (limitación de esa revisión). Hallazgos:
  1. [MEDIO] fusión con cantidad inválida dañaba la fila existente. CORREGIDO (ver sección 2).
  2. [BAJO] editar guarda datos inválidos. Pendiente, capa 4.
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
  1. Sin validación aún (capa 4). Pendiente.
  2. render() tenía un return temprano que habría dejado secciones sin pintar al llegar la capa 2. Corregido.
  3. Limitación de plurales en medio del nombre. Pendiente.
  4. La expresión de tildes tenía caracteres invisibles literales en vez del rango escrito como texto (barra-u 0300 a barra-u 036f). Corregido.
  5. Fecha mostrada en crudo. Corregido en la capa 2A (textos "Vence hoy", "Venció ayer", etc.).
- Cómo validamos la corrección: la primera corrección de las tildes no quedó aplicada, porque una edición posterior reescribió el archivo. El agente principal lo detectó revisando con grep, la reaplicó con un script y la verificó con grep y con Node.
- Commits: db823d6 "Capa 1: base" y 3c5d1b4 "Capa 1: escape de tildes". No se volvió a llamar al revisor después de las correcciones: NO VERIFICADO por un segundo revisor.

## Bitácora por capa
- Capa 1, Base: terminada. Revisor APTO PARA PRUEBAS. Probador no ejecutado. Commits db823d6 y 3c5d1b4.
- Capa 2, Vencidos y recetas: terminada. Revisor APTO PARA PRUEBAS (1 hallazgo MEDIO corregido). Pruebas Node 23/23 OK y Edge headless sobre la página real. Probador no ejecutado. Clics de Editar, Eliminar y Cancelar: NO VERIFICADO (prueba manual de la usuaria sin registro). Commits dfffb4b "Capa 2: vencidos, recetas sugeridas y actualizar ingredientes" y 6c26e16 "Capa 2: usar lo que hay cuando un ingrediente no alcanza", subidos a GitHub.
- Capa 3, Persistencia: PENDIENTE.
- Capa 4, Validaciones: PENDIENTE.
- Capa 5, Diseño: PENDIENTE.
