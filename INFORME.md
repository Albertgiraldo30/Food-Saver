# Food Saver: cómo lo construimos

**Reto:** aprovechar los ingredientes antes de que venzan (Prompt & Solve, ITM)
**Código y documentos:** https://github.com/Albertgiraldo30/Food-Saver
**Para probarla:** doble clic en `index.html`. Para ver las pruebas: `node pruebas.js` (117 de 117 pasan).

---

## La idea

En casa pasa siempre lo mismo: compramos, guardamos, se nos olvida, y una semana después el tomate está blando y el queso tiene moho. No es falta de ganas; es que nadie lleva la cuenta de qué vence primero.

Food Saver lleva esa cuenta por nosotros. Anotas lo que tienes y la app te dice, con colores y con palabras, qué tienes que usar ya. Luego te propone recetas pensadas justamente para gastar eso primero, te dice qué te falta, descuenta lo que cocinaste y, al final, te arma la lista de compras.

Queríamos que fuera algo que una persona usara de verdad en su cocina, no solo una lista de ingredientes con fechas.

---

## Cómo trabajamos con la IA

Desde el principio nos pusimos una regla: **la IA no inventa, pregunta**. Antes de escribir una sola línea de código, le pedimos a Claude que nos hiciera todas las preguntas necesarias para llenar el `CLAUDE.md`, el archivo donde quedan los requisitos del proyecto.

Y así fue. En cinco rondas de preguntas de opción múltiple decidimos cosas como:

- Qué unidades usar, y que **una libra son 500 gramos**, como se compra en Colombia.
- Cuántos días antes del vencimiento un ingrediente cuenta como "próximo".
- Qué cantidades son inválidas (cero, negativos, texto, más de 10 000).
- Que los vencidos fueran a una sección aparte.
- Que la app arrancara con una despensa de ejemplo.

Las 8 recetas y la despensa de ejemplo las propuso Claude, pero no entraron hasta que nosotros las aprobamos.

Después le pedimos a un subagente, el **arquitecto**, que armara el plan. Nos entregó un plan de 5 capas (base, flujo principal, persistencia, validaciones y diseño), cada una con tareas y con criterios para saber cuándo estaba terminada. Y nos dejó 11 preguntas abiertas.

A partir de ahí el ritmo fue siempre el mismo:

1. **Construir** una capa, una sola a la vez.
2. **Probar** con pruebas automáticas y simulando clics en Chrome.
3. Pedirle al subagente **revisor** que buscara errores.
4. **Corregir** lo que encontraba.
5. **Guardar** en git y subir a GitHub.
6. Pedirle al subagente **documentador** que dejara constancia.

Antes de cada cambio, Claude nos explicaba su plan en tres líneas. Después de cada cambio, nos decía exactamente cómo probarlo en el navegador.

---

## Lo que le dijimos que no

Esta parte nos parece la más importante, porque muestra que no aceptamos todo lo que la IA proponía.

**El plan del arquitecto traía tres decisiones que rechazamos:**

1. **Fusionar ingredientes con fechas distintas.** Proponía que si agregabas tomate que vence mañana y tomate que vence en 10 días, se juntaran en una sola fila con la fecha más cercana. Dijimos que no: se pierde información. Hoy solo se juntan si la fecha es la misma.
2. **Ignorar los ingredientes que no alcanzan.** Proponía que, si una receta pide 3 tomates y tienes 1, ese tomate no contara. Pero ese tomate se va a dañar: justo es el que queremos aprovechar. Lo cambiamos.
3. **Aplicar el máximo de 10 000 solo a lo que escribes.** Si ya tenías 9 999 y agregabas 5, el total se pasaba. Pedimos que el tope aplicara también a la suma.

**Más adelante pasó algo parecido.** Le pedimos "cuando un ingrediente no alcance, ajusta la receta con los demás". Claude no adivinó qué queríamos decir. Nos mostró dos opciones con ejemplos: achicar toda la receta, o usar lo que hay y dejar el resto igual. Elegimos la segunda, y desde entonces las recetas dicen cosas como "tomate 1 de 3 unidades".

---

## Lo que construimos

Cumplimos todo lo que pedía el enunciado:

- **Agregar y actualizar ingredientes.**
- **Ordenarlos por vencimiento** y destacar los que deben usarse primero.
- **Sugerir recetas** con lo que hay.
- **Mostrar qué falta** en cada receta.
- **Rechazar cantidades inválidas.**
- **Separar los vencidos** y excluirlos de las recetas.
- **No perder nada al recargar** la página.

Y le agregamos cosas que se nos fueron ocurriendo mientras la usábamos. Estas son ideas nuestras:

- **Conversión de unidades.** Si una receta pide 500 ml de leche y tienes 1 litro, la app entiende que alcanza.
- **Nombres flexibles.** "Limones" y "limón" son lo mismo; tampoco importan las mayúsculas ni las tildes.
- **Colores con texto.** Rojo para vencido, naranja para lo que vence en 3 días o menos, verde para lo que está bien. Siempre con la palabra escrita, para quien no distingue colores.
- **Un resumen arriba:** cuántos vencen pronto, cuántos están vencidos y cuántas recetas puedes hacer.
- **Editar en una ventana aparte** y confirmar antes de borrar, sin las ventanas feas del navegador.
- **Avisos breves** en la esquina: verde cuando algo salió bien, gris cuando se borró algo, rojo cuando hay un error.
- **Unidades con su nombre completo:** "1 libra", "250 gramos", "2 cucharadas".
- **"Cociné esta receta":** le dices cuánto usaste de cada cosa, y la app lo descuenta. Empieza por lo que vence antes, nunca toca lo vencido y nunca deja cantidades negativas. Si algo se acaba, pasa a "Agotados".
- **Lista de compras automática** con lo agotado, lo vencido y lo que les falta a las recetas que marques como "Quiero hacerla". Tiene casillas para ir tachando y un botón para copiarla y mandarla por WhatsApp.
- **Botón para volver a los datos de ejemplo**, útil para repetir la demostración.
- **Detalles de acabado:** animaciones suaves, la fila nueva brilla un momento y funciona en celular.

---

## Lo que salió mal (y cómo lo arreglamos)

No todo salió bien a la primera. Tampoco lo que hizo la IA. Registramos 20 errores; estos son los que más nos enseñaron.

### Los caracteres invisibles
En la primera capa, la parte del código que quita las tildes quedó guardada con caracteres que no se ven en pantalla. Funcionaba, pero era frágil. Lo encontró el revisor. Claude lo corrigió y luego comprobó si el cambio había quedado. **No había quedado**: otra edición había pisado el archivo. Volvió a corregirlo y esta vez lo verificó buscando el texto exacto en el archivo. Más tarde el documentador volvió a meter esos mismos caracteres en la documentación, y Claude los detectó antes de guardar.

### La prueba que protegía un error
Este es nuestro favorito. Al cocinar "Huevos pericos", la app descuenta 15 ml de aceite de una botella de 1 litro. Deberían quedar 985 ml, pero la app mostraba 0.99 litros, porque redondeaba a dos decimales. Lo peor era que **habíamos escrito una prueba que esperaba 0.99**. Es decir, la prueba no detectaba el error: lo defendía. Lo descubrió el revisor en la revisión final. Lo corregimos (ahora queda 985 ml exactos), cambiamos la prueba y agregamos dos casos más.

### Cuando las pruebas atraparon al agente
Al construir la función de cocinar, Claude pasó el código por la terminal y algunos símbolos se perdieron en el camino. No se veía nada raro a simple vista. **Cuatro pruebas fallaron** y eso lo delató. Desde entonces, los cambios grandes se escribieron primero en un archivo aparte.

### Medir mal y darse cuenta
Para comprobar que la app se veía bien en un celular, Claude midió la página a 375 píxeles de ancho. El resultado decía 485. En vez de aceptarlo, investigó: Chrome sin ventana no baja de ese tamaño. Repitió la medición dentro de un marco de 375 píxeles y ahí sí obtuvo el dato real.

### Otros que valen la pena contar
- Si escribías "abc" como cantidad de algo que ya existía, se dañaba la fila original. Lo encontró el revisor.
- "0.001" pasaba como cantidad válida y se guardaba como cero.
- Una receta guardada con una unidad desconocida rompía toda la sección de recetas.
- Si fallaba el guardado al restaurar los datos de ejemplo, el aviso de error desaparecía.
- Algunos bordes tenían tan poco contraste que en un proyector no se iba a ver qué campo estaba activo. Lo medimos con la fórmula oficial de accesibilidad y lo subimos de 1.9 a 5.1.
- Al cerrar una ventana, el cursor se perdía. Ahora vuelve a donde estabas.
- Claude afirmó mal en qué posición quedaría un ingrediente nuevo en la lista, y el revisor lo corrigió.

Todos los errores, con su causa y su corrección, están en `PROCESO.md`.

---

## Cómo verificamos

No nos quedamos con "parece que funciona". Esto es lo que hicimos:

- **117 pruebas automáticas.** Corren con un solo comando. Cubren el orden de las recetas, las fusiones, las conversiones, las validaciones, el guardado, la cocina y la lista de compras.
- **Comprobamos que las pruebas sirven.** Cambiamos a propósito el valor de la libra y el umbral de "próximo", y fallaron exactamente las pruebas que tenían que fallar.
- **Más de 60 escenarios simulados en Chrome.** Llenar el formulario mal, abrir y cerrar ventanas, cocinar, recargar la página. Tras cada cambio repetíamos los anteriores para asegurarnos de no romper nada. Siempre terminaron con cero errores.
- **Siete revisiones del revisor:** una por capa, una para las mejoras y una revisión completa al final. Cada vez corregimos todo lo que marcó como importante.
- **Capturas de pantalla** en escritorio y en celular, que revisamos a ojo. Salieron tres ajustes de ahí.

**Lo que no verificamos, y preferimos decirlo:**
- El subagente **probador** nunca se ejecutó; decidimos ahorrar ese tiempo.
- El botón **Copiar lista** solo lo probamos simulado.
- No tenemos un registro de nuestras pruebas a mano en un proyector.

---

## Los tres ejemplos que pide el concurso

**Una tarea que delegamos.** Le pedimos al subagente arquitecto el plan completo del proyecto, pasándole el enunciado y el borrador de los requisitos. Nos entregó 5 capas con criterios de aceptación y 11 preguntas abiertas que tuvimos que responder.

**Un resultado que rechazamos.** De ese mismo plan rechazamos tres decisiones: fusionar fechas distintas, ignorar lo que no alcanza y el tope parcial. Las cambiamos por las nuestras.

**Una verificación.** En la revisión final, el revisor encontró que el aceite quedaba en 0.99 litros en vez de 985 ml, y que nuestra propia prueba esperaba ese valor equivocado. Lo corregimos, cambiamos la prueba, agregamos dos casos nuevos y lo confirmamos en el navegador.

---

## La demostración (2 minutos)

Antes de empezar: abrir la app y pulsar **Restaurar datos de ejemplo**.

1. **El problema** (15 s). "Botamos comida porque olvidamos qué vence. Food Saver lleva esa cuenta por nosotros."
2. **La despensa** (20 s). Arriba dice 4 por vencer, 1 vencido y 7 recetas posibles. El queso vencido está aparte y no cuenta para nada.
3. **Registrar** (30 s). Agregamos un aguacate que vence hoy: sube primero, en naranja. Luego un limón que venció ayer: se va a Vencidos. Después intentamos poner −2: la app lo rechaza y explica por qué.
4. **La receta** (25 s). La primera sugerencia ahora es **Ensalada de aguacate**: dice "Aprovecha: aguacate (vence hoy)" y "Te falta: limón (vencido)". Pulsamos "Quiero hacerla" y el limón aparece en la lista de compras.
5. **Cocinar** (20 s). En "Huevos pericos" decimos que usamos 5 huevos. La app descuenta y los huevos bajan de 12 a 7.
6. **Recargar** (10 s). F5, y todo sigue ahí.
7. **Cierre** (20 s). Algo que rechazamos y cómo verificamos: el plan que corregimos y la prueba que defendía un error.

---

## Lo que haríamos distinto

- **Correr el probador desde la primera capa**, en vez de saltarlo para ahorrar tiempo.
- **Escribir las pruebas antes del código, no después.** La prueba del aceite nos enseñó que una prueba escrita mirando el resultado puede terminar protegiendo un error.
- **Decidir antes algunos pendientes** que quedaron abiertos: si se acepta ".5" como cantidad y si agregamos recetas propias.

---

## Limitaciones que conocemos

- Hay que escribir "0.5"; ".5" se rechaza.
- "Pechugas de pollo" no se reconoce como "pechuga de pollo", porque el plural solo se quita al final del nombre.
- Si se cambian las recetas en el código, no se ven hasta pulsar "Restaurar datos de ejemplo".
- Abrir la app con doble clic y abrirla con Live Server guarda los datos por separado.

---

## Dónde está cada cosa

- `ENUNCIADO.md`: el reto tal como nos lo dieron.
- `CLAUDE.md`: los requisitos (R1 a R10) y las reglas de trabajo con la IA.
- `PLAN.md`: el plan por capas y las 25 decisiones que tomamos, con las reemplazadas marcadas.
- `PROCESO.md`: el registro detallado de cada tarea, cada error y cada verificación.
- `index.html`, `logica.js` y `pruebas.js`: la app y sus pruebas.
