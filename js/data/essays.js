// Temas de ensayo por nivel (sección de Escritura de la app de inglés).
// `use`: estructuras que el ensayo debe incluir (ids de TENSES en english.js).

export const ESSAY_LEVELS = [
  { level: 'A1', min: 40, max: 70, sentence: [5, 12], connectors: 2, minutes: 10, desc: 'Frases simples en presente.' },
  { level: 'A2', min: 70, max: 110, sentence: [6, 14], connectors: 3, minutes: 15, desc: 'Pasado, planes y rutinas.' },
  { level: 'B1', min: 120, max: 170, sentence: [8, 18], connectors: 4, minutes: 20, desc: 'Experiencias, opiniones y problemas.' },
  { level: 'B2', min: 180, max: 250, sentence: [10, 22], connectors: 5, minutes: 30, desc: 'Argumentar, comparar y reportar.' },
  { level: 'C1', min: 250, max: 350, sentence: [12, 26], connectors: 6, minutes: 40, desc: 'Ensayos formales y complejos.' },
];

// Conectores sugeridos por nivel (se cuentan todos los de niveles anteriores).
export const CONNECTORS = {
  A1: ['and', 'but', 'because', 'or', 'also', 'then', 'so'],
  A2: ['first', 'after that', 'finally', 'when', 'before', 'after', 'later'],
  B1: ['however', 'although', 'for example', 'in my opinion', 'while', 'as well', 'such as', 'in the end'],
  B2: ['moreover', 'therefore', 'on the other hand', 'in addition', 'as a result', 'despite', 'unless', 'whereas', 'even though'],
  C1: ['nevertheless', 'furthermore', 'consequently', 'in contrast', 'notwithstanding', 'to sum up', 'in conclusion', 'given that', 'provided that', 'nonetheless', 'thus'],
};

export const ESSAYS = [
  // ---------- A1 ----------
  { id: 'a1-me', level: 'A1', title: 'About me', es: 'Preséntate: quién eres, de dónde eres, cuál es tu trabajo y qué te gusta.',
    ideas: ['Tu nombre y tu edad (I am … years old).', 'Tu trabajo: I am an electrician / ETO.', 'Qué te gusta hacer.'], use: ['present-simple'] },
  { id: 'a1-routine', level: 'A1', title: 'My day on board', es: 'Describe un día normal de trabajo en el barco, de la mañana a la noche.',
    ideas: ['A qué hora te levantas.', 'Qué revisas primero (I check…).', 'Qué haces después del trabajo.'], use: ['present-simple'] },
  { id: 'a1-ship', level: 'A1', title: 'My ship', es: 'Describe tu barco: tamaño, equipos y tripulación. Usa "there is / there are".',
    ideas: ['There is / There are…', 'Cuántas personas hay a bordo.', 'Qué equipos hay en la sala de máquinas.'], use: ['present-simple'] },
  { id: 'a1-free', level: 'A1', title: 'My free time', es: 'Cuenta qué haces en tu tiempo libre y qué sabes hacer (can).',
    ideas: ['Deportes, música, películas…', 'I can… / I can\'t…', 'Con quién pasas tu tiempo libre.'], use: ['present-simple', 'modals'] },
  { id: 'a1-now', level: 'A1', title: 'Right now', es: 'Describe lo que está pasando ahora mismo a tu alrededor.',
    ideas: ['I am sitting / writing…', 'Qué están haciendo otras personas.', 'El clima: It is raining / sunny.'], use: ['present-continuous'] },

  // ---------- A2 ----------
  { id: 'a2-trip', level: 'A2', title: 'My last voyage', es: 'Cuenta tu último viaje o embarque: a dónde fuiste, qué hiciste y qué pasó.',
    ideas: ['Cuándo y a dónde fuiste (last year…).', 'Qué trabajos hiciste.', 'Algo interesante que pasó.'], use: ['past-simple'] },
  { id: 'a2-plans', level: 'A2', title: 'My plans for next year', es: 'Explica tus planes y predicciones para el próximo año.',
    ideas: ['I am going to…', 'I think I will…', 'Por qué quieres hacerlo.'], use: ['going-to', 'future-will'] },
  { id: 'a2-child', level: 'A2', title: 'When I was a child', es: 'Describe cómo era tu vida de niño y qué solías hacer.',
    ideas: ['I used to…', 'Dónde vivías y a qué jugabas.', 'Qué cambió desde entonces.'], use: ['used-to', 'past-simple'] },
  { id: 'a2-firstjob', level: 'A2', title: 'My first job', es: 'Cuenta cómo fue tu primer trabajo y qué estabas haciendo cuando empezaste.',
    ideas: ['Cuándo empezaste.', 'I was working / studying when…', 'Qué aprendiste.'], use: ['past-simple', 'past-continuous'] },
  { id: 'a2-tool', level: 'A2', title: 'My favourite tool', es: 'Describe tu herramienta o instrumento favorito: qué es, para qué sirve y por qué te gusta.',
    ideas: ['Multímetro, pinza amperimétrica, megger…', 'You can use it to…', 'Una vez que te ayudó.'], use: ['present-simple', 'modals'] },

  // ---------- B1 ----------
  { id: 'b1-exp', level: 'B1', title: 'My experience as an ETO', es: 'Resume tu experiencia: equipos con los que has trabajado y lo que has aprendido.',
    ideas: ['I have worked with…', 'Un proyecto o barco concreto (pasado simple).', 'Lo que más has aprendido.'], use: ['present-perfect', 'past-simple'] },
  { id: 'b1-problem', level: 'B1', title: 'A problem I solved', es: 'Cuenta una avería que resolviste: qué estaba pasando, qué había fallado y cómo lo arreglaste.',
    ideas: ['We were sailing when…', 'The breaker had tripped because…', 'Los pasos que seguiste y el resultado.'], use: ['past-simple', 'past-continuous', 'past-perfect'] },
  { id: 'b1-safety', level: 'B1', title: 'Safety on board', es: 'Explica las reglas de seguridad más importantes para trabajar con electricidad a bordo.',
    ideas: ['You must / should / mustn\'t…', 'Lockout / tagout, permisos de trabajo.', 'Qué puede pasar si no se cumplen.'], use: ['modals', 'present-simple'] },
  { id: 'b1-lottery', level: 'B1', title: 'If I won the lottery', es: '¿Qué harías si ganaras la lotería? ¿Seguirías trabajando en el mar?',
    ideas: ['If I won…, I would…', 'Qué comprarías y a quién ayudarías.', 'Si seguirías navegando y por qué.'], use: ['conditionals'] },
  { id: 'b1-email', level: 'B1', title: 'Email to the Chief Engineer', es: 'Escribe un correo al jefe de máquinas reportando una falla y lo que harás.',
    ideas: ['Dear Chief, …', 'What has happened (I have found…).', 'Lo que harás (I will…) y lo que necesitas.'], use: ['present-perfect', 'future-will'] },

  // ---------- B2 ----------
  { id: 'b2-maint', level: 'B2', title: 'Preventive vs corrective maintenance', es: 'Ensayo de opinión: compara el mantenimiento preventivo y el correctivo. ¿Cuál es mejor a bordo?',
    ideas: ['Ventajas y desventajas de cada uno.', 'Ejemplos reales (is inspected / was replaced).', 'Tu conclusión con condicionales.'], use: ['present-simple', 'passive', 'conditionals'] },
  { id: 'b2-auto', level: 'B2', title: 'Will automation replace seafarers?', es: '¿Los barcos autónomos reemplazarán a la tripulación? Da argumentos a favor y en contra.',
    ideas: ['In ten years, ships will be operating…', 'Qué trabajos seguirán siendo necesarios.', 'Tu opinión final.'], use: ['future-will', 'future-continuous', 'modals'] },
  { id: 'b2-incident', level: 'B2', title: 'Incident report', es: 'Redacta un reporte de incidente: qué ocurrió, qué lo causó y qué se hizo.',
    ideas: ['At 14:00, while we were…', 'It was found that the cable had been…', 'Medidas correctivas y recomendaciones.'], use: ['past-continuous', 'past-perfect', 'passive'] },
  { id: 'b2-career', level: 'B2', title: 'Five years from now', es: '¿Dónde te ves en cinco años? Describe tus metas profesionales.',
    ideas: ['By 2031 I will have…', 'This time next year I will be working…', 'Qué necesitas para lograrlo.'], use: ['future-perfect', 'future-continuous'] },
  { id: 'b2-crew', level: 'B2', title: 'Working in a multicultural crew', es: 'Habla de los retos y ventajas de trabajar con tripulaciones de muchos países.',
    ideas: ['I have been working with … for…', 'Problemas de comunicación y cómo se resuelven.', 'Consejos para nuevos marinos.'], use: ['present-perfect-continuous', 'modals'] },

  // ---------- C1 ----------
  { id: 'c1-green', level: 'C1', title: 'Decarbonising shipping', es: 'Ensayo formal: ¿cómo debe la industria marítima reducir sus emisiones y qué papel tiene el ETO?',
    ideas: ['Medidas actuales (are being adopted…).', 'Escenario en 2050 (will have been…).', 'Condiciones para lograrlo y conclusión.'], use: ['passive', 'future-perfect', 'conditionals'] },
  { id: 'c1-lessons', level: 'C1', title: 'Lessons from a difficult situation', es: 'Reflexiona sobre una situación difícil a bordo: qué pasó, qué habrías hecho distinto y qué aprendiste.',
    ideas: ['We had been working for hours when…', 'If I had known…, I would have…', 'Lecciones para tu carrera.'], use: ['past-perfect-continuous', 'past-perfect', 'conditionals'] },
  { id: 'c1-training', level: 'C1', title: 'How should ETOs be trained?', es: 'Propón cómo debería ser la formación de los ETO: teoría, simuladores, práctica a bordo.',
    ideas: ['Students should be taught…', 'Comparación con la formación actual.', 'Qué pasaría si no se cambia.'], use: ['modals', 'passive', 'conditionals'] },
  { id: 'c1-cyber', level: 'C1', title: 'Cybersecurity on board', es: 'Analiza los riesgos de ciberseguridad en los barcos modernos y cómo deben gestionarse.',
    ideas: ['Systems have been increasingly connected…', 'Ejemplos de ataques o fallos.', 'Por 2030, qué se habrá implementado.'], use: ['present-perfect-continuous', 'passive', 'future-perfect'] },
];
