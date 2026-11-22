// Configuración de la nube (Firebase). Estos datos NO son secretos: identifican el proyecto.
// La seguridad la dan las reglas de Firestore (cada usuario solo puede leer y escribir su propio progreso).
// Mientras apiKey y projectId estén vacíos, la sección "Cuenta" aparece como "pendiente de configurar".

export const CLOUD_CONFIG = {
  apiKey: 'AIzaSyDr9e013pG2ybcYntU38hgIFde2PYZOkp4',
  projectId: 'eto-toolkit',
};
