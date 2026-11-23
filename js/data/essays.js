// Temas de ensayo por nivel (sección de Escritura de la app de inglés).
// Temas generales de inglés, para cualquier persona (sin temas de ETO ni del mar).
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

// Reto recomendado: tiempos verbales por nivel y cuántos tiempos / palabras exige.
export const LEVEL_TENSES = {
  A1: ['present-simple', 'present-continuous', 'modals'],
  A2: ['past-simple', 'past-continuous', 'going-to', 'future-will', 'used-to'],
  B1: ['present-perfect', 'past-perfect', 'conditionals', 'modals', 'past-continuous'],
  B2: ['passive', 'future-continuous', 'future-perfect', 'present-perfect-continuous', 'conditionals'],
  C1: ['past-perfect-continuous', 'future-perfect-continuous', 'passive', 'conditionals', 'future-perfect'],
};
export const CHALLENGE = {
  A1: { tenses: 2, words: 3 }, A2: { tenses: 2, words: 4 }, B1: { tenses: 3, words: 5 }, B2: { tenses: 3, words: 6 }, C1: { tenses: 4, words: 7 },
};

import { MARITIME_ESSAYS } from './essays-maritime.js';

export const TRACKS = [
  { key: 'general', label: '🌎 Inglés general' },
  { key: 'maritime', label: '⚓ Inglés marítimo' },
];

const GENERAL_ESSAYS = [
  // ---------- A1 ----------
  { id: 'a1-me', level: 'A1', title: 'About me', es: 'Preséntate: quién eres, de dónde eres, a qué te dedicas y qué te gusta.',
    ideas: ['Tu nombre y tu edad (I am … years old).', 'Tu trabajo o tus estudios.', 'Qué te gusta y qué no te gusta.'], use: ['present-simple'],
    vocab: ['name', 'live', 'work', 'study', 'family', 'like', 'friends', 'city'] },
  { id: 'a1-routine', level: 'A1', title: 'My daily routine', es: 'Describe un día normal, de la mañana a la noche.',
    ideas: ['A qué hora te levantas (I get up at…).', 'Qué haces en la mañana y en la tarde.', 'Qué haces antes de dormir.'], use: ['present-simple'],
    vocab: ['wake up', 'breakfast', 'shower', 'lunch', 'usually', 'evening', 'always', 'sleep'] },
  { id: 'a1-home', level: 'A1', title: 'My home', es: 'Describe tu casa o departamento. Usa "there is / there are".',
    ideas: ['There is / There are…', 'Cuántas habitaciones tiene.', 'Tu lugar favorito de la casa.'], use: ['present-simple'],
    vocab: ['there are', 'bedroom', 'kitchen', 'living room', 'small', 'window', 'garden', 'favourite'] },
  { id: 'a1-free', level: 'A1', title: 'My free time', es: 'Cuenta qué haces en tu tiempo libre y qué sabes hacer (can).',
    ideas: ['Deportes, música, películas…', 'I can… / I can\'t…', 'Con quién pasas tu tiempo libre.'], use: ['present-simple', 'modals'],
    vocab: ['can', 'music', 'sport', 'movies', 'weekend', 'play', 'enjoy', 'park'] },
  { id: 'a1-now', level: 'A1', title: 'Right now', es: 'Describe lo que está pasando ahora mismo a tu alrededor.',
    ideas: ['I am sitting / writing…', 'Qué están haciendo otras personas.', 'El clima: It is raining / sunny.'], use: ['present-continuous'],
    vocab: ['sitting', 'writing', 'listening', 'weather', 'window', 'people', 'wearing', 'raining'] },

  // ---------- A2 ----------
  { id: 'a2-trip', level: 'A2', title: 'My last holiday', es: 'Cuenta tus últimas vacaciones: a dónde fuiste, qué hiciste y qué pasó.',
    ideas: ['Cuándo y a dónde fuiste (last summer…).', 'Qué lugares visitaste y qué comiste.', 'Algo divertido o inesperado que pasó.'], use: ['past-simple'],
    vocab: ['travelled', 'beach', 'hotel', 'visited', 'weather', 'bought', 'delicious', 'photos'] },
  { id: 'a2-plans', level: 'A2', title: 'My plans for next year', es: 'Explica tus planes y predicciones para el próximo año.',
    ideas: ['I am going to…', 'I think I will…', 'Por qué quieres hacerlo.'], use: ['going-to', 'future-will'],
    vocab: ['course', 'save money', 'travel', 'improve', 'next year', 'learn', 'healthy', 'goal'] },
  { id: 'a2-child', level: 'A2', title: 'When I was a child', es: 'Describe cómo era tu vida de niño y qué solías hacer.',
    ideas: ['I used to…', 'Dónde vivías y a qué jugabas.', 'Qué cambió desde entonces.'], use: ['used-to', 'past-simple'],
    vocab: ['used to', 'school', 'neighbour', 'toys', 'dream', 'grew up', 'parents', 'games'] },
  { id: 'a2-day', level: 'A2', title: 'A day I will never forget', es: 'Cuenta un día especial: qué estabas haciendo, qué pasó y cómo te sentiste.',
    ideas: ['It was a … day. I was … when…', 'Qué pasó después.', 'Por qué no lo olvidas.'], use: ['past-simple', 'past-continuous'],
    vocab: ['suddenly', 'surprised', 'happened', 'remember', 'excited', 'while', 'finally', 'celebrate'] },
  { id: 'a2-food', level: 'A2', title: 'My favourite food', es: 'Describe tu comida favorita: qué lleva, cómo se prepara y por qué te gusta.',
    ideas: ['Los ingredientes.', 'Los pasos: First… Then… After that…', 'Cuándo y con quién la comes.'], use: ['present-simple', 'modals'],
    vocab: ['ingredients', 'cook', 'recipe', 'taste', 'spicy', 'add', 'minutes', 'restaurant'] },

  // ---------- B1 ----------
  { id: 'b1-english', level: 'B1', title: 'Learning English', es: 'Habla de tu experiencia aprendiendo inglés: qué has hecho, qué te ha costado y qué te ha funcionado.',
    ideas: ['I have studied English for…', 'Cómo empezaste (pasado simple).', 'Consejos para otros estudiantes.'], use: ['present-perfect', 'past-simple'],
    vocab: ['improve', 'vocabulary', 'pronunciation', 'mistakes', 'practise', 'fluent', 'confident', 'grammar'] },
  { id: 'b1-problem', level: 'B1', title: 'A problem I solved', es: 'Cuenta un problema que resolviste: qué estaba pasando, qué había salido mal y cómo lo arreglaste.',
    ideas: ['I was … when…', 'Something had gone wrong because…', 'Los pasos que seguiste y el resultado.'], use: ['past-simple', 'past-continuous', 'past-perfect'],
    vocab: ['problem', 'realised', 'decided', 'solution', 'help', 'worried', 'fix', 'lesson'] },
  { id: 'b1-health', level: 'B1', title: 'A healthy life', es: 'Da consejos para llevar una vida sana: comida, ejercicio, sueño y estrés.',
    ideas: ['You should / must / shouldn\'t…', 'Hábitos buenos y malos.', 'Qué haces tú para estar sano.'], use: ['modals', 'present-simple'],
    vocab: ['exercise', 'diet', 'stress', 'habits', 'vegetables', 'avoid', 'energy', 'balance'] },
  { id: 'b1-lottery', level: 'B1', title: 'If I won the lottery', es: '¿Qué harías si ganaras la lotería? ¿Cambiaría tu vida?',
    ideas: ['If I won…, I would…', 'Qué comprarías y a quién ayudarías.', 'Si seguirías trabajando o estudiando y por qué.'], use: ['conditionals'],
    vocab: ['would', 'invest', 'charity', 'afford', 'dream', 'house', 'business', 'share'] },
  { id: 'b1-email', level: 'B1', title: 'Email to a friend', es: 'Escribe un correo a un amigo: cuéntale qué has hecho últimamente e invítalo a un plan.',
    ideas: ['Hi …, how are you?', 'What you have done recently (I have started…).', 'Tu invitación y lo que harán (We will…).'], use: ['present-perfect', 'future-will'],
    vocab: ['recently', 'invite', 'plans', 'weekend', 'free', 'let me know', 'looking forward', 'see you'] },

  // ---------- B2 ----------
  { id: 'b2-social', level: 'B2', title: 'Social media: good or bad?', es: 'Ensayo de opinión: ventajas y desventajas de las redes sociales.',
    ideas: ['Ventajas (stay in touch, information).', 'Desventajas (addiction, fake news).', 'Tu conclusión con condicionales.'], use: ['present-simple', 'passive', 'conditionals'],
    vocab: ['addiction', 'privacy', 'influence', 'fake news', 'connect', 'self-esteem', 'advantages', 'drawbacks'] },
  { id: 'b2-ai', level: 'B2', title: 'Will AI change our jobs?', es: '¿La inteligencia artificial cambiará el trabajo? Da argumentos a favor y en contra.',
    ideas: ['In ten years, people will be working…', 'Qué trabajos desaparecerán y cuáles aparecerán.', 'Tu opinión final.'], use: ['future-will', 'future-continuous', 'modals'],
    vocab: ['artificial intelligence', 'replace', 'skills', 'unemployment', 'creative', 'automation', 'adapt', 'opportunities'] },
  { id: 'b2-review', level: 'B2', title: 'A film or book review', es: 'Escribe la reseña de una película o libro: de qué trata, qué te pareció y si lo recomiendas.',
    ideas: ['It was directed / written by…', 'La historia (the main character had…).', 'Tu opinión y recomendación.'], use: ['past-continuous', 'past-perfect', 'passive'],
    vocab: ['plot', 'character', 'ending', 'recommend', 'performance', 'scene', 'audience', 'disappointing'] },
  { id: 'b2-career', level: 'B2', title: 'Five years from now', es: '¿Dónde te ves en cinco años? Describe tus metas personales y profesionales.',
    ideas: ['By 2031 I will have…', 'This time next year I will be…', 'Qué necesitas para lograrlo.'], use: ['future-perfect', 'future-continuous'],
    vocab: ['goal', 'achieve', 'career', 'qualification', 'abroad', 'independent', 'challenge', 'experience'] },
  { id: 'b2-city', level: 'B2', title: 'City life or country life?', es: 'Compara vivir en la ciudad y en el campo. ¿Dónde preferirías vivir y por qué?',
    ideas: ['I have been living in … for…', 'Ventajas y desventajas de cada lugar.', 'Tu elección final.'], use: ['present-perfect-continuous', 'modals'],
    vocab: ['traffic', 'pollution', 'peaceful', 'opportunities', 'community', 'cost of living', 'nature', 'convenient'] },

  // ---------- C1 ----------
  { id: 'c1-climate', level: 'C1', title: 'Climate change: whose responsibility?', es: 'Ensayo formal: ¿quién debe actuar contra el cambio climático: gobiernos, empresas o personas?',
    ideas: ['Medidas actuales (are being adopted…).', 'Escenario en 2050 (will have been…).', 'Condiciones para lograrlo y conclusión.'], use: ['passive', 'future-perfect', 'conditionals'],
    vocab: ['emissions', 'renewable', 'regulation', 'sustainability', 'consumers', 'policy', 'carbon footprint', 'urgent'] },
  { id: 'c1-lessons', level: 'C1', title: 'Lessons from a difficult situation', es: 'Reflexiona sobre una situación difícil: qué pasó, qué habrías hecho distinto y qué aprendiste.',
    ideas: ['I had been … for months when…', 'If I had known…, I would have…', 'Lo que aprendiste.'], use: ['past-perfect-continuous', 'past-perfect', 'conditionals'],
    vocab: ['pressure', 'decision', 'in hindsight', 'consequences', 'overwhelmed', 'priorities', 'resilience', 'regret'] },
  { id: 'c1-edu', level: 'C1', title: 'Should university be free?', es: 'Argumenta si la educación universitaria debería ser gratuita para todos.',
    ideas: ['Students should be given…', 'Quién lo pagaría y qué efectos tendría.', 'Qué pasaría si no cambia nada.'], use: ['modals', 'passive', 'conditionals'],
    vocab: ['tuition', 'access', 'inequality', 'funding', 'taxpayers', 'opportunity', 'debt', 'merit'] },
  { id: 'c1-privacy', level: 'C1', title: 'Privacy in the digital age', es: 'Analiza cómo ha cambiado la privacidad con internet y qué deberíamos hacer.',
    ideas: ['Our data has been increasingly collected…', 'Ejemplos de riesgos (filtraciones, publicidad).', 'Para 2030, qué se habrá implementado.'], use: ['present-perfect-continuous', 'passive', 'future-perfect'],
    vocab: ['personal data', 'surveillance', 'consent', 'breach', 'algorithms', 'awareness', 'trade-off', 'regulate'] },
];

export const ESSAYS = [...GENERAL_ESSAYS.map((e) => ({ ...e, track: 'general' })), ...MARITIME_ESSAYS];
