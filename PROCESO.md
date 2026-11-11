# Cómo trabajamos con los agentes

## 1. Tarea delegada
- Instrucción:
- Resultado:

## 2. Resultado refinado o rechazado
- Qué produjo el agente: el subagente `arquitecto` propuso el PLAN.md con decisiones provisionales: (a) al agregar un ingrediente repetido con fecha distinta, fusionarlo y quedarse con la fecha más próxima; (b) un ingrediente que no alcanza la cantidad no cuenta para mostrar la receta ni para su urgencia; (c) el tope de 10000 solo aplica a lo que se escribe, no al total sumado.
- Por qué no nos sirvió: (a) fusionar fechas distintas pierde información de vencimiento; (b) si un ingrediente próximo a vencer no alcanza, igual conviene sugerir la receta para aprovecharlo, que es el objetivo del reto; (c) el total podía superar el límite válido.
- Cómo lo corregimos: la usuaria respondió las preguntas del arquitecto y se ajustaron CLAUDE.md y PLAN.md: fusión solo con la misma fecha, los ingredientes insuficientes cuentan para la urgencia (se muestran como faltante "no alcanza") y el tope aplica al total. También se fijó una fecha máxima de hoy + 5 años.

## 3. Verificación
- Qué revisamos (revisor / probador / pruebas manuales):
- Qué encontramos:
- Cómo validamos la corrección:
