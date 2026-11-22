# ⚡ ETO Toolkit

Aplicación web progresiva (PWA) en español para **Electro-Technical Officers** en buques offshore (PSV, OSV, AHTS). Funciona sin internet, guarda tus datos en el teléfono y se instala en la pantalla de inicio del iPhone como una app.

## Módulos

| Módulo | Qué tiene |
|---|---|
| 🎮 **Juego** | Opción múltiple, escribir y completar palabras, ordenar letras y dictado, con XP, racha y niveles de voltaje |
| 🎙️ **Simulacro** | Entrevista completa: el entrevistador lee las preguntas en voz alta, respondes con tiempo y (opcional) te grabas |
| 🎤 **Entrevistas** | 91 preguntas técnicas, incluidas las de mis equipos y sistemas con respuesta modelo EN/ES, puntos clave, voz y práctica de 2 min |
| 📖 **Glosario** | 302 términos técnicos EN ↔ ES con definición, ejemplo, voz y tarjetas |
| 🔧 **Fallas** | 21 casos de troubleshooting + tus propios casos |
| 🇬🇧 **Inglés** | Sub-app independiente: 17 temas de gramática (12 tiempos verbales, going to, used to, modales, voz pasiva, condicionales) y 89 verbos irregulares |
| 🧭 **Guía visual** | 15 diagramas de referencia: DP, redundancia, voltajes, VFD, thrusters, radar, LOTO… |

### 🎮 Juego (estilo app de idiomas, con tema eléctrico)
- Un **camino de lecciones** en 4 unidades: vocabulario técnico (una lección por categoría del glosario), **escribe y completa**, entrevista técnica (una por categoría de preguntas) y diagnóstico de fallas.
- **Escribe y completa** (inglés y español): completar la palabra con pistas de letras, ordenar letras, escuchar y escribir (dictado), completar la frase y escritura mixta. Acepta respuestas sin acentos o con un error pequeño, y te muestra la forma correcta. El botón 💡 *Pista* revela una letra (da 5 XP en vez de 10).
- Tipos de pregunta: término → significado, español → inglés, definición → término, completar la frase, pregunta en español → pregunta en inglés, punto clave de la respuesta, completar la respuesta modelo, causa posible de una falla y comprensión de historias en inglés.
- **3 fusibles** (vidas) por lección; las falladas vuelven a salir al final.
- **10 XP** por acierto, combo y bonus por lección perfecta; **estrellas** por lección, **racha** de días y **meta diaria** de 50 XP.
- **Niveles con nombre de voltaje**: 24 V → 110 V → 230 V → 440 V → 690 V → 3.3 kV → 6.6 kV → 11 kV → 33 kV → 132 kV.
- **Repaso mixto** y **"Lo que no sé"** (términos que aún no marcaste como aprendidos).
- Sonidos de acierto/error (se pueden silenciar).

### 🎙️ Simulacro de entrevista
- Eliges duración (5, 8 o 10 preguntas) y tiempo por respuesta (1, 2 o 3 min).
- Orden realista: presentación → técnicas (DP, tus equipos, potencia) → seguridad → cierre ("Do you have any questions for us?").
- El entrevistador lee cada pregunta en voz alta; puedes ocultar el texto para practicar solo escuchando.
- **Grabar mis respuestas** (opcional): te escuchas al final. Las grabaciones no se guardan.
- Al terminar te autoevalúas (😟 / 🙂 / 😎), ves la respuesta modelo y los puntos clave, y queda un historial.

### 🇬🇧 Inglés (sub-app independiente)
- Su propio progreso: XP y nivel **A1 → C2**, separado del progreso ETO.
- **17 temas**: Present simple / continuous / perfect / perfect continuous, Past simple / continuous / perfect / perfect continuous, Future will / going to / continuous / perfect / perfect continuous, used to, modales, voz pasiva y condicionales.
- Cada tema: cuándo se usa, estructura (afirmativa, negativa, pregunta), palabras clave, ejemplos con voz y traducción, errores comunes y **10 ejercicios** (escribir el verbo, elegir la forma correcta, identificar el tiempo, traducir).
- **Verbos**: formas del verbo (base, pasado, participio, -ing), **89 irregulares** con tabla, búsqueda y voz, y **verbos regulares** con reglas de -ed y pronunciación /t/ /d/ /ɪd/. Cada forma muestra su traducción: go = ir · (yo) voy → went = (yo) fui → gone = (he) ido.
- Práctica mixta y "¿Qué tiempo es?". Las respuestas escritas se corrigen de forma estricta (por ejemplo, "work" no vale por "works").
- **🎓 Exámenes por nivel (A1, A2, B1, B2, C1)**: se desbloquean al alcanzar ese nivel de XP. 20 preguntas sin pistas ni vidas, sin ver si aciertas hasta el final; se aprueba con 70 %. Al terminar: nota por tema, **qué temas repasar** (con enlace directo), tus errores con la respuesta correcta y la opción de **volver a tomarlo**. Aprobar por primera vez da +50 XP.

### 📖 Diccionario al mantener presionado
- En cualquier pantalla, **mantén presionada una palabra en inglés 1,5 s** y aparece un globo con su significado en español, su forma base (went → go, studied → study) y, si forma parte de un término técnico, el término completo ("bow thruster": hélice de proa). Botón 🔊 para escucharla.
- Se cierra al tocar cualquier otra parte. Funciona sin internet (diccionario de ~850 palabras + glosario técnico + verbos).
- Desactivado en los exámenes y mientras respondes en los juegos (se activa de nuevo al ver el resultado).

### 🎤 Entrenador de entrevistas

> Las preguntas de **Mis equipos y sistemas** se basan solo en los equipos y sistemas DP con los que trabajé, sin datos personales. Verifícalas y personalízalas con **Editar**: tus cambios se guardan solo en el teléfono.

- **91 preguntas** en 15 categorías, incluida **Mis equipos y sistemas** (Kongsberg K-Pos DP21, Navis NavDP 4022 y Marine Technologies; generadores de cola Leroy Somer; Z-Peller; Veth Z-drive; generadores Caterpillar; DP1 vs DP2; operator station; PLC; osciloscopio; SAP). Las demás: DP (CAM/TAM, capability plot, consequence analysis, trials, alertas, UPS, drift-off/drive-off), thrusters, generadores, switchboard, PMS, seguridad eléctrica, LOTO, alto voltaje, propulsión diésel-eléctrica, automatización y sensores, navegación y radares, baterías e híbridos, situacionales y experiencia personal.
- Cada pregunta tiene **respuesta modelo en inglés sencillo**, **traducción** y **3 puntos clave** que el entrevistador espera escuchar.
- **🔊 Voz** lenta / normal, **🎯 modo práctica** con temporizador de 2 minutos y **✏️ edición** de respuestas.

### 📖 Glosario
- **302 términos** en 18 categorías, incluidas **Mis equipos y sistemas** y **Frases para la entrevista**. Las demás: conceptos eléctricos, generación, distribución y protección, motores y variadores, DP y propulsión, **terminología DP**, automatización, **sensores**, seguridad, herramientas, navegación, **radares**, **tipos de buques**, **propulsores**, **tipos de voltaje** y buque y operaciones.
- Definición y ejemplo en inglés, voz, búsqueda sin acentos, favoritos, "lo sé", **tarjetas** y **términos propios**.

### 🔧 Fallas
- **21 casos** de generadores, cuadros, motores, thrusters/VFD, DP, automatización, navegación, baterías/UPS y cubierta.
- Cada caso: síntoma, causas posibles, pasos de diagnóstico, solución y **cómo contarlo en inglés en la entrevista** (con voz y traducción).
- **➕ Mis casos**: agrega las fallas que tú resolviste; también aparecen en el juego.

### 🧭 Guía visual
Diagramas dibujados en la app (funcionan sin internet): visión general DP, redundancia DP2 con cuadro dividido, clases DP, referencias de posición, niveles de alerta, diagrama unifilar, tipos de voltaje, estrella/triángulo, sincronización, VFD, tipos de propulsores, lazo 4-20 mA, radar, LOTO y tabla de sensores. Cada uno con explicación en español y términos clave para escuchar en inglés.

### ⚙️ Ajustes y apariencia
- Toca **⚙️** (arriba a la derecha, en cualquier pantalla). Ahí eliges el tema: **Claro** (predeterminado), **Arena**, **Menta**, **Cielo**, **Durazno**, **Lavanda**, **Grafito** o **Noche eléctrica**.
- **Color de fondo personalizado**: elige un color de la paleta o cualquier color; la app ajusta tarjetas, bordes y textos automáticamente para que se lean bien.
- **📱 Ícono de la app**: 12 opciones (Noche, Amarillo, Blanco, Azul, Verde, Atardecer, Morado, Grafito, Círculo, ETO, Alto voltaje, Cielo). En iPhone el ícono se fija al agregar la app, así que para cambiarlo: exporta un respaldo, copia el enlace que te da la app (…/?icon=nombre), ábrelo en Safari, agrégala de nuevo a la pantalla de inicio, importa el respaldo y borra el ícono viejo.
- También: velocidad de la voz, sonidos del juego, respaldo y **🔄 Buscar actualización**.

### 💾 Datos y respaldo
- Todo se guarda **solo en tu dispositivo** (IndexedDB). No hay servidor ni cuenta.
- El respaldo incluye respuestas editadas, progreso del juego y del glosario, términos y casos propios.
- En **⚙️ Ajustes → Respaldo** puedes **exportar** un archivo `.json` (en el iPhone se abre el menú Compartir: elige *Guardar en Archivos* o iCloud Drive) e **importarlo** después.
- ⚠️ Si borras la app de la pantalla de inicio o los datos de Safari, se pierde lo guardado. **Exporta un respaldo de vez en cuando.**

---

## 🚀 Cómo activar GitHub Pages

El repositorio ya trae un flujo de GitHub Actions (`.github/workflows/pages.yml`) que publica la app cada vez que haces push a `main`. Solo tienes que activarlo **una vez**:

1. Entra al repositorio en GitHub: `https://github.com/andresrios126/eto-toolkit`.
2. Ve a **Settings** (Configuración) → en el menú izquierdo, **Pages**.
3. En **Build and deployment → Source**, elige **GitHub Actions**.
4. Ve a la pestaña **Actions**, abre el flujo **"Publicar en GitHub Pages"** y pulsa **Run workflow** (o haz cualquier push a `main`).
5. Cuando termine (punto verde ✅), tu app estará en:

   **https://andresrios126.github.io/eto-toolkit/**

> Si el primer intento falló porque Pages aún no estaba activado, vuelve a ejecutarlo desde **Actions → Re-run jobs**.
>
> El repositorio debe ser **público** para usar GitHub Pages con una cuenta gratuita.

## 📱 Cómo agregar la app a la pantalla de inicio del iPhone

1. Abre **Safari** en el iPhone (tiene que ser Safari) y entra a **https://andresrios126.github.io/eto-toolkit/**.
2. Espera unos segundos a que cargue por completo. La primera vez se guarda para funcionar sin internet.
3. Toca el botón **Compartir** (el cuadrado con la flecha hacia arriba ⬆️, abajo en el centro).
4. Desliza hacia abajo y toca **"Agregar a pantalla de inicio"**. Si no aparece, toca **"Más"** o **"Editar acciones"** para encontrarlo.
5. Deja el nombre **ETO Toolkit** y toca **Agregar**.
6. Abre la app desde el ícono ⚡. Se abre a pantalla completa, sin la barra de Safari.

**Para comprobar que funciona sin internet:** activa el modo avión y abre la app desde el ícono.

**Voz en inglés:** la lectura usa las voces del iPhone. Para una voz mejor, ve a *Ajustes → Accesibilidad → Contenido leído → Voces → Inglés* y descarga una voz "Mejorada" (por ejemplo, Samantha o Ava). Si no escuchas nada, revisa que el iPhone no esté en modo silencio.

### Actualizaciones
La app se actualiza sola: cuando la abres con internet y hay una versión nueva, se descarga y se recarga automáticamente. Si algo se ve raro, ve a **⚙️ Ajustes → 🔄 Buscar actualización**.

---

## 🛠️ Para desarrolladores

- **Historial de cambios:** [`CHANGELOG.md`](CHANGELOG.md)
- **Guía para mejoras futuras e ideas pendientes:** [`MEJORAS.md`](MEJORAS.md)
- **Versión estable respaldada:** v3.2.0 (commit `bc75844`; ver cómo crear la Release en `MEJORAS.md`)

HTML, CSS y JavaScript puros (módulos ES), sin frameworks ni paso de compilación.

```
index.html              Estructura y metadatos PWA/iOS
manifest.webmanifest    Manifiesto de la PWA
sw.js                   Service worker (caché offline)
css/styles.css          Estilos mobile-first con variables de tema
js/app.js               Router, menú de inicio, respaldo
js/db.js                IndexedDB + exportar/importar JSON
js/speech.js            speechSynthesis (voz y velocidad)
js/ui.js                Utilidades de interfaz
js/components.js        Componentes compartidos (voz, velocidad)
js/themes.js            Temas de color y color personalizado
js/game-state.js        XP, racha, meta diaria y niveles
js/modules/game.js      Juego de opción múltiple
js/modules/interviews.js  Entrevistas
js/modules/glossary.js  Glosario y tarjetas
js/modules/faults.js    Casos de fallas
js/modules/guide.js     Guía visual
js/modules/mock.js      Simulacro de entrevista
js/modules/english.js   Sub-app de inglés y exámenes por nivel
js/lookup.js            Globo de traducción (mantener presionado)
js/data/questions*.js   Preguntas, respuestas modelo y puntos clave
js/data/glossary*.js    Términos del glosario
js/data/faults.js       Casos de fallas
js/data/diagrams.js     Diagramas SVG
js/data/english.js      Gramática, ejercicios y verbos de inglés
js/data/dictionary.js   Diccionario inglés → español sin conexión
icons/                  Íconos de la app
```

**Probar en local:**

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

**Al cambiar archivos**, sube `CACHE_VERSION` en `sw.js` para que los teléfonos descarguen la nueva versión. Si agregas archivos nuevos, añádelos también a la lista `ASSETS`.
