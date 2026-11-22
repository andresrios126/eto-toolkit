# ⚡ ETO Toolkit

Aplicación web progresiva (PWA) en español para **Electro-Technical Officers** en buques offshore (PSV, OSV, AHTS). Funciona sin internet, guarda tus datos en el teléfono y se instala en la pantalla de inicio del iPhone como una app.

## Módulos

| Módulo | Estado |
|---|---|
| 🎤 **Entrevistas**: entrenador de entrevistas en inglés | ✅ Fase 1 |
| 📖 **Glosario**: términos técnicos EN ↔ ES con tarjetas | ✅ Fase 2 |
| 📜 Certificados | Próximamente |
| ⚡ Fallas | Próximamente |

### 🎤 Entrenador de entrevistas
- **30 preguntas** típicas de entrevista para ETO: DP system, bow thruster, generadores, switchboard, PMS, seguridad eléctrica, LOTO y experiencia personal.
- Cada pregunta tiene una **respuesta modelo en inglés sencillo** y su **traducción al español**.
- **🔊 Escuchar** la pregunta, la respuesta o ambas, con voz en inglés y velocidad **Lento / Normal**.
- **🎯 Modo práctica**: pregunta al azar y **temporizador de 2 minutos** para responder en voz alta. Suena una alarma al terminar y después puedes ver la respuesta modelo.
- **✏️ Editar respuestas** para personalizarlas con tu experiencia real (y restaurar la original cuando quieras).
- Buscador, filtro por categoría y contador de preguntas practicadas.

> Consejo: empieza editando **"Tell me about yourself"** y **"Tell me about a difficult fault"**. Tienen espacios como `[your name]` para completar con tus datos.

### 📖 Glosario
- **159 términos técnicos** en 10 categorías: conceptos eléctricos, generación, distribución y protección, motores y variadores, DP y propulsión, automatización, seguridad, herramientas, navegación y comunicaciones, y buque y operaciones offshore.
- Cada término tiene su **traducción al español**, una **definición en inglés sencillo** y un **ejemplo de uso** como los que se dicen a bordo.
- **🔊 Escuchar** el término, la definición o el ejemplo, en velocidad lenta o normal.
- **Buscador** en inglés o español (no importan los acentos) y filtro por categoría.
- **⭐ Favoritos** y **✅ Lo sé**, con una barra de progreso.
- **🃏 Tarjetas de estudio (flashcards)**: eliges el grupo (por aprender, favoritos, una categoría o todos), la dirección (inglés → español o español → inglés) y la cantidad. Las que marcas **Repasar** vuelven a salir al final, y al terminar puedes repasar solo las que fallaste.
- **➕ Tus propios términos**: agrega palabras nuevas que escuches a bordo. También puedes **editar** los términos incluidos y restaurar el original.

### 💾 Datos y respaldo
- Todo se guarda **solo en tu dispositivo** (IndexedDB). No hay servidor ni cuenta.
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
js/modules/interviews.js  Módulo 1: entrevistas
js/modules/glossary.js  Módulo 2: glosario y tarjetas
js/data/questions.js    Las 30 preguntas y respuestas modelo
js/data/glossary.js     Los términos del glosario
icons/                  Íconos de la app
```

**Probar en local:**

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

**Al cambiar archivos**, sube `CACHE_VERSION` en `sw.js` para que los teléfonos descarguen la nueva versión. Si agregas archivos nuevos, añádelos también a la lista `ASSETS`.
