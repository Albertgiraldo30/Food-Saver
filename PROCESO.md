# Cómo trabajamos con los agentes

Proyecto: Food Saver. Estado: capa 1 (Base) de 5 terminada.

## 1. Tarea delegada
- Instrucción: al subagente `arquitecto` se le pidió el PLAN.md (5 capas, 240 minutos). Como CLAUDE.md aún no estaba guardado en disco, el encargo incluyó ENUNCIADO.md y el borrador completo de CLAUDE.md. CLAUDE.md se había llenado antes, con preguntas de opción múltiple a la usuaria, sin inventar datos. Ella decidió, entre otras cosas: las unidades, libra = 500 g, taza = 240 ml, cucharada = 15 ml, próximo a vencer = 0 a 5 días, cantidad mayor que 0 y hasta 10000 con decimales, vencidos en sección aparte, comparar nombre y cantidad, despensa precargada y 8 recetas propuestas por el agente y aprobadas por ella.
- Resultado: el arquitecto entregó un plan de 5 capas con 11 preguntas abiertas. El agente principal guardó el plan en PLAN.md.
- Segunda tarea (capa 1): el agente principal construyó `index.html` con el formulario (novalidate), las secciones Despensa, Vencidos y Recetas, las constantes UNIDADES, RECETAS y SEMILLA, las utilidades puras (normalizar, mismoNombre, hoyISO, sumarDias, diasPara, aBase), la lista ordenada por fecha y nombre, y agregar ingrediente. Aún no hay persistencia (capa 3), validaciones (capa 4), separación de vencidos ni recetas (capa 2).

## 2. Resultado refinado o rechazado
- Qué produjo el agente: el subagente `arquitecto` propuso el PLAN.md con decisiones provisionales: (a) al agregar un ingrediente repetido con fecha distinta, fusionarlo y quedarse con la fecha más próxima; (b) un ingrediente que no alcanza la cantidad no cuenta para mostrar la receta ni para su urgencia; (c) el tope de 10000 solo aplica a lo que se escribe, no al total sumado.
- Por qué no nos sirvió: (a) fusionar fechas distintas pierde información de vencimiento; (b) si un ingrediente próximo a vencer no alcanza, igual conviene sugerir la receta para aprovecharlo, que es el objetivo del reto; (c) el total podía superar el límite válido.
- Cómo lo corregimos: la usuaria respondió las preguntas del arquitecto y se ajustaron CLAUDE.md y PLAN.md: fusión solo con la misma fecha, los ingredientes insuficientes cuentan para la urgencia (se muestran como faltante "no alcanza") y el tope aplica al total. También se fijó una fecha máxima de hoy + 5 años.
- Segundo ajuste, plurales: la regla inicial quitaba solo la "s" final. Al entregar la capa 1, el agente principal advirtió que así "limones" no se igualaba con "limón"; la usuaria decidió quitar también "es". Se agregó la función mismoNombre(a, b) y se actualizaron CLAUDE.md y PLAN.md (decisión 12). Limitación pendiente: "Pechugas de pollo" no es igual a "pechuga de pollo", porque el plural solo se quita al final del nombre.
- Error propio del agente principal: dijo que "Yogur +3 días" quedaría entre Pechuga y Banano. El revisor aclaró que va después de Banano, porque hay empate de fecha y se ordena por nombre. Se corrigió la explicación.
- Revisión de la documentación: el borrador del `documentador` atribuía a la usuaria el hallazgo de los plurales y usaba la ruta local del equipo en el README. El agente principal lo corrigió antes de guardarlo.

## 3. Verificación
- Qué revisamos (revisor / probador / pruebas manuales):
  - Pruebas con Node, hechas por el agente principal sobre las utilidades: normalizar("  TomátES ") da "tomate"; diasPara(hoyISO()) da 0; el cambio de año y de mes se calcula bien; aBase(1, "libras") da 500 g; mismoNombre Limones/limón da true; tomate/papa da false. Además, index.html no contiene `alert(` ni `http`.
  - Subagente `revisor`: veredicto APTO PARA PRUEBAS, sin problemas críticos ni altos.
  - Subagente `probador`: NO VERIFICADO. No se ejecutó en la capa 1 por decisión de la usuaria, para ahorrar tiempo. No hay resultados de pruebas del probador.
  - Se instaló la extensión Live Server en VS Code para probar el HTML en el navegador. No quedó registro de pruebas manuales en el navegador: NO VERIFICADO.
- Qué encontramos: el revisor dio 5 hallazgos de gravedad BAJA:
  1. Sin validación aún (se hace en la capa 4). Pendiente.
  2. render() tenía un return temprano que habría dejado secciones sin pintar al llegar la capa 2. Corregido.
  3. Limitación de plurales en medio del nombre. Pendiente.
  4. La expresión de tildes tenía caracteres invisibles literales en vez de `̀-ͯ`. Corregido.
  5. Fecha mostrada en crudo (se mejora en la capa 2A). Pendiente.
- Cómo validamos la corrección:
  - La primera corrección de las tildes no quedó aplicada, porque una edición posterior reescribió el archivo. El agente principal lo detectó revisando con grep, la reaplicó con un script y la verificó con grep y con Node.
  - Commits: db823d6 "Capa 1: base" y 3c5d1b4 "Capa 1: escape de tildes".
  - No se volvió a llamar al revisor después de las correcciones: NO VERIFICADO por un segundo revisor.

## Bitácora por capa
- Capa 1, Base: terminada. Revisor APTO PARA PRUEBAS. Probador no ejecutado. Commits db823d6 y 3c5d1b4.
- Capa 2, Vencidos y recetas: PENDIENTE.
- Capa 3, Persistencia: PENDIENTE.
- Capa 4, Validaciones: PENDIENTE.
- Capa 5, Diseño: PENDIENTE.
