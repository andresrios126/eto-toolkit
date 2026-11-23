// Ensayos de inglés marítimo (vida a bordo, trabajo de ETO / máquinas, seguridad, reportes).
// Se muestran en Ensayos → ⚓ Inglés marítimo, separados de los temas generales.
export const MARITIME_ESSAYS = [
  // ---------- A1 ----------
  { id: 'm-a1-me', track: 'maritime', level: 'A1', title: 'About me', es: 'Preséntate: quién eres, de dónde eres, cuál es tu trabajo y qué te gusta.',
    ideas: ['Tu nombre y tu edad (I am … years old).', 'Tu trabajo: I am an electrician / ETO.', 'Qué te gusta hacer.'], use: ['present-simple'], vocab: ['job', 'ship', 'family', 'like', 'live', 'engine', 'friend', 'country'] },
  { id: 'm-a1-routine', track: 'maritime', level: 'A1', title: 'My day on board', es: 'Describe un día normal de trabajo en el barco, de la mañana a la noche.',
    ideas: ['A qué hora te levantas.', 'Qué revisas primero (I check…).', 'Qué haces después del trabajo.'], use: ['present-simple'], vocab: ['wake up', 'breakfast', 'check', 'engine room', 'lunch', 'tools', 'shift', 'tired'] },
  { id: 'm-a1-ship', track: 'maritime', level: 'A1', title: 'My ship', es: 'Describe tu barco: tamaño, equipos y tripulación. Usa "there is / there are".',
    ideas: ['There is / There are…', 'Cuántas personas hay a bordo.', 'Qué equipos hay en la sala de máquinas.'], use: ['present-simple'], vocab: ['there are', 'crew', 'deck', 'cabin', 'generator', 'big', 'bridge', 'engine room'] },
  { id: 'm-a1-free', track: 'maritime', level: 'A1', title: 'My free time', es: 'Cuenta qué haces en tu tiempo libre y qué sabes hacer (can).',
    ideas: ['Deportes, música, películas…', 'I can… / I can\'t…', 'Con quién pasas tu tiempo libre.'], use: ['present-simple', 'modals'], vocab: ['can', 'music', 'gym', 'movies', 'call', 'weekend', 'play', 'enjoy'] },
  { id: 'm-a1-now', track: 'maritime', level: 'A1', title: 'Right now', es: 'Describe lo que está pasando ahora mismo a tu alrededor.',
    ideas: ['I am sitting / writing…', 'Qué están haciendo otras personas.', 'El clima: It is raining / sunny.'], use: ['present-continuous'], vocab: ['sitting', 'writing', 'listening', 'weather', 'window', 'working', 'sea', 'raining'] },

  // ---------- A2 ----------
  { id: 'm-a2-trip', track: 'maritime', level: 'A2', title: 'My last voyage', es: 'Cuenta tu último viaje o embarque: a dónde fuiste, qué hiciste y qué pasó.',
    ideas: ['Cuándo y a dónde fuiste (last year…).', 'Qué trabajos hiciste.', 'Algo interesante que pasó.'], use: ['past-simple'], vocab: ['port', 'sailed', 'arrived', 'crew', 'weather', 'repaired', 'visited', 'cargo'] },
  { id: 'm-a2-plans', track: 'maritime', level: 'A2', title: 'My plans for next year', es: 'Explica tus planes y predicciones para el próximo año.',
    ideas: ['I am going to…', 'I think I will…', 'Por qué quieres hacerlo.'], use: ['going-to', 'future-will'], vocab: ['course', 'certificate', 'save money', 'travel', 'improve', 'next year', 'promotion', 'learn'] },
  { id: 'm-a2-child', track: 'maritime', level: 'A2', title: 'When I was a child', es: 'Describe cómo era tu vida de niño y qué solías hacer.',
    ideas: ['I used to…', 'Dónde vivías y a qué jugabas.', 'Qué cambió desde entonces.'], use: ['used-to', 'past-simple'], vocab: ['used to', 'school', 'village', 'neighbour', 'toys', 'dream', 'grew up', 'parents'] },
  { id: 'm-a2-firstjob', track: 'maritime', level: 'A2', title: 'My first job', es: 'Cuenta cómo fue tu primer trabajo y qué estabas haciendo cuando empezaste.',
    ideas: ['Cuándo empezaste.', 'I was working / studying when…', 'Qué aprendiste.'], use: ['past-simple', 'past-continuous'], vocab: ['boss', 'nervous', 'learned', 'workshop', 'salary', 'mistake', 'colleague', 'experience'] },
  { id: 'm-a2-tool', track: 'maritime', level: 'A2', title: 'My favourite tool', es: 'Describe tu herramienta o instrumento favorito: qué es, para qué sirve y por qué te gusta.',
    ideas: ['Multímetro, pinza amperimétrica, megger…', 'You can use it to…', 'Una vez que te ayudó.'], use: ['present-simple', 'modals'], vocab: ['multimeter', 'measure', 'voltage', 'current', 'useful', 'battery', 'safe', 'reliable'] },

  // ---------- B1 ----------
  { id: 'm-b1-exp', track: 'maritime', level: 'B1', title: 'My experience as an ETO', es: 'Resume tu experiencia: equipos con los que has trabajado y lo que has aprendido.',
    ideas: ['I have worked with…', 'Un proyecto o barco concreto (pasado simple).', 'Lo que más has aprendido.'], use: ['present-perfect', 'past-simple'], vocab: ['switchboard', 'maintenance', 'troubleshoot', 'automation', 'responsible', 'vessel', 'skills', 'challenge'] },
  { id: 'm-b1-problem', track: 'maritime', level: 'B1', title: 'A problem I solved', es: 'Cuenta una avería que resolviste: qué estaba pasando, qué había fallado y cómo lo arreglaste.',
    ideas: ['We were sailing when…', 'The breaker had tripped because…', 'Los pasos que seguiste y el resultado.'], use: ['past-simple', 'past-continuous', 'past-perfect'], vocab: ['breaker', 'tripped', 'fault', 'alarm', 'investigate', 'replace', 'root cause', 'restore'] },
  { id: 'm-b1-safety', track: 'maritime', level: 'B1', title: 'Safety on board', es: 'Explica las reglas de seguridad más importantes para trabajar con electricidad a bordo.',
    ideas: ['You must / should / mustn\'t…', 'Lockout / tagout, permisos de trabajo.', 'Qué puede pasar si no se cumplen.'], use: ['modals', 'present-simple'], vocab: ['lockout', 'permit to work', 'isolate', 'protective equipment', 'risk', 'hazard', 'procedure', 'injury'] },
  { id: 'm-b1-lottery', track: 'maritime', level: 'B1', title: 'If I won the lottery', es: '¿Qué harías si ganaras la lotería? ¿Seguirías trabajando en el mar?',
    ideas: ['If I won…, I would…', 'Qué comprarías y a quién ayudarías.', 'Si seguirías navegando y por qué.'], use: ['conditionals'], vocab: ['would', 'invest', 'charity', 'retire', 'afford', 'dream', 'house', 'business'] },
  { id: 'm-b1-email', track: 'maritime', level: 'B1', title: 'Email to the Chief Engineer', es: 'Escribe un correo al jefe de máquinas reportando una falla y lo que harás.',
    ideas: ['Dear Chief, …', 'What has happened (I have found…).', 'Lo que harás (I will…) y lo que necesitas.'], use: ['present-perfect', 'future-will'], vocab: ['report', 'request', 'spare parts', 'urgent', 'schedule', 'inspection', 'regards', 'attached'] },

  // ---------- B2 ----------
  { id: 'm-b2-maint', track: 'maritime', level: 'B2', title: 'Preventive vs corrective maintenance', es: 'Ensayo de opinión: compara el mantenimiento preventivo y el correctivo. ¿Cuál es mejor a bordo?',
    ideas: ['Ventajas y desventajas de cada uno.', 'Ejemplos reales (is inspected / was replaced).', 'Tu conclusión con condicionales.'], use: ['present-simple', 'passive', 'conditionals'], vocab: ['preventive', 'corrective', 'downtime', 'planned', 'breakdown', 'cost-effective', 'reliability', 'schedule'] },
  { id: 'm-b2-auto', track: 'maritime', level: 'B2', title: 'Will automation replace seafarers?', es: '¿Los barcos autónomos reemplazarán a la tripulación? Da argumentos a favor y en contra.',
    ideas: ['In ten years, ships will be operating…', 'Qué trabajos seguirán siendo necesarios.', 'Tu opinión final.'], use: ['future-will', 'future-continuous', 'modals'], vocab: ['autonomous', 'sensors', 'remote', 'replace', 'skills', 'unemployment', 'artificial intelligence', 'reliable'] },
  { id: 'm-b2-incident', track: 'maritime', level: 'B2', title: 'Incident report', es: 'Redacta un reporte de incidente: qué ocurrió, qué lo causó y qué se hizo.',
    ideas: ['At 14:00, while we were…', 'It was found that the cable had been…', 'Medidas correctivas y recomendaciones.'], use: ['past-continuous', 'past-perfect', 'passive'], vocab: ['incident', 'investigation', 'cause', 'damage', 'evidence', 'corrective action', 'witness', 'recommendation'] },
  { id: 'm-b2-career', track: 'maritime', level: 'B2', title: 'Five years from now', es: '¿Dónde te ves en cinco años? Describe tus metas profesionales.',
    ideas: ['By 2031 I will have…', 'This time next year I will be working…', 'Qué necesitas para lograrlo.'], use: ['future-perfect', 'future-continuous'], vocab: ['goal', 'achieve', 'promotion', 'qualification', 'leadership', 'abroad', 'chief', 'experience'] },
  { id: 'm-b2-crew', track: 'maritime', level: 'B2', title: 'Working in a multicultural crew', es: 'Habla de los retos y ventajas de trabajar con tripulaciones de muchos países.',
    ideas: ['I have been working with … for…', 'Problemas de comunicación y cómo se resuelven.', 'Consejos para nuevos marinos.'], use: ['present-perfect-continuous', 'modals'], vocab: ['multicultural', 'misunderstanding', 'respect', 'language barrier', 'cooperation', 'customs', 'tolerance', 'teamwork'] },

  // ---------- C1 ----------
  { id: 'm-c1-green', track: 'maritime', level: 'C1', title: 'Decarbonising shipping', es: 'Ensayo formal: ¿cómo debe la industria marítima reducir sus emisiones y qué papel tiene el ETO?',
    ideas: ['Medidas actuales (are being adopted…).', 'Escenario en 2050 (will have been…).', 'Condiciones para lograrlo y conclusión.'], use: ['passive', 'future-perfect', 'conditionals'], vocab: ['emissions', 'decarbonisation', 'alternative fuels', 'regulation', 'efficiency', 'shore power', 'sustainability', 'retrofit'] },
  { id: 'm-c1-lessons', track: 'maritime', level: 'C1', title: 'Lessons from a difficult situation', es: 'Reflexiona sobre una situación difícil a bordo: qué pasó, qué habrías hecho distinto y qué aprendiste.',
    ideas: ['We had been working for hours when…', 'If I had known…, I would have…', 'Lecciones para tu carrera.'], use: ['past-perfect-continuous', 'past-perfect', 'conditionals'], vocab: ['pressure', 'decision', 'in hindsight', 'consequences', 'accountability', 'overwhelmed', 'priorities', 'resilience'] },
  { id: 'm-c1-training', track: 'maritime', level: 'C1', title: 'How should ETOs be trained?', es: 'Propón cómo debería ser la formación de los ETO: teoría, simuladores, práctica a bordo.',
    ideas: ['Students should be taught…', 'Comparación con la formación actual.', 'Qué pasaría si no se cambia.'], use: ['modals', 'passive', 'conditionals'], vocab: ['curriculum', 'simulator', 'hands-on', 'competence', 'assessment', 'mentoring', 'theoretical', 'industry'] },
  { id: 'm-c1-cyber', track: 'maritime', level: 'C1', title: 'Cybersecurity on board', es: 'Analiza los riesgos de ciberseguridad en los barcos modernos y cómo deben gestionarse.',
    ideas: ['Systems have been increasingly connected…', 'Ejemplos de ataques o fallos.', 'Por 2030, qué se habrá implementado.'], use: ['present-perfect-continuous', 'passive', 'future-perfect'], vocab: ['vulnerability', 'network', 'malware', 'firewall', 'segregation', 'awareness', 'breach', 'mitigate'] },
];
