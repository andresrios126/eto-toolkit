# Historial de cambios

## v3.13.0 — Tiempo en el ranking
- 🏆 Ranking: cada usuario muestra su tiempo en la app (⏱ 12 h 35 min) y hay una pestaña nueva **⏱ Tiempo** con el top 10 de quienes más la han usado.
- Requiere actualizar la regla `leaderboard` para permitir el campo `time` (ver MEJORAS.md). Mientras tanto el ranking sigue funcionando sin el tiempo.

## v3.12.0 — Tiempo total de uso
- La app cuenta el tiempo de uso real (solo con la app en pantalla; se pausa tras 5 min sin tocar nada) y lo muestra en horas y minutos (p. ej. "12 h 35 min") en el inicio y en ⚙️ → Cuenta.
- Con cuenta, el tiempo se guarda en el documento del usuario en Firebase (`users/{uid}`, ajuste `usage`, segundos por dispositivo) y se suman todos sus dispositivos. Sin cuenta queda solo en el dispositivo.

## v3.11.0 — Usuario y ranking en la barra
- Junto al botón ⚙️ aparece tu usuario y tu puesto en el ranking del juego ETO (👤 usuario · 🏆 #3). Al tocarlo abre el Ranking. Solo se muestra con cuenta iniciada y se oculta durante lecciones y exámenes.

## v3.10.0 — Ranking de usuarios
- Nuevo módulo **🏆 Ranking** en el inicio: top 10 de usuarios con cuenta por XP del **⚡ Juego ETO** o de **🇬🇧 Inglés**, con medallas, nivel y "tú" resaltado. Si no estás en el top 10, muestra tu posición.
- Sin cuenta no apareces: el progreso queda solo en el teléfono. Interruptor "Aparecer en el ranking" para salir cuando quieras.
- El puntaje se publica solo al sincronizar. Requiere publicar la regla `leaderboard` en Firestore (ver MEJORAS.md).

## v3.9.0 — Ensayos: inglés general e inglés marítimo
- Ensayos se divide en **🌎 Inglés general** (24 temas para cualquier persona) y **⚓ Inglés marítimo** (24 temas de la vida a bordo, trabajo en máquinas y electricidad, seguridad y reportes). El reto recomendado se genera dentro del apartado elegido.

## v3.8.1 — Ensayos de inglés generales
- Los 24 temas de ensayo ahora son de inglés general (rutina, vacaciones, comida, salud, redes sociales, IA, reseñas, ciudad o campo, cambio climático, privacidad…), sin temas de ETO ni del mar, para que cualquier persona pueda usar la app de inglés.

## v3.8.0 — Contador de usuarios
- ⚙️ Ajustes → **📊 Usuarios de la app**: cuántos dispositivos han usado la app, activos en 7 y 30 días, sin usarla hace más de 30 días, y cuántos tienen cuenta.
- Anónimo: cada dispositivo guarda solo un id al azar, la fecha del primer y último uso (una vez al día), si tiene cuenta y la versión. Se puede desactivar ("Contar este dispositivo"), lo que borra su registro.
- Requiere publicar la regla `devices` en Firestore (ver MEJORAS.md).

## v3.7.0 — Reto recomendado en Ensayos
- **🎯 Reto recomendado** por nivel: la app elige un tema (primero los que no has escrito, luego los de nota más baja), te pide **tiempos verbales** (más en niveles altos y los que has fallado en ensayos y exámenes) y **palabras obligatorias** del tema (3 en A1 hasta 7 en C1; en B2 y C1 incluye un conector avanzado).
- Las palabras se marcan en verde al usarlas (acepta worked, working, went…). Nueva parte de la nota: **Palabras del reto**. Botón **🔄 Otro reto**.

## v3.6.1 — Nombre en la barra
- Inicio: "ETO Toolkit · by Eng. Andres Rios".

## v3.6.0 — Ensayos con calificación (Inglés)
- **✍️ Escritura → Ensayos**: 24 temas en 5 niveles (A1–C1) con extensión por nivel, ideas y estructuras que hay que usar.
- Calificación automática de 0 a 100 sin internet: extensión, gramática (más de 40 errores típicos: he work, I have 30 years, didn't went, people is, more better, depend of, enjoy to…), ortografía y puntuación, variedad de vocabulario, conectores, párrafos y estructuras del tema.
- Resultado con el texto marcado, lista de correcciones, **qué estudiar** con enlace al tema, lo que hiciste bien, "Corregir y volver a calificar" y **Copiar para corrección con Claude**.
- Historial de ensayos y mejor nota por tema (se sincroniza con la cuenta). Da XP de inglés al mejorar tu nota.

## v3.5.3 — Fichas de aprendizaje en Inglés
- Después de responder: oración completa con traducción y tiempo verbal, o las tres formas del verbo con su traducción.

## v3.5.2 — Explicación de cada palabra en los juegos
- Completa la palabra, Ordena las letras y Escucha y escribe muestran "💡 ¿Qué es?" con la definición y la categoría; al responder, ficha con traducción, definición y ejemplo.

## v3.5.0 — Curso K-Pos y más diagramas propios
- **📚 Curso K-Pos** (Guía visual): 9 unidades como un curso de mantenimiento (qué es DP, modos y HMI, sensores y referencias, estación de operador, gabinete DP, red, serial, joystick independiente, respaldo y fallas), cada una con resumen, diagramas y preguntas, y una **evaluación final de 20 preguntas** sin vidas.
- **10 diagramas nuevos** dibujados desde cero (32 en total): ciclo DP, fuerzas, configuraciones K-Pos, conexión de MRU, DGNSS y correcciones, trama serial, sentencia NMEA de GPS, direcciones IP en red doble, traspaso de mando del joystick y ciclo de vida.
- **7 preguntas** nuevas de K-Pos (117 en total) y **14 términos** (359 en total).
- Se retiró **Mis imágenes**: el contenido del curso se representa con resúmenes y diagramas propios, sin imágenes de terceros.

## v3.4.1 — Firebase conectado
- Proyecto de Firebase `eto-toolkit` conectado: Authentication (correo/contraseña interno), Firestore `(default)` en nam5 con reglas por usuario.
- La sección ⚙️ → 👤 Cuenta ya permite crear cuenta e iniciar sesión.

## v3.4.0 — Cuentas de usuario y sincronización entre dispositivos
- Ajustes → **👤 Cuenta**: crear cuenta o iniciar sesión con **usuario y contraseña (sin correo)**.
- La sesión queda abierta en el dispositivo hasta tocar "Cerrar sesión".
- Cada avance se sincroniza solo (respuestas, juego, glosario, fallas, inglés, simulacros), combinando el progreso de todos los dispositivos (mayor XP, mejores estrellas y notas, lo editado más reciente).
- Sin internet todo sigue funcionando; los cambios se suben al volver la conexión (reintento automático).
- Sin cuenta se puede usar todo; el avance queda solo en ese dispositivo.

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
