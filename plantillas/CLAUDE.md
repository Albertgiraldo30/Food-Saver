# Proyecto: [NOMBRE DE LA APP]

## Problema
[Resumen en 2 o 3 líneas.] El enunciado completo está en ENUNCIADO.md: léelo antes de planear o revisar.

## Usuario
[Quién la usa, en qué situación, qué necesita: ej. "cajero con prisa en hora pico".]

## Requisitos (en orden de prioridad)
R1. [...]
R2. [...]
R3. [...]
R4. Los datos NO se pierden al recargar la página.

## Flujo principal (el que se demuestra en vivo)
[Paso 1] → [Paso 2] → [Paso 3] → [Resultado visible]

## Datos de ejemplo
[Productos, precios, nombres... para que el agente no invente.]

## Stack (no cambiar)
- Un solo index.html con HTML, CSS y JavaScript puro.
- Sin librerías externas ni CDN.
- Persistencia con localStorage.

## Validaciones obligatorias
- No permitir campos vacíos.
- Números dentro de rangos lógicos.
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
