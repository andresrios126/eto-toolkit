# ⚡ ETO Toolkit

Aplicación web progresiva (PWA) en español para **Electro-Technical Officers** en buques offshore (PSV, OSV, AHTS). Funciona sin internet, guarda tus datos en el teléfono y se instala en la pantalla de inicio del iPhone como una app.

## Módulos

| Módulo | Qué tiene |
|---|---|
| 🎮 **Juego** | Lecciones de opción múltiple con XP, racha, meta diaria y niveles de voltaje |
| 🎤 **Entrevistas** | 72 preguntas técnicas con respuesta modelo EN/ES, puntos clave, voz y práctica de 2 min |
| 📖 **Glosario** | 268 términos técnicos EN ↔ ES con definición, ejemplo, voz y tarjetas |
| 🔧 **Fallas** | 21 casos de troubleshooting + tus propios casos |
| 🧭 **Guía visual** | 15 diagramas de referencia: DP, redundancia, voltajes, VFD, thrusters, radar, LOTO… |

### 🎮 Juego (estilo app de idiomas, con tema eléctrico)
- Un **camino de lecciones** en 3 unidades: vocabulario técnico (una lección por categoría del glosario), entrevista técnica (una por categoría de preguntas) y diagnóstico de fallas.
- Tipos de pregunta: término → significado, español → inglés, definición → término, completar la frase, pregunta en español → pregunta en inglés, punto clave de la respuesta, completar la respuesta modelo, causa posible de una falla y comprensión de historias en inglés.
- **3 fusibles** (vidas) por lección; las falladas vuelven a salir al final.
- **10 XP** por acierto, combo y bonus por lección perfecta; **estrellas** por lección, **racha** de días y **meta diaria** de 50 XP.
- **Niveles con nombre de voltaje**: 24 V → 110 V → 230 V → 440 V → 690 V → 3.3 kV → 6.6 kV → 11 kV → 33 kV → 132 kV.
- **Repaso mixto** y **"Lo que no sé"** (términos que aún no marcaste como aprendidos).
- Sonidos de acierto/error (se pueden silenciar).

### 🎤 Entrenador de entrevistas
- **72 preguntas** en 14 categorías: DP (CAM/TAM, capability plot, consequence analysis, trials, alertas, UPS, drift-off/drive-off), thrusters, generadores, switchboard, PMS, seguridad eléctrica, LOTO, alto voltaje, propulsión diésel-eléctrica, automatización y sensores, navegación y radares, baterías e híbridos, situacionales y experiencia personal.
- Cada pregunta tiene **respuesta modelo en inglés sencillo**, **traducción** y **3 puntos clave** que el entrevistador espera escuchar.
- **🔊 Voz** lenta / normal, **🎯 modo práctica** con temporizador de 2 minutos y **✏️ edición** de respuestas.

### 📖 Glosario
- **268 términos** en 16 categorías: conceptos eléctricos, generación, distribución y protección, motores y variadores, DP y propulsión, **terminología DP**, automatización, **sensores**, seguridad, herramientas, navegación, **radares**, **tipos de buques**, **propulsores**, **tipos de voltaje** y buque y operaciones.
- Definición y ejemplo en inglés, voz, búsqueda sin acentos, favoritos, "lo sé", **tarjetas** y **términos propios**.

### 🔧 Fallas
- **21 casos** de generadores, cuadros, motores, thrusters/VFD, DP, automatización, navegación, baterías/UPS y cubierta.
- Cada caso: síntoma, causas posibles, pasos de diagnóstico, solución y **cómo contarlo en inglés en la entrevista** (con voz y traducción).
- **➕ Mis casos**: agrega las fallas que tú resolviste; también aparecen en el juego.

### 🧭 Guía visual
Diagramas dibujados en la app (funcionan sin internet): visión general DP, redundancia DP2 con cuadro dividido, clases DP, referencias de posición, niveles de alerta, diagrama unifilar, tipos de voltaje, estrella/triángulo, sincronización, VFD, tipos de propulsores, lazo 4-20 mA, radar, LOTO y tabla de sensores. Cada uno con explicación en español y términos clave para escuchar en inglés.

### 💾 Datos y respaldo
- Todo se guarda **solo en tu dispositivo** (IndexedDB). No hay servidor ni cuenta.
- El respaldo incluye respuestas editadas, progreso del juego y del glosario, términos y casos propios.
- En **Inicio → Respaldo de datos** puedes **exportar** un archivo `.json` (en el iPhone se abre el menú Compartir: elige *Guardar en Archivos* o iCloud Drive) e **importarlo** después.
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
Cuando se publique una versión nueva, abre la app con internet. Verás el aviso *"Nueva versión lista"*. Cierra la app por completo (desliza hacia arriba en el selector de apps) y vuelve a abrirla.

---

## 🛠️ Para desarrolladores

HTML, CSS y JavaScript puros (módulos ES), sin frameworks ni paso de compilación.

```
index.html              Estructura y metadatos PWA/iOS
manifest.webmanifest    Manifiesto de la PWA
sw.js                   Service worker (caché offline)
css/styles.css          Estilos mobile-first, modo oscuro
js/app.js               Router, menú de inicio, respaldo
js/db.js                IndexedDB + exportar/importar JSON
js/speech.js            speechSynthesis (voz y velocidad)
js/ui.js                Utilidades de interfaz
js/components.js        Componentes compartidos (voz, velocidad)
js/game-state.js        XP, racha, meta diaria y niveles
js/modules/game.js      Juego de opción múltiple
js/modules/interviews.js  Entrevistas
js/modules/glossary.js  Glosario y tarjetas
js/modules/faults.js    Casos de fallas
js/modules/guide.js     Guía visual
js/data/questions*.js   Preguntas, respuestas modelo y puntos clave
js/data/glossary*.js    Términos del glosario
js/data/faults.js       Casos de fallas
js/data/diagrams.js     Diagramas SVG
icons/                  Íconos de la app
```

**Probar en local:**

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

**Al cambiar archivos**, sube `CACHE_VERSION` en `sw.js` para que los teléfonos descarguen la nueva versión. Si agregas archivos nuevos, añádelos también a la lista `ASSETS`.
