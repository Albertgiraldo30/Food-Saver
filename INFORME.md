# Informe para el jurado — Food Saver

**Reto:** Food Saver — aprovechar los ingredientes antes de que venzan (Prompt & Solve, ITM).
**Repositorio:** https://github.com/Albertgiraldo30/Food-Saver (rama `main`, 34 commits).
**Cómo abrirla:** doble clic en `index.html` (Chrome). Sin instalar nada, sin internet, sin librerías.
**Cómo verificarla:** `node pruebas.js` → **117 pruebas, 117 bien, 0 mal**.

Este informe explica qué construimos, cómo trabajamos con el agente de IA (Claude Code y sus subagentes), qué decidimos, qué salió mal y cómo lo corregimos. Está ordenado según los criterios de la rúbrica.

---

## 1. Resumen en una página

| | |
|---|---|
| **Problema** | Los hogares botan comida porque olvidan qué está por vencer. |
| **Solución** | Una despensa que ordena por vencimiento, separa vencidos y agotados, sugiere recetas que aprovechan primero lo que vence antes, dice qué falta, descuenta lo que se cocina y arma la lista de compras. |
| **Stack** | `index.html` (pantalla) + `logica.js` (funciones puras, 45 funciones) + `pruebas.js` (117 pruebas). JavaScript puro, localStorage. |
| **Forma de trabajo** | CLAUDE.md con requisitos confirmados → plan por capas del subagente `arquitecto` → una capa a la vez → `revisor` → corrección → commit → `documentador`. |
| **Verificación** | 117 pruebas automáticas, prueba de mutación, más de 60 escenarios con clics simulados en Chrome sin ventana, 7 revisiones del subagente `revisor`, capturas de pantalla revisadas. |
| **Errores encontrados y corregidos** | 20 documentados en la sección 7 (incluye errores del propio agente). |

---

## 2. Cobertura de la rúbrica (dónde está la evidencia)

| Criterio (peso) | Qué mostramos | Dónde verlo |
|---|---|---|
| **Demostración funcional (20 %)** | Flujo completo en vivo: registrar ingredientes, ver próximos y vencidos, rechazar una cantidad inválida, primera receta que aprovecha lo que vence hoy, cocinarla, lista de compras, F5 sin perder nada. | Sección 3 (guion de demo), `index.html` |
| **Resolución del problema (15 %)** | Los 4 requisitos y las 2 reglas del enunciado cumplidos, más el ciclo completo despensa → receta → compras. | Sección 4, `CLAUDE.md` R1–R10 |
| **Experiencia de usuario y acabado (15 %)** | Errores bajo cada campo (nunca `alert()`), toasts, modales propios, colores con etiqueta de texto, nombres completos de unidades, 2 columnas / 1 en celular, foco y teclado cuidados, contraste medido. | Sección 5, capturas |
| **Descomposición de tareas (15 %)** | Plan de 5 capas con criterios de aceptación; luego pedidos en pasos numerados con un commit por paso y "si algo falla, detente". 34 commits pequeños. | Sección 6, `PLAN.md`, `git log` |
| **Gestión del contexto (15 %)** | CLAUDE.md llenado con preguntas (sin inventar), PLAN.md con 25 decisiones, cada encargo a subagentes con archivos, cambios y resultados previos; reglas actualizadas cuando cambiaron. | Sección 8 y 9, `CLAUDE.md`, `PLAN.md` |
| **Verificación y depuración (20 %)** | Pruebas, mutación, simulación en navegador, revisor en cada capa, errores investigados con causa raíz y corrección validada. Lo no verificado está declarado. | Sección 7 y 10, `PROCESO.md` |

---

## 3. Guion de la demostración (2 minutos)

Antes de empezar: abrir `index.html` en Chrome y pulsar **Restaurar datos de ejemplo** (deja la despensa de ejemplo con fechas de hoy).

1. **Problema (15 s).** "Botamos comida porque olvidamos qué vence. Food Saver ordena la despensa por vencimiento y propone recetas para usar primero lo que se va a dañar."
2. **Despensa (20 s).** Arriba, el resumen: *4 vencen pronto, 1 vencido, 7 recetas posibles*. Naranja = vence en 3 días o menos, verde = ok, el queso vencido está aparte en **Vencidos** y no cuenta para recetas.
3. **Registrar (30 s).**
   - `aguacate, 1, unidades, hoy` → toast verde, sube primero como **PRÓXIMO**.
   - `limón, 2, unidades, ayer` → va a **Vencidos**.
   - Cantidad `-2` → **rechazada**: error bajo el campo y toast rojo.
4. **Receta (25 s).** La primera es **Ensalada de aguacate**: "Aprovecha: aguacate (vence hoy)", "Te falta: limón (vencido)". Pulsar **Quiero hacerla** → el limón aparece en la **Lista de compras**.
5. **Cocinar (20 s).** En *Huevos pericos* pulsar **Cociné esta receta**, cambiar huevos a 5, confirmar → "Inventario actualizado"; los huevos bajan de 12 a 7.
6. **Persistencia (10 s).** F5: todo sigue igual.
7. **Cierre (20 s).** "Algo que rechazamos: el plan del agente proponía fusionar ingredientes con fechas distintas; lo cambiamos. Cómo verificamos: 117 pruebas y un revisor que encontró, por ejemplo, que al cocinar el aceite quedaba en 0.99 l en vez de 985 ml."

---

## 4. Requisitos del enunciado → cómo se cumplen

| Enunciado | Cómo lo resolvimos | Prueba |
|---|---|---|
| Conservar datos al recargar | localStorage `foodsaver.v1`: despensa, recetas, recetas marcadas y comprados. Datos dañados → aviso y se reparan. | Pruebas de persistencia; escenarios A–E en Chrome con recarga |
| Ingrediente: nombre, cantidad, unidad, vencimiento | Formulario con 8 unidades (gramos, kilogramos, libras, mililitros, litros, tazas, cucharadas, unidades) | Escenarios de la capa 4 |
| Receta: nombre, ingredientes, preparación | 8 recetas caseras aprobadas por el equipo | `RECETAS` en `logica.js` |
| 1. Agregar y actualizar | Agregar, editar en modal, eliminar con confirmación, fusionar duplicados con misma fecha | Pruebas 4–10, escenarios del modal |
| 2. Ordenar por vencimiento y destacar | Orden por fecha y nombre; PRÓXIMO (0–3 días), OK, VENCIDO, AGOTADO, siempre con texto | Pruebas 18–22 |
| 3. Sugerir recetas | Solo con ingredientes disponibles; primero las que aprovechan lo que vence antes | Prueba 1 (orden exacto de la tabla del PLAN) |
| 4. Ingredientes faltantes | "Te falta" con motivo (no está, vencido, agotado, unidad no compatible); lo que no alcanza se usa parcial ("tomate 1 de 3") | Pruebas 11–16 |
| Rechazar cantidades inválidas | Vacío, 0, negativos, texto, `1e3`, más de 10 000, menos de 0.01; también el total al fusionar | 17 pruebas de validación |
| Vencidos aparte y excluidos | Sección **Vencidos**; nunca se cuentan ni se gastan al cocinar | Pruebas 2–3 y de cocinar |
| Colección pequeña de recetas | 8 recetas | — |
| Demo mínima | Guion de la sección 3 | Escenario "demo" en cada ronda de pruebas |
| Datos ficticios | Despensa de ejemplo con fechas relativas a hoy | `SEMILLA` |

---

## 5. Lo que agregamos por idea propia (más allá del enunciado)

Todo esto lo pidió o decidió el equipo; el agente lo implementó y lo verificó.

1. **Conversión de unidades** entre peso y volumen (libra colombiana = 500 g, taza = 240 ml, cucharada = 15 ml).
2. **Nombres comparados con inteligencia:** sin mayúsculas, tildes ni plural ("Limones" = "limón").
3. **Fusión de duplicados** solo si coinciden nombre, tipo de unidad y fecha (no se pierde información de vencimiento).
4. **"Usar lo que hay":** si un ingrediente no alcanza, la receta lo usa parcialmente en vez de descartarla.
5. **Validación del total** al fusionar (máximo 10 000) y fecha máxima de 5 años.
6. **Despensa precargada** y botón **Restaurar datos de ejemplo** con confirmación.
7. **Resumen arriba:** vencen pronto, vencidos, recetas posibles.
8. **Colores** rojo / naranja (≤3 días) / verde con etiqueta de texto (accesible).
9. **Modal de edición**, **modal de confirmación** propio y **toasts** de 3 s.
10. **Nombres completos de unidades** en singular y plural ("1 libra", "250 gramos").
11. **Acabado:** transiciones de 200 ms, hover, resaltado de lo recién agregado, `prefers-reduced-motion`, 2 columnas / 1 en celular.
12. **"Cociné esta receta":** descuenta lo usado (editable), convierte unidades, gasta primero lo que vence antes, nunca negativos, agotados aparte.
13. **Lista de compras:** agotados + vencidos + faltantes de las recetas marcadas, sin repetir, con casilla de comprado y **Copiar lista**.
14. **Separación lógica / pantalla** (`logica.js` + `pruebas.js`) para poder probar todo con `node pruebas.js`.

---

## 6. Descomposición de tareas

### 6.1 Plan por capas (subagente `arquitecto`)
| Capa | Contenido | Commits |
|---|---|---|
| 0 | CLAUDE.md + PLAN.md | `c740ed3` |
| 1 | Base: formulario, constantes, utilidades, lista ordenada | `db823d6`, `3c5d1b4` |
| 2 | 2A estados, 2B recetas, 2C editar/eliminar/fusionar | `dfffb4b`, `6c26e16` |
| — | Separar `logica.js` y `pruebas.js` | `54dbb94` |
| 3 | Persistencia | `8b23b19`, `c0cee09` |
| 4 | Validaciones con error junto al campo | `c88e73e`, `f12ceba` |
| 5 | Diseño | `22cf52a`, `1bbc5ac`, `ae2d843` |

Cada capa tenía tareas y **criterios de aceptación** comprobables (por ejemplo, la tabla con el orden exacto esperado de las recetas), que se convirtieron en pruebas.

### 6.2 Mejoras en pasos numerados
Después de las 5 capas pedimos mejoras en listas numeradas, siempre con las mismas reglas: **un commit por paso, `node pruebas.js` en verde, si algo falla detente**.
- Tanda 1: restaurar, colores, resumen, avisos (`28292d1` … `f411a36`).
- Tanda 2: nombres de unidad, modal, toasts, acabado (`2081398` … `487a87a`).
- Tanda 3: recetas en vivo (solo verificar), cocinar, lista de compras (`36744ab`, `7e0e2a7`).

### 6.3 Ciclo por capa
`construir → probar (Node + Chrome) → revisor → corregir → commit → push → documentador`. El agente explicaba su plan en máximo 3 líneas antes de cada cambio y decía cómo probarlo en el navegador.

---

## 7. Errores que hubo y cómo los corregimos

| # | Qué pasó | Cómo se detectó | Corrección y validación |
|---|---|---|---|
| 1 | La expresión que quita tildes se guardó con **caracteres invisibles** en vez de texto | `revisor` capa 1 | Se reescribió con un script; verificado con `grep`. Luego se cambió a `\p{M}` |
| 2 | La primera corrección del punto 1 **no quedó**: una edición posterior reescribió el archivo | El agente revisó con `grep` antes de dar por hecho | Se reaplicó con un script y se volvió a verificar |
| 3 | El agente afirmó mal dónde quedaba "Yogur +3 días" | `revisor` | Explicación corregida (empate por nombre) |
| 4 | `render()` terminaba antes de tiempo con la despensa vacía | `revisor` capa 1 | Corregido antes de la capa 2 |
| 5 | Agregar con cantidad "abc" **dañaba** la fila existente (NaN) al fusionar | `revisor` capa 2 (MEDIO) | Solo fusiona filas válidas; prueba de regresión |
| 6 | Una receta guardada con unidad desconocida lanzaba **TypeError** | `revisor` capa 3 (MEDIO) | `recetaValida`; escenario exacto reproducido en el navegador: 0 errores |
| 7 | Filas guardadas inválidas mostraban "null undefined" | `revisor` capa 3 (MEDIO) | Se descartan con aviso |
| 8 | "0.001" pasaba la validación y se guardaba como **0** | `revisor` capa 4 (MEDIO) | "La cantidad mínima es 0.01." + 4 pruebas |
| 9 | Bordes y foco con **contraste 1.9:1–2.2:1** (mínimo 3:1) | `revisor` capa 5 | 3.6:1 y 5.1:1, calculado con un script |
| 10 | Al restaurar, si fallaba el guardado, **el aviso de error se ocultaba** | `revisor` mejoras (MEDIO) | Se oculta antes de guardar; probado forzando el fallo |
| 11 | Tab salía del modal de confirmación | `revisor` (MEDIO) | Foco atrapado; verificado con Tab y Shift+Tab simulados |
| 12 | Al cerrar el modal **se perdía el foco** | El agente, en su prueba en Chrome | Vuelve al botón "Editar" de la fila |
| 13 | Edge no podía abrir los archivos de prueba (`ERR_FILE_NOT_FOUND`) | El agente investigó con `icacls` | Se crean desde la terminal |
| 14 | La medición "a 375 px" daba 485 px (Chrome sin ventana no baja de ese ancho) | El agente leyó el dato y no lo aceptó | Se midió dentro de un marco de 375 px |
| 15 | Dos funciones nuevas **perdieron las barras invertidas** de sus expresiones regulares | **Las pruebas fallaron (4)** | Corregido; desde entonces los scripts van en archivos |
| 16 | Una prueba esperaba "aceite 0.99 l": **la prueba consolidaba un error** de redondeo (debía quedar 0.985 l) | `revisor` revisión completa (MEDIO) | Ahora queda 985 ml; prueba corregida + 2 casos nuevos |
| 17 | Recetas guardadas sin id rompían "Quiero hacerla" | `revisor` revisión completa | Id entero y único obligatorio + prueba |
| 18 | Editar un agotado mostraba "0" y un error confuso | `revisor` revisión completa | Modal "Reponer ingrediente" con cantidad vacía |
| 19 | El `documentador` atribuyó hallazgos a quien no era, metió caracteres invisibles 2 veces y dejó frases desactualizadas | El agente principal revisó cada borrador | Corregido antes de guardar; anotado en PROCESO.md |
| 20 | Al cambiar ids del formulario, los scripts de prueba del agente dejaron de funcionar | Salida vacía en la regresión | Scripts actualizados y vueltos a correr |

---

## 8. Decisiones del equipo (resumen de PLAN.md)

Todas las decisiones las tomó el equipo; el agente preguntaba con opciones en lugar de suponer.

| Tema | Decisión |
|---|---|
| Unidades | 8 unidades; libra = 500 g (Colombia), taza = 240 ml, cucharada = 15 ml |
| Próximo a vencer | Primero 0–5 días; luego **0–3 días en toda la app** (decisión 17) |
| Cantidad válida | > 0, ≤ 10 000, decimales con punto o coma; tope también tras fusionar |
| Fecha | Obligatoria, real, pasada permitida (va a Vencidos), máximo hoy + 5 años |
| Nombres | Ignorar mayúsculas, tildes, espacios y plural "s"/"es" |
| Fusión | Solo misma fecha (rechazamos la propuesta del arquitecto de quedarse con la más próxima) |
| No alcanza | Primero "faltante"; luego **"usar lo que hay"** (decisión 13) |
| Stack | De "un solo index.html" a `index.html` + `logica.js` + `pruebas.js` (decisión 14) |
| Persistencia | Despensa **y** recetas (decisión 15), luego también recetas marcadas y comprados |
| Restaurar | Primero no; luego sí, con confirmación propia (decisión 16) |
| Resumen | "Recetas posibles" = todas las sugeridas |
| Cocinar | Solo sin faltantes; cantidad usada editable; en 0 queda **Agotado** en sección aparte |
| Lista de compras | Lo que no alcanza entra con lo que falta; copiar solo lo pendiente |
| Navegador | Las pruebas pasaron de Edge a **Chrome** a pedido del equipo |
| Pendientes sin decidir | Extras P2 (crear recetas, IA, integraciones) y aceptar ".5" |

---

## 9. Gestión del contexto

- **Sin inventar:** el agente llenó `CLAUDE.md` con 5 rondas de preguntas de opción múltiple (usuario, unidades, umbrales, recetas, despensa de ejemplo, flujo de demo). Las recetas y los datos de ejemplo los propuso y nosotros los aprobamos.
- **Fuentes únicas de verdad:** `ENUNCIADO.md` (reto), `CLAUDE.md` (requisitos R1–R10, stack, validaciones, reglas de trabajo), `PLAN.md` (capas y 25 decisiones numeradas, las reemplazadas marcadas).
- **Contexto completo a cada subagente:** los subagentes no ven la conversación, así que cada encargo incluía la capa, lo que cambió, lo que está fuera de alcance (para que no lo marcaran como error) y los resultados de las pruebas ya hechas. Por ejemplo, al `arquitecto` se le pasó el borrador completo de CLAUDE.md porque aún no estaba en disco.
- **Reglas actualizadas cuando cambiaron:** cada cambio de decisión se reflejó en CLAUDE.md, PLAN.md y las pruebas en el mismo commit (por ejemplo, el umbral de 5 a 3 días).
- **Memoria del agente:** guardamos preferencias de trabajo ("preguntar, no inventar", "probar en Chrome") para que se respeten en sesiones futuras.

### Prompts principales que usamos
1. *"Comencemos a organizar el CLAUDE.md con todos los requisitos; antes de iniciar o durante el proceso pregúntame todo lo necesario, no inventes nada."*
2. *"Ahora utiliza @agentes/arquitecto.md para que realice el plan y lo organice."*
3. *"Haz la capa 1 del PLAN.md."* (y así cada capa)
4. *"Sí, que también quite 'es', por ejemplo Limon-es."*
5. *"Cuando el ingrediente no alcanza, ajustar la receta con los demás ingredientes."* (el agente preguntó qué significaba antes de hacerlo)
6. *"Pero el nombre no lo está pidiendo como obligatorio?"* (observación nuestra; se resolvió en la capa 4)
7. *"Crea logica.js con las funciones puras y pruebas.js con los 23 casos, que se ejecute con node pruebas.js. index.html debe usar logica.js. Después: capa 3, persistencia."*
8. *"Agrega, una por una, con commit después de cada una y sin romper node pruebas.js: restaurar, colores, resumen, avisos. Para si algo falla; no avances."*
9. *"Objetivo: hacer la app más dinámica y profesional SIN romper lo que funciona… 0. nombres de unidades, 1. modal, 2. toasts, 3. acabado."*
10. *"Cambia el navegador a Chrome."*
11. *"Objetivo: cerrar el ciclo despensa → receta → compras… 1. recetas en vivo (primero verifica), 2. cocinar receta, 3. lista de compras."*
12. *"Listo, revisa todo."* / *"Revisa la capa N con el revisor."*

---

## 10. Verificación

| Tipo | Qué | Resultado |
|---|---|---|
| Pruebas automáticas | `node pruebas.js` (lógica pura) | **117 / 117** |
| Prueba de mutación | Libra = 453 g y "próximo" = 4 días en una copia | Fallaron exactamente esas 2 pruebas: las pruebas sí detectan errores |
| Navegador | Chrome sin ventana con clics simulados: validaciones (11), persistencia (5), modal (17), toasts, acabado, cocinar, lista de compras, recetas en vivo | 0 errores de JavaScript en todas las rondas |
| Diseño | Ancho 1366 px (2 columnas) y 375 px real (1 columna) | Sin desplazamiento horizontal |
| Contraste | Calculado con la fórmula WCAG | Textos ≥ 4.5:1; bordes y foco ≥ 3:1 |
| Revisión de código | Subagente `revisor` en las 5 capas, en las mejoras y en una revisión completa | 7 revisiones, todas "APTO PARA PRUEBAS"; todos los MEDIOS corregidos |
| Capturas | Escritorio, celular, errores, modal, demo | Revisadas a ojo; generaron 3 ajustes |

**Lo que NO verificamos (honestidad):**
- El subagente `probador` no se ejecutó (decidimos ahorrar tiempo).
- El portapapeles real de "Copiar lista" solo se probó simulado.
- No hay registro de pruebas manuales nuestras en un proyector.

---

## 11. Los 3 ejemplos que pide el concurso

1. **Tarea delegada:** al subagente `arquitecto` le pedimos el PLAN.md de 5 capas en 240 minutos, con el enunciado y el borrador de CLAUDE.md. Entregó capas con criterios de aceptación y 11 preguntas abiertas.
2. **Resultado rechazado o refinado:** el arquitecto propuso fusionar ingredientes con fechas distintas quedándose con la más próxima, no contar ingredientes insuficientes y aplicar el tope solo a lo escrito; **rechazamos las tres**. Más tarde, ante "ajustar la receta", el agente no adivinó: preguntó entre reducir la receta o usar lo que hay, y elegimos "usar lo que hay".
3. **Verificación:** en la revisión completa, el `revisor` encontró que al cocinar el aceite quedaba en 0.99 l en vez de 0.985 l, y que **nuestra propia prueba esperaba 0.99**, o sea que la prueba protegía el error. Lo corregimos (queda 985 ml), cambiamos la prueba, agregamos dos casos (1.5 kg − 1 g; 0.01 libras − 3 g) y lo validamos en el navegador.

---

## 12. Limitaciones conocidas
- ".5" y "2." se rechazan (hay que escribir "0.5" y "2"); pendiente de decisión.
- "Pechugas de pollo" no se reconoce como "pechuga de pollo" (el plural solo se quita al final).
- Las recetas guardadas ocultan cambios hechos en el código hasta pulsar Restaurar.
- Si la pestaña queda abierta pasada la medianoche, los estados se actualizan con el siguiente cambio.
- Abrir con doble clic y con Live Server guarda datos por separado.
