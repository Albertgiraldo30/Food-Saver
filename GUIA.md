# Guía del concurso (para ti, no para Claude)

## A. Preparar este computador (una sola vez, antes del miércoles)
1. Comprobar programas. En PowerShell:
       claude --version
       git --version
       python --version
   Si "claude" no se reconoce: instalar con
       irm https://claude.ai/install.ps1 | iex
   y si sigue sin reconocerse, agregar C:\Users\sofia\.local\bin al PATH y abrir una terminal NUEVA.
2. Instalar los 4 agentes (quedan para todos los proyectos):
       New-Item -ItemType Directory -Force "$HOME\.claude\agents" | Out-Null
       Copy-Item "$HOME\Desktop\Concurso IA\agentes\*.md" "$HOME\.claude\agents\"
3. Abrir claude, iniciar sesión con la cuenta Pro y preguntar:
       ¿Qué subagentes tienes disponibles?
   Deben aparecer: arquitecto, revisor, probador, documentador.

## B. Cupo de 5 horas (miércoles)
- 5:00 am: mandar solo "hola" a Claude -> la ventana se reinicia a las 10:00 am.
- No usar Claude entre las 5:00 y las 8:00.
- 7:30 am: revisar el uso (barra "5h:" en la terminal o Configuración -> Uso).
- Si se acaba el cupo: dejar claude abierto; continúa solo al reiniciarse.
- 15 min antes del reinicio: /model opus + /effort max para algo difícil. Después: volver a /effort medium.

## C. Arranque del concurso (primeros 20 minutos)
1. Crear la carpeta del proyecto FUERA de "Concurso IA", sin espacios. Ej: Escritorio\app-concurso
2. Copiar ahí plantillas\CLAUDE.md, plantillas\PROCESO.md y plantillas\.gitignore.
       Copy-Item "$HOME\Desktop\Concurso IA\plantillas\*" . -Force
   (el comando copia también .gitignore, que es un archivo oculto)
3. Crear ENUNCIADO.md y pegar el problema completo, tal cual.
4. Llenar CLAUDE.md: resumen corto, usuario, requisitos, flujo principal, datos de ejemplo.
5. Abrir la carpeta en VS Code, terminal (Ctrl + ñ):
       git init
       claude
6. Shift + Tab hasta "plan mode" y escribir:
       @agent-arquitecto propón el plan leyendo ENUNCIADO.md y CLAUDE.md
7. Revisar el plan, pedir cambios (anotarlo en PROCESO.md: es evidencia).
8. Aprobar, salir de plan mode y pedir: "Guarda el plan en PLAN.md". Commit.

## D. Ciclo por capa
1. "Haz la capa N del PLAN.md."
2. Probar TÚ en el navegador (F5: ¿los datos siguen?).
3. @agent-revisor revisa la capa N   -> si dice BLOQUEADO, corregir y repetir.
4. git add .  ;  git commit -m "Capa N: ..."
5. @agent-probador prueba la capa N  -> las PENDIENTE las pruebas tú a mano.
6. @agent-documentador actualiza README.md y PROCESO.md con la capa N y estos resultados: [pegar]
   (el principal guarda lo que entregue)
7. /clear  y luego: "Lee CLAUDE.md y PLAN.md. Vamos en la capa N+1."

## E. Tiempos
0:00-0:20 plan | 0:20-1:30 base + flujo principal | 1:30-2:30 persistencia y validaciones
2:30-3:15 diseño | 3:15-3:45 pruebas, README | 3:45-4:00 margen: NO empezar nada nuevo.

## F. Atajos
/ comandos   ! comando de terminal   @ archivo o agente   ? ver atajos
Esc detener   Esc Esc volver atrás   Shift+Tab modos   Alt+P modelo
/btw pregunta rápida sin llenar el historial   /clear limpiar   /effort nivel
ultrathink = pensar más SOLO en ese mensaje

## G. Cierre
- README con pasos exactos; probarlos desde cero en una terminal nueva.
- Último commit y copia del proyecto en USB o Drive.
- Demo de 2 minutos: problema, flujo principal, algo que rechazaste, cómo verificaste.
