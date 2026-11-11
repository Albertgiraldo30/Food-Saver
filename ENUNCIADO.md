# ENUNCIADO — Food Saver: aprovechar los ingredientes antes de que venzan

## Contexto del concurso
Prompt & Solve (ITM): hackathon asistida por IA. Construir una **aplicación funcional** usando agentes de programación con IA, demostrando que entregamos resultados y que supervisamos críticamente lo que genera la IA.

## Alcance común (obligatorio)
- La app debe **conservar los datos al recargar la página**.
- Se permiten datos de ejemplo y almacenamiento local (localStorage).
- Opcionales: inicio de sesión, integraciones externas y funciones de IA dentro de la app.
- Usar **datos ficticios** en la demostración.
- **Priorizar el flujo requerido** antes de agregar funciones extra.

## Entregables
1. App ejecutable.
2. Instrucciones breves de uso.
3. Tres ejemplos del trabajo con el agente: una tarea delegada, un resultado refinado o rechazado, y una verificación.

## Objetivo del reto
Ayudar a los hogares a reducir el desperdicio de alimentos: priorizar el uso de ingredientes y elegir comidas que los aprovechen.

## Información requerida
- **Ingrediente:** nombre, cantidad, unidad, fecha de vencimiento.
- **Receta:** nombre, ingredientes necesarios, instrucciones breves de preparación.

## Funciones principales
1. Agregar y actualizar ingredientes.
2. Ordenarlos por fecha de vencimiento (destacar los que deben usarse primero).
3. Sugerir recetas con los ingredientes disponibles.
4. Identificar los ingredientes faltantes de cada receta.

## Reglas básicas
- Rechazar cantidades inválidas.
- Señalar los ingredientes **vencidos por separado** y **excluirlos** de las sugerencias de recetas.
- Basta con una pequeña colección predefinida de recetas.

## Demostración mínima (flujo de la demo en vivo)
Registrar varios ingredientes con distintas fechas de vencimiento y encontrar una receta que aproveche uno **próximo a vencer**.

## Criterios de evaluación (0 = ausente … 4 = excelente)
| Criterio | Peso | Qué se evalúa |
|---|---|---|
| Demostración funcional | 20 % | El flujo principal funciona en vivo de principio a fin. |
| Resolución del problema | 15 % | La app cumple los requisitos del reto. |
| Experiencia de usuario y acabado | 15 % | Interfaz intuitiva; maneja bien errores comunes de entrada. |
| Descomposición de tareas | 15 % | Tareas manejables; se ajustan las instrucciones según haga falta. |
| Gestión del contexto | 15 % | Se dan al agente requisitos, archivos y restricciones relevantes. |
| Verificación y depuración | 20 % | Se revisa lo generado, se investigan problemas y se validan correcciones. |
