# Food Saver

Aplicación web para no desperdiciar comida. Registra la despensa con fechas de vencimiento, separa vencidos y agotados, destaca lo que vence pronto, sugiere recetas que aprovechan primero lo que vence antes, descuenta lo que cocinas y arma la lista de compras. Los datos se guardan en el navegador.

Repositorio: https://github.com/Albertgiraldo30/Food-Saver (rama main)
Informe para el jurado: [INFORME.md](INFORME.md) · Evidencias del trabajo con el agente: [PROCESO.md](PROCESO.md)

## Cómo abrirla
1. Descarga o clona el repositorio. `index.html` y `logica.js` deben estar en la misma carpeta.
2. Doble clic en `index.html` (recomendado: Chrome). No hay que instalar nada ni tener internet.
3. Opcional: VS Code con Live Server (clic derecho en `index.html` > "Open with Live Server").

Aviso: los datos de `file://` (doble clic) y de Live Server (`http://127.0.0.1`) se guardan por separado. Usa siempre la misma forma.

## Cómo correr las pruebas
Con Node.js instalado, en la carpeta del proyecto: `node pruebas.js` → debe terminar con **117 bien, 0 mal**.

## Qué hace
- **Agregar** ingrediente (nombre, cantidad, unidad, fecha). Errores bajo cada campo y toast rojo; nunca `alert()`.
- **Editar** en una ventana modal (Esc, ✕ o clic fuera para cerrar). Un agotado se edita como "Reponer ingrediente".
- **Eliminar** con confirmación propia.
- **Fusión:** si agregas el mismo ingrediente (nombre, tipo de unidad y fecha), se suma.
- **Colores con texto:** VENCIDO (rojo, sección aparte), PRÓXIMO (naranja, vence en 3 días o menos), OK (verde), AGOTADO (gris, sección aparte).
- **Resumen arriba:** vencen pronto, vencidos y recetas posibles.
- **Recetas sugeridas**, recalculadas al instante: primero las que aprovechan lo que vence antes. Cada tarjeta muestra Aprovecha, Usa, Te falta (con motivo) y Preparación. Si algo no alcanza, se usa lo que hay ("tomate 1 de 3 unidades").
- **Cociné esta receta** (solo sin faltantes): ajustas la cantidad usada de cada ingrediente y se descuenta de la despensa, convirtiendo unidades, sin usar vencidos y sin negativos. En 0, el ingrediente pasa a Agotados.
- **Lista de compras** automática: agotados, vencidos y faltantes de las recetas que marques con "Quiero hacerla" (lo que no alcanza, con la cantidad que falta). Casilla de comprado y botón **Copiar lista** (solo lo pendiente).
- **Restaurar datos de ejemplo** con confirmación.
- **Toasts** de 3 s: verde (agregado, guardado, inventario actualizado), gris (eliminado), rojo (errores).
- Unidades con nombre completo en singular o plural: gramos, kilogramos, libras, mililitros, litros, tazas, cucharadas, unidades.
- Diseño en 2 columnas (portátil) y 1 columna (celular), transiciones suaves, hover y foco visible.

## Flujo de la demo
1. Pulsa **Restaurar datos de ejemplo**.
2. Agrega `aguacate, 1, unidades, hoy` → sube como PRÓXIMO.
3. Intenta agregar `limón, 2, unidades, ayer` → se rechaza: un producto nuevo no puede estar vencido.
4. Intenta cantidad `-2` → se rechaza con error junto al campo.
5. La primera receta es **Ensalada de aguacate** ("Aprovecha: aguacate", "Te falta: limón (no está)"). Pulsa **Quiero hacerla**.
6. Cocina **Huevos pericos** con 5 huevos → "Inventario actualizado".
7. F5: todo sigue ahí.

## Reglas
- Cantidad: mayor que 0 (mínimo 0.01) y hasta 10 000, con punto o coma. Al fusionar, el total tampoco pasa de 10 000.
- Fecha: obligatoria y real; un producto nuevo debe vencer hoy o después (al editar se permite una fecha pasada); máximo hoy + 5 años. Lo que ya está en la despensa pasa solo a Vencidos cuando llega su fecha.
- Nombres: ignoran mayúsculas, tildes, espacios y la "s" o "es" final ("Limones" = "limón").
- Conversiones: 1 kg = 1000 g; 1 libra = 500 g; 1 l = 1000 ml; 1 taza = 240 ml; 1 cucharada = 15 ml.

## Datos de ejemplo (ficticios)
queso 200 g (vencido ayer), tomate 4 unidades (+1 día), leche 1 l (+2), pechuga de pollo 1 libra (+2), banano 3 unidades (+3), cebolla 3 (+7), huevo 12 (+10), papa 6 (+14), pasta 500 g (+90), aceite 1 l (+120), arroz 1 kg (+180). 8 recetas fijas.

## Archivos
- `index.html`: pantalla y persistencia (localStorage, clave `foodsaver.v1`).
- `logica.js`: constantes y funciones puras (validaciones, recetas, cocinar, lista de compras). También funciona en Node.
- `pruebas.js`: 117 pruebas de `logica.js`.
- `CLAUDE.md` (requisitos R1–R10), `PLAN.md` (capas y decisiones 1–25), `PROCESO.md`, `INFORME.md`, `ENUNCIADO.md`.

## Empezar de cero
Pulsa **Restaurar datos de ejemplo**, o en F12 > Application > Local Storage borra `foodsaver.v1` y recarga.

## Limitaciones conocidas
- ".5" y "2." se rechazan (escribe "0.5" y "2").
- "Pechugas de pollo" no se reconoce como "pechuga de pollo" (el plural solo se quita al final).
- Las recetas guardadas ocultan cambios del código hasta restaurar.
- Si la pestaña queda abierta pasada la medianoche, los estados se actualizan con el siguiente cambio.
- No verificado: portapapeles real de "Copiar lista" (solo simulado); el subagente `probador` no se ejecutó.
