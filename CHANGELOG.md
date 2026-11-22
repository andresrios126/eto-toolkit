# Historial de cambios

## v3.3.1 — Paquetes de imágenes privadas
- Mis imágenes: **📦 Importar paquete de imágenes (.json)** sin borrar los datos actuales.
- Las imágenes pueden vincularse a preguntas y diagramas concretos: se muestran como "Imágenes de este tema".
- Con muchas imágenes, la Guía visual muestra 9 y un botón "Ver todas", agrupadas por tema y ordenadas por título.

## v3.3.0 — K-Pos, imágenes privadas y repaso antes de exámenes
- **K-Pos (mantenimiento DP)**: 19 preguntas de entrevista nuevas (subsistemas DP, 6 grados de libertad, modelo y residual, nomenclatura DP-XY, clases IMO, redundancia, modos, estación de operador, gabinete DP, interfaces de sensores y referencias, red doble, RS-232/RS-422, NMEA 0183, joystick independiente, respaldo del sistema, FAT/CAT/FMEA, búsqueda de fallas), redactadas con palabras propias a partir de los temas de un curso de mantenimiento K-Pos.
- **Glosario**: 42 términos de K-Pos (345 en total).
- **Guía visual**: 7 diagramas propios nuevos (22 en total): seis grados de libertad, modelo y residual, nombres y clases K-Pos, modos, interfaces, red doble y serial/NMEA.
- **Fallas**: 2 casos nuevos (gyro rechazado por señal ready, alarma de Red B).
- **Mis imágenes (privadas)**: agregar fotos o capturas propias que se guardan solo en el dispositivo y en el respaldo, nunca en la web; se muestran también en las preguntas y diagramas de DP.
- **Inglés**: lección de repaso antes de cada examen (resumen, ejemplos y ejercicios de cada tema, y práctica corta).
- **Corrección**: en K-Pos DP-XY el segundo dígito es la topología (1 independiente, 2 integrado); DP-31 es clase 2 y la clase 3 es sistema principal + respaldo (p. ej. DP-21 + DP-11).
- Al importar un respaldo antiguo ya no se borran los datos que el respaldo no incluye (por ejemplo, imágenes).

## v3.2.0 — Versión respaldada
Estado completo de la app a la fecha. Commit `bc75844` de `main` (crear la Release `v3.2.0` en GitHub: ver `MEJORAS.md`).

### Íconos y apariencia
- 12 opciones de ícono para la pantalla de inicio (⚙️ → Ícono de la app), con pasos guiados para cambiarlo sin perder datos.
- 8 temas de color (Claro, Arena, Menta, Cielo, Durazno, Lavanda, Grafito, Noche eléctrica) y color de fondo personalizado.
- Botón ⚙️ en la esquina superior derecha; inicio simétrico con 7 tarjetas.
- Indicadores Racha, XP y Nivel con explicación al tocarlos.
- Actualización automática al abrir la app con internet.

### Inglés (sub-app independiente)
- 17 temas de gramática (12 tiempos verbales, going to, used to, modales, voz pasiva y condicionales) con explicación, estructura, ejemplos con voz, errores comunes y ejercicios.
- 89 verbos irregulares y 36 regulares, con la traducción de cada forma (go = ir · voy → went = fui → gone = ido).
- Exámenes por nivel A1–C1: se desbloquean por XP, se aprueban con 70 % e indican qué temas repasar.
- Progreso propio con niveles A1 → C2.

### Diccionario
- Mantener presionada una palabra en inglés 1,5 s muestra un globo con su significado (desactivado en exámenes y mientras se responde en los juegos).

### Entrevistas
- 91 preguntas técnicas con respuesta modelo EN/ES y puntos clave, incluidas las de "Mis equipos y sistemas".
- Simulacro de entrevista con voz, temporizador, grabación opcional y autoevaluación.
- Práctica de 2 minutos y respuestas editables.

### Juego
- 42 lecciones en 4 unidades: vocabulario, escribe y completa, entrevista técnica y diagnóstico de fallas.
- Opción múltiple, completar palabras, ordenar letras, dictado y completar frases, en inglés y español.
- XP, racha, meta diaria, fusibles (vidas) y niveles con nombre de voltaje.

### Glosario, Fallas y Guía visual
- 302 términos técnicos EN ↔ ES con tarjetas y términos propios.
- 21 casos de troubleshooting más casos propios.
- 15 diagramas de referencia (DP, redundancia, voltajes, VFD, thrusters, radar, LOTO…).

## Versiones anteriores
- **v3.1** — Exámenes de inglés por nivel, diccionario al mantener presionado y traducción de las formas de los verbos.
- **v3.0** — Simulacro de entrevista y sub-app de inglés.
- **v2.4** — Botón de ajustes, inicio simétrico, actualización automática y etiquetas de los indicadores.
- **v2.3** — Temas de color.
- **v2.2** — Juegos de escribir y completar; preguntas de equipos sin datos personales.
- **v2.0** — Juego tipo app de idiomas, Fallas, Guía visual y más contenido.
- **v1.1** — Glosario con tarjetas.
- **v1.0** — Base de la PWA y entrenador de entrevistas.
