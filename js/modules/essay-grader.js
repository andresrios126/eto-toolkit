// Corrector automático de ensayos (funciona sin internet).
// Es aproximado: revisa extensión, errores típicos de hispanohablantes, ortografía común,
// variedad de vocabulario, conectores y las estructuras gramaticales que pide el tema.

import { TENSES, IRREGULAR, REGULAR } from '../data/english.js';
import { ESSAY_LEVELS, CONNECTORS } from '../data/essays.js';

// ---------- Listas de apoyo ----------

const split = (s) => s.split('/').map((x) => x.trim().toLowerCase());
const PAST_TO_BASE = {};
const PARTICIPLES = new Set();
const IRR_PAST = new Set();
for (const [base, past, pp] of IRREGULAR) {
  for (const p of split(past)) { if (p !== base) PAST_TO_BASE[p] = base; IRR_PAST.add(p); }
  for (const p of split(pp)) PARTICIPLES.add(p);
}

const BASES = new Set([
  ...IRREGULAR.map((v) => v[0]), ...REGULAR.map((v) => v[0]),
  'work', 'live', 'like', 'want', 'need', 'use', 'check', 'repair', 'fix', 'start', 'finish', 'study', 'watch', 'play', 'help',
  'know', 'think', 'say', 'come', 'make', 'take', 'get', 'see', 'eat', 'drink', 'sleep', 'wake', 'speak', 'write', 'read', 'run',
  'change', 'install', 'test', 'monitor', 'maintain', 'operate', 'supply', 'connect', 'measure', 'replace', 'clean', 'open',
  'close', 'love', 'prefer', 'enjoy', 'travel', 'call', 'send', 'receive', 'learn', 'teach', 'try', 'look', 'feel', 'seem',
  'mean', 'include', 'depend', 'happen', 'show', 'turn', 'keep', 'give', 'find', 'tell', 'become', 'leave', 'put', 'bring',
  'begin', 'hold', 'stand', 'understand', 'meet', 'pay', 'sit', 'lose', 'buy', 'spend', 'cut', 'build', 'stay', 'wait',
  'manage', 'lead', 'order', 'provide', 'protect', 'require', 'go', 'do', 'have', 'be', 'want', 'listen', 'arrive', 'visit',
  'cook', 'walk', 'swim', 'fly', 'drive', 'sail', 'climb', 'answer', 'ask', 'explain', 'solve', 'improve', 'remember',
]);

const PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'who', 'people', 'there']);
const NUM_WORDS = '(?:\\d+|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|many|several|a few)';

const STOP = new Set(('a an the and or but so because of to in on at for with from by as is am are was were be been being it its ' +
  'i you he she we they me him her us them my your his our their this that these those there here not do does did have has had ' +
  'will would can could should must may might very also then when what which who if than too just more most some any all one ' +
  's t ll ve re d m don didn doesn isn wasn aren weren won can about into after before up out over').split(' '));

const SPANISH = new Set(('que pero muy porque entonces también tambien para cuando donde los las una del como pues hola gracias ' +
  'barco trabajo siempre nunca hoy ayer mañana manana mejor mucho muchos nosotros ellos yo tengo soy estoy esta este eso ' +
  'aqui aquí bueno pero cosas ahora despues después antes').split(' '));

const MISSPELLED = {
  becouse: 'because', beacuse: 'because', becuase: 'because', becase: 'because', wich: 'which', realy: 'really', untill: 'until',
  recieve: 'receive', recieved: 'received', tomorow: 'tomorrow', tommorow: 'tomorrow', goverment: 'government',
  enviroment: 'environment', definately: 'definitely', begining: 'beginning', seperate: 'separate', occured: 'occurred',
  ocurred: 'occurred', adress: 'address', accomodation: 'accommodation', comunication: 'communication', comunicate: 'communicate',
  responsability: 'responsibility', experiance: 'experience', experiencie: 'experience', enginer: 'engineer', engeneer: 'engineer',
  mantenance: 'maintenance', maintenence: 'maintenance', maintainance: 'maintenance', mantenimiento: 'maintenance',
  equipement: 'equipment', sistem: 'system', sistems: 'systems', problema: 'problem', problemas: 'problems', tecnical: 'technical',
  tecnician: 'technician', technitian: 'technician', eletric: 'electric', electic: 'electric', eletrical: 'electrical',
  electrial: 'electrical', generater: 'generator', voltaje: 'voltage', knowlege: 'knowledge', succesful: 'successful',
  sucessful: 'successful', sucess: 'success', finaly: 'finally', finnaly: 'finally', actualy: 'actually', basicaly: 'basically',
  usualy: 'usually', normaly: 'normally', alot: 'a lot', thats: "that's", dont: "don't", doesnt: "doesn't", didnt: "didn't",
  cant: "can't", isnt: "isn't", wasnt: "wasn't", im: "I'm", ive: "I've", whit: 'with', wiht: 'with', thier: 'their',
  freind: 'friend', freinds: 'friends', beleive: 'believe', belive: 'believe', interesant: 'interesting', intresting: 'interesting',
  diferent: 'different', dificult: 'difficult', oportunity: 'opportunity', necesary: 'necessary', neccesary: 'necessary',
  necessery: 'necessary', profesional: 'professional', posible: 'possible', writting: 'writing', comming: 'coming',
  studing: 'studying', lenght: 'length', heigth: 'height', languaje: 'language', lenguage: 'language', exemple: 'example',
  importan: 'important', inportant: 'important', oficer: 'officer', ofice: 'office', safty: 'safety', saftey: 'safety',
  proces: 'process', procces: 'process', acces: 'access', familly: 'family', clases: 'classes', hapened: 'happened',
  happend: 'happened', stoped: 'stopped', planed: 'planned', prefered: 'preferred', travelled: null, writed: 'wrote',
  buyed: 'bought', goed: 'went', maked: 'made', taked: 'took', thinked: 'thought', teached: 'taught', catched: 'caught',
  breaked: 'broke', bringed: 'brought', choosed: 'chose', knowed: 'knew', runned: 'ran', speaked: 'spoke', sended: 'sent',
  feeled: 'felt', leaved: 'left', meeted: 'met', payed: 'paid', sayed: 'said', telled: 'told', winned: 'won', getted: 'got',
  childs: 'children', mans: 'men', womans: 'women', persons: null, peoples: 'people',
};
// Pasados regulares inventados para verbos irregulares → tema de verbos irregulares.
const BAD_PAST = new Set(['writed', 'buyed', 'goed', 'maked', 'taked', 'thinked', 'teached', 'catched', 'breaked', 'bringed',
  'choosed', 'knowed', 'runned', 'speaked', 'sended', 'feeled', 'leaved', 'meeted', 'sayed', 'telled', 'winned', 'getted']);

function thirdPerson(v) {
  const map = { have: 'has', do: 'does', go: 'goes', be: 'is', "don't": "doesn't" };
  if (map[v]) return map[v];
  if (/(s|sh|ch|x|z|o)$/.test(v)) return `${v}es`;
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ies`;
  return `${v}s`;
}

function baseFromEd(w) {
  if (!w.endsWith('ed') || w.length < 5) return null;
  const c = [w.slice(0, -2), w.slice(0, -1), w.slice(0, -3), `${w.slice(0, -3)}y`];
  return c.find((x) => BASES.has(x)) || null;
}

function baseFromS(w) {
  if (!w.endsWith('s') || BASES.has(w)) return null;
  const c = [w.slice(0, -1), w.slice(0, -2), `${w.slice(0, -3)}y`];
  if (w === 'has') return 'have';
  if (w === 'does') return 'do';
  if (w === 'goes') return 'go';
  return c.find((x) => BASES.has(x)) || null;
}

// Forma base de un verbo mal conjugado tras do/did/modal; null si está bien.
function wrongAfterAux(w) {
  if (PAST_TO_BASE[w] && !BASES.has(w)) return PAST_TO_BASE[w];
  return baseFromEd(w) || baseFromS(w) || (w.endsWith('ing') && BASES.has(w.slice(0, -3)) ? w.slice(0, -3) : null);
}

const prevWord = (text, idx) => (text.slice(0, idx).match(/([A-Za-z']+)\W*$/) || [])[1]?.toLowerCase() || '';
const keepCase = (orig, fix) => (orig[0] === orig[0].toUpperCase() && orig[0] !== orig[0].toLowerCase() ? fix[0].toUpperCase() + fix.slice(1) : fix);

// ---------- Temas de estudio que no son tiempos verbales ----------

export const TOPICS = {
  mayusculas: { name: 'Mayúsculas', tip: '"I" siempre va en mayúscula, igual que la primera palabra de cada oración, nombres, países, días y meses.' },
  puntuacion: { name: 'Puntuación', tip: 'Termina cada oración con punto. Después de coma o punto va un espacio, y antes no.' },
  ortografia: { name: 'Ortografía', tip: 'Revisa las palabras marcadas y escríbelas varias veces. Activa el corrector del teclado del iPhone en inglés.' },
  concordancia: { name: 'Concordancia sujeto-verbo', tip: '"People" es plural: people are / people have. Con he/she/it el verbo lleva -s.' },
  articulos: { name: 'Artículos a / an', tip: '"an" antes de sonido vocal (an engine, an hour) y "a" antes de sonido consonante (a cable, a university).' },
  preposiciones: { name: 'Preposiciones', tip: 'Muchas no se traducen igual: depend ON, married TO, arrive IN/AT, listen TO, at night, on Monday, for 3 years.' },
  incontables: { name: 'Sustantivos incontables', tip: 'information, advice, equipment, software, knowledge y homework no llevan -s: some information, a piece of advice.' },
  comparativos: { name: 'Comparativos', tip: 'Usa -er o more, no los dos: bigger / more important (nunca "more bigger"). Se compara con THAN.' },
  expresiones: { name: 'Expresiones y falsos amigos', tip: 'I am 30 years old (no "I have 30 years"), I agree (no "I am agree"), take a photo, ask a question, attend a meeting.' },
  sujeto: { name: 'Sujeto obligatorio', tip: 'En inglés toda oración necesita sujeto: It is important… / It is raining (no "Is important").' },
  'there-is': { name: 'There is / There are', tip: 'Para decir "hay" usa there is / there are: There are two generators in the engine room.' },
  gerundio: { name: 'Gerundio (-ing)', tip: 'Después de enjoy, finish, avoid, suggest, mind, consider y "look forward to" va -ing: I enjoy working.' },
  infinitivo: { name: 'Infinitivo con to', tip: 'want + persona + to: I want you to help (no "want that you"). Para expresar propósito: to / in order to (no "for to").' },
  vocabulario: { name: 'Vocabulario en inglés', tip: 'Evita palabras en español; si no sabes una palabra, explícala con otras o mantén presionada una palabra para ver su significado.' },
  variedad: { name: 'Variedad de vocabulario', tip: 'Usa sinónimos y pronombres para no repetir las mismas palabras.' },
  conectores: { name: 'Conectores', tip: 'Une tus ideas con conectores para que el texto fluya.' },
  extension: { name: 'Extensión', tip: 'Desarrolla cada idea con detalles y ejemplos para llegar al número de palabras.' },
  oraciones: { name: 'Longitud de oraciones', tip: 'Combina oraciones cortas con conectores y divide las muy largas.' },
  parrafos: { name: 'Párrafos', tip: 'Organiza el texto en párrafos: introducción, desarrollo y conclusión.' },
};

// ---------- Reglas de errores ----------
// cat: grammar | mech (ortografía/puntuación) | vocab
// fix(m, text) → texto corregido, o null para ignorar la coincidencia.

const RULES = [
  { re: /\bi\b(?!\.e\.)/g, cat: 'mech', topic: 'mayusculas', msg: '"I" (yo) siempre va con mayúscula.', fix: () => 'I' },
  { re: /\b(I|i)('m| am)? have (\d+|[a-z]+(?:-[a-z]+)?) years\b(?! of)/gi, cat: 'grammar', topic: 'expresiones',
    msg: 'La edad se dice con "to be": I am 30 years old.', fix: (m) => `I am ${m[3]} years old` },
  { re: /\b(we|they|you)\s+(was|wasn't)\b/gi, cat: 'grammar', topic: 'past-simple', msg: 'Con we / you / they se usa WERE.',
    fix: (m) => `${m[1]} ${m[2].toLowerCase() === 'was' ? 'were' : "weren't"}` },
  { re: /\b(he|she|it|I)\s+(were|weren't)\b/gi, cat: 'grammar', topic: 'past-simple', msg: 'Con I / he / she / it se usa WAS.',
    fix: (m, text) => (/^(if|wish|as|though)$/.test(prevWord(text, m.index)) ? null : `${m[1]} ${m[2].toLowerCase() === 'were' ? 'was' : "wasn't"}`) },
  { re: /\b(I|you|we|they)\s+([a-z]+)\b/gi, cat: 'grammar', topic: 'present-simple', msg: 'Con I / you / we / they el verbo en presente NO lleva -s.',
    fix: (m) => { const b = baseFromS(m[2].toLowerCase()); return b ? `${m[1]} ${b}` : null; } },
  { re: /\bpeople (is|was|has)\b/gi, cat: 'grammar', topic: 'concordancia', msg: '"People" es plural.',
    fix: (m) => `people ${{ is: 'are', was: 'were', has: 'have' }[m[1].toLowerCase()]}` },
  { re: /\b(he|she|it)\s+(don't|do|have|[a-z]+)\b/gi, cat: 'grammar', topic: 'present-simple',
    msg: 'Con he / she / it el verbo en presente lleva -s (o doesn\'t / has).',
    fix: (m, text) => {
      const v = m[2].toLowerCase();
      if (!(BASES.has(v) || v === "don't") || v === 'be') return null;
      const pw = prevWord(text, m.index);
      if (/^(does|did|do|doesn't|didn't|don't|will|won't|can|can't|cannot|could|couldn't|should|shouldn't|would|wouldn't|must|may|might|to|let|lets|make|makes|made|help|helps|helped|saw|see|sees|watch|watched|hear|heard|have|has|had|why|if|when|where|how|what|does|that|feel|felt|let's)$/.test(pw)) return null;
      if (m[1].toLowerCase() === 'it' && pw && !/^(and|but|so|because|then|now|today|usually|always|also|[.,;:!?])$/.test(pw) && /[a-z]$/.test(pw)) {
        // "it" puede ser objeto (fix it, make it work): solo marcar al inicio de oración o tras conector.
        const before = text.slice(0, m.index).trimEnd();
        if (before && !/[.!?,;:]$/.test(before)) return null;
      }
      return `${m[1]} ${thirdPerson(v)}`;
    } },
  { re: /\b(didn't|did not|doesn't|does not|don't|do not|did|does)\s+(?:(i|you|he|she|it|we|they)\s+)?([a-z]+)\b/gi, cat: 'grammar', topic: 'past-simple',
    msg: 'Después de do / does / did (y sus negativos) el verbo va en forma base: didn\'t go, doesn\'t work.',
    fix: (m) => {
      const aux = m[1].toLowerCase();
      if (/^(did|does)$/.test(aux) && !m[2]) return null; // "did" como verbo principal
      const b = wrongAfterAux(m[3].toLowerCase());
      return b ? `${m[1]} ${m[2] ? `${m[2]} ` : ''}${b}` : null;
    },
    topicOf: (m) => (/do(es)?/i.test(m[1]) && !/did/i.test(m[1]) ? 'present-simple' : 'past-simple') },
  { re: /\b(can|could|should|must|will|would|might|may|can't|cannot|won't|wouldn't|shouldn't|couldn't|mustn't)\s+(not\s+)?([a-z]+)\b/gi, cat: 'grammar', topic: 'modals',
    msg: 'Después de un verbo modal (can, will, should…) el verbo va en forma base, sin "to", sin -s y sin pasado.',
    fix: (m) => {
      const w = m[3].toLowerCase();
      if (w === 'to' && !m[2]) return `${m[1]}`;
      if (m[1].toLowerCase() === 'may' && m.index === 0) return null;
      if (w === 'been' || w === 'had') return `${m[1]} ${m[2] || ''}have`;
      const b = wrongAfterAux(w);
      return b ? `${m[1]} ${m[2] || ''}${b}` : null;
    },
    topicOf: (m) => (/will|won't/i.test(m[1]) ? 'future-will' : /would/i.test(m[1]) ? 'conditionals' : 'modals') },
  { re: /\bto\s+([a-z]+)\b/gi, cat: 'grammar', topic: 'irregulares', msg: 'Después de "to" el verbo va en forma base: want to go (no "to went").',
    fix: (m) => { const w = m[1].toLowerCase(); return PAST_TO_BASE[w] && !BASES.has(w) ? `to ${PAST_TO_BASE[w]}` : null; } },
  { re: /\b(\w+)\b/g, cat: 'grammar', topic: 'irregulares', msg: 'Este verbo es irregular: su pasado no lleva -ed.',
    fix: (m) => { const w = m[1].toLowerCase(); return BAD_PAST.has(w) ? keepCase(m[1], MISSPELLED[w]) : null; } },
  { re: /\bmore (better|worse|bigger|smaller|easier|harder|faster|cheaper|older|younger|higher|lower|larger|longer|shorter|stronger|happier|safer|newer|bigger)\b/gi,
    cat: 'grammar', topic: 'comparativos', msg: 'No uses "more" con un comparativo en -er.', fix: (m) => m[1] },
  { re: /\b(better|worse|bigger|smaller|easier|harder|faster|cheaper|older|younger|higher|lower|larger|longer|shorter|stronger|safer|newer) that\b/gi,
    cat: 'grammar', topic: 'comparativos', msg: 'Para comparar se usa "than", no "that".', fix: (m) => `${m[1]} than` },
  { re: /\b(I|i|you|we|they)('m|'re| am| are) agree\b/g, cat: 'grammar', topic: 'expresiones', msg: '"Agree" es un verbo: I agree (no "I am agree").',
    fix: (m) => `${m[1] === 'i' ? 'I' : m[1]} agree` },
  { re: /\b(I|he|she|we|they|you)\s+born\b/gi, cat: 'grammar', topic: 'passive', msg: '"Nacer" en inglés es pasivo: I was born.',
    fix: (m) => `${m[1]} ${/^(we|they|you)$/i.test(m[1]) ? 'were' : 'was'} born` },
  { re: /\bexplain(s|ed)? (me|him|her|us|them)\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice explain TO someone.', fix: (m) => `explain${m[1] || ''} to ${m[2]}` },
  { re: /\bdepend(s|ed|ing)? of\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice depend ON.', fix: (m) => `depend${m[1] || ''} on` },
  { re: /\bmarried with\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice married TO.', fix: () => 'married to' },
  { re: /\bdiscuss(es|ed|ing)? about\b/gi, cat: 'grammar', topic: 'preposiciones', msg: '"Discuss" no lleva "about".', fix: (m) => `discuss${m[1] || ''}` },
  { re: /\bin the night\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice AT night.', fix: () => 'at night' },
  { re: /\bin (monday|tuesday|wednesday|thursday|friday|saturday|sunday|the weekend)s?\b/gi, cat: 'grammar', topic: 'preposiciones',
    msg: 'Con días se usa ON (on Monday) y "at/on the weekend".', fix: (m) => (/weekend/i.test(m[1]) ? 'at the weekend' : `on ${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()}`) },
  { re: /\barriv(e|es|ed|ing) to\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice arrive IN (ciudad/país) o AT (lugar): arrive at the port.', fix: (m) => `arriv${m[1]} at` },
  { re: /\blisten(s|ed|ing)? (music|the radio|me|him|her|us|them|my|the)\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice listen TO.', fix: (m) => `listen${m[1] || ''} to ${m[2]}` },
  { re: /\baccording with\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice according TO.', fix: () => 'according to' },
  { re: /\bconsist(s|ed)? in\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice consist OF.', fix: (m) => `consist${m[1] || ''} of` },
  { re: /\binterested (on|for)\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice interested IN.', fix: () => 'interested in' },
  { re: /\bresponsible of\b/gi, cat: 'grammar', topic: 'preposiciones', msg: 'Se dice responsible FOR.', fix: () => 'responsible for' },
  { re: new RegExp(`\\bduring ${NUM_WORDS} (years|months|weeks|days|hours)\\b`, 'gi'), cat: 'grammar', topic: 'preposiciones',
    msg: 'Para duración se usa FOR: for three years.', fix: (m) => m[0].replace(/^during/i, 'for') },
  { re: new RegExp(`\\bsince ${NUM_WORDS} (years|months|weeks|days|hours)\\b`, 'gi'), cat: 'grammar', topic: 'present-perfect',
    msg: 'FOR + duración (for 5 years); SINCE + punto de inicio (since 2019).', fix: (m) => m[0].replace(/^since/i, 'for') },
  { re: /\b(informations|advices|equipments|furnitures|knowledges|softwares|homeworks|researches|evidences|feedbacks)\b/gi, cat: 'grammar', topic: 'incontables',
    msg: 'Es incontable: no lleva -s.', fix: (m) => m[1].replace(/s$/i, '') },
  { re: /\ba ([aeiou][a-z]+)\b/g, cat: 'grammar', topic: 'articulos', msg: 'Antes de sonido vocal se usa "an".',
    fix: (m) => (/^(uni|use|usu|eu|one|once|ur|uk|ufo)/.test(m[1]) ? null : `an ${m[1]}`) },
  { re: /\ban ([bcdfgjklmnpqrstvwxyz][a-z]+)\b/g, cat: 'grammar', topic: 'articulos', msg: 'Antes de sonido consonante se usa "a".',
    fix: (m) => (/^(hour|honest|honou?r|heir|herb)/.test(m[1]) ? null : `a ${m[1]}`) },
  { re: /(^|[.!?]\s+|\b(?:because|but|and|so|when|if|that|why|although)\s+)(is|was) (important|necessary|raining|possible|impossible|difficult|easy|hot|cold|good|bad|true|normal|hard|clear|better|dangerous|interesting|sunny|windy)\b/gi,
    cat: 'grammar', topic: 'sujeto', msg: 'Falta el sujeto: It is important… / It is raining.', pre: 1,
    fix: (m) => `${/[a-z]\s+$/i.test(m[1]) ? 'it' : 'It'} ${m[2].toLowerCase()} ${m[3]}` },
  { re: /\b(I am|I'm|he is|she is|he's|she's|I was|he was|she was)\s+(electrician|engineer|officer|technician|student|mechanic|sailor|seafarer|captain|teacher|doctor|ETO|electrical engineer|electro-technical officer|apprentice|cadet|oiler|wiper|fitter|operator)\b/gi,
    cat: 'grammar', topic: 'articulos', msg: 'Con profesiones se usa a / an: I am an electrician.',
    fix: (m) => `${m[1]} ${/^[aeiou]|^ETO/i.test(m[2]) ? 'an' : 'a'} ${m[2]}` },
  { re: /\b(in|on|at) (the|my|our|this|that) (\w+ )?(\w+) (have|has)\b/gi, cat: 'grammar', topic: 'there-is', msg: 'Para decir "hay" se usa there is / there are.',
    fix: (m) => (PRONOUNS.has(m[4].toLowerCase()) ? null : `${m[1]} ${m[2]} ${m[3] || ''}${m[4]} there ${m[5].toLowerCase() === 'has' ? 'is' : 'are'}`) },
  { re: /\b(make|makes|made|making) (a |some )?(photo|photos|picture|pictures|question|questions)\b/gi, cat: 'grammar', topic: 'expresiones',
    msg: 'Se dice TAKE a photo y ASK a question.',
    fix: (m) => { const ask = /question/i.test(m[3]); const v = m[1].toLowerCase(); const t = { make: ask ? 'ask' : 'take', makes: ask ? 'asks' : 'takes', made: ask ? 'asked' : 'took', making: ask ? 'asking' : 'taking' }[v]; return `${t} ${m[2] || ''}${m[3]}`; } },
  { re: /\bassist(s|ed|ing)? to\b/gi, cat: 'grammar', topic: 'expresiones', msg: '"Asistir a" es ATTEND (assist = ayudar).', fix: (m) => `attend${m[1] || ''}` },
  { re: /\bfor to\b/gi, cat: 'grammar', topic: 'infinitivo', msg: 'Para expresar propósito usa "to" o "in order to".', fix: () => 'to' },
  { re: /\bwant(s|ed)? that (you|he|she|they|we|I|him|her|them|us|me)\b/gi, cat: 'grammar', topic: 'infinitivo', msg: 'Se dice want + persona + to: I want you to…',
    fix: (m) => `want${m[1] || ''} ${({ i: 'me', he: 'him', she: 'her', they: 'them', we: 'us' })[m[2].toLowerCase()] || m[2]} to` },
  { re: /\b(enjoy|enjoys|enjoyed|finish|finished|finishes|avoid|avoided|avoids|suggest|suggested|mind|consider|considered) to ([a-z]+)\b/gi, cat: 'grammar', topic: 'gerundio',
    msg: 'Después de este verbo va -ing.', fix: (m) => (BASES.has(m[2].toLowerCase()) ? `${m[1]} ${ing(m[2])}` : null) },
  { re: /\blook(s|ing|ed)? forward to ([a-z]+)\b/gi, cat: 'grammar', topic: 'gerundio', msg: '"Look forward to" va seguido de -ing.',
    fix: (m) => (BASES.has(m[2].toLowerCase()) && m[2].toLowerCase() !== 'see' ? `look${m[1] || ''} forward to ${ing(m[2])}` : m[2].toLowerCase() === 'see' ? `look${m[1] || ''} forward to seeing` : null) },
  { re: /\bif\s+(i|you|he|she|it|we|they|the \w+)\s+will\b/gi, cat: 'grammar', topic: 'conditionals', msg: 'Después de "if" no se usa "will": If it rains, we will…',
    fix: (m) => `if ${m[1]}` },
  { re: /\bthe most of\b/gi, cat: 'grammar', topic: 'expresiones', msg: '"La mayoría de" es "most of" (sin "the").', fix: () => 'most of' },
  { re: /\b([a-z]+)\s+\1\b/gi, cat: 'mech', topic: 'ortografia', msg: 'Palabra repetida.', fix: (m) => (/^(that|had|is|do)$/i.test(m[1]) ? null : m[1]) },
  { re: /\b([a-zA-Z]+)\b/g, cat: 'mech', topic: 'ortografia', msg: 'Ortografía.',
    fix: (m) => { const w = m[1].toLowerCase(); const f = MISSPELLED[w]; return f && !BAD_PAST.has(w) ? keepCase(m[1], f) : null; } },
  { re: /[A-Za-zÁÉÍÓÚáéíóúñÑ¿¡]+/g, cat: 'vocab', topic: 'vocabulario', msg: 'Palabra en español.',
    fix: (m) => (SPANISH.has(m[0].toLowerCase()) || /[áéíóúñÑ¿¡]/.test(m[0]) ? '(en inglés)' : null) },
  { re: /(^|[.!?]\s+)([a-z][a-z']*)/g, cat: 'mech', topic: 'mayusculas', msg: 'Cada oración empieza con mayúscula.', pre: 1,
    fix: (m) => (m[1] === '' || /[.!?]\s+$/.test(m[1]) ? m[2][0].toUpperCase() + m[2].slice(1) : null) },
  { re: /,(?=[A-Za-z])/g, cat: 'mech', topic: 'puntuacion', msg: 'Después de la coma va un espacio.', fix: () => ', ' },
  { re: /\.(?=[A-Z][a-z])/g, cat: 'mech', topic: 'puntuacion', msg: 'Después del punto va un espacio.', fix: () => '. ' },
  { re: /[ \t]+([,.;:!?])/g, cat: 'mech', topic: 'puntuacion', msg: 'Sin espacio antes de la puntuación.', fix: (m) => m[1] },
];

function ing(v) {
  v = v.toLowerCase();
  if (v.endsWith('ie')) return `${v.slice(0, -2)}ying`;
  if (/[^e]e$/.test(v) && v !== 'be') return `${v.slice(0, -1)}ing`;
  if (/^(stop|run|swim|get|put|sit|cut|plan|begin|shop)$/.test(v)) return `${v}${v.slice(-1)}ing`;
  return `${v}ing`;
}

// ---------- Detección de estructuras ----------

const ED = '[a-z]+ed';
const PP = () => `(?:${[...PARTICIPLES].map((x) => x.replace(/'/g, "\\'")).join('|')}|${ED})`;
let PP_RE = null;
const ppRe = () => PP_RE || (PP_RE = PP());

const STRUCTURES = {
  'present-simple': (t) => /\b(he|she|it)\s+(?!was\b|is\b|has\b)[a-z]+s\b/i.test(t) || /\b(i|you|we|they)\s+(usually\s+|always\s+|often\s+|sometimes\s+|never\s+)?(work|live|like|have|go|get|check|start|need|want|love|enjoy|study|eat|play|use|know|think|prefer|spend|wake|finish|repair|test)\b/i.test(t) || /\b(don't|doesn't)\s+[a-z]+/i.test(t),
  'present-continuous': (t) => /\b(am|is|are|'m|'re)\s+(not\s+)?[a-z]+ing\b/i.test(t),
  'present-perfect': (t) => new RegExp(`\\b(have|has|'ve|haven't|hasn't)\\s+(not\\s+|never\\s+|already\\s+|just\\s+|ever\\s+|recently\\s+)?${ppRe()}\\b`, 'i').test(t),
  'present-perfect-continuous': (t) => /\b(have|has|'ve)\s+(not\s+)?been\s+[a-z]+ing\b/i.test(t),
  'past-simple': (t) => (t.toLowerCase().match(/[a-z']+/g) || []).some((w) => (IRR_PAST.has(w) && !BASES.has(w)) || (w.endsWith('ed') && baseFromEd(w))) ,
  'past-continuous': (t) => /\b(was|were|wasn't|weren't)\s+(not\s+)?[a-z]+ing\b/i.test(t),
  'past-perfect': (t) => new RegExp(`\\b(had|'d|hadn't)\\s+(not\\s+|never\\s+|already\\s+|just\\s+)?${ppRe()}\\b`, 'i').test(t),
  'past-perfect-continuous': (t) => /\b(had|'d)\s+(not\s+)?been\s+[a-z]+ing\b/i.test(t),
  'future-will': (t) => /\b(will|'ll|won't)\b/i.test(t),
  'going-to': (t) => /\b(am|is|are|'m|'re|'s)\s+(not\s+)?going\s+to\b/i.test(t),
  'future-continuous': (t) => /\bwill\s+(not\s+)?be\s+[a-z]+ing\b/i.test(t),
  'future-perfect': (t) => new RegExp(`\\bwill\\s+(not\\s+)?have\\s+${ppRe()}\\b`, 'i').test(t),
  'future-perfect-continuous': (t) => /\bwill\s+have\s+been\s+[a-z]+ing\b/i.test(t),
  'used-to': (t) => /\bused\s+to\b/i.test(t),
  modals: (t) => /\b(can|could|should|must|might|may|have to|has to|mustn't|shouldn't|can't|couldn't)\b/i.test(t),
  passive: (t) => new RegExp(`\\b(is|are|was|were|be|been|being|isn't|aren't|wasn't|weren't)\\s+(not\\s+)?(being\\s+)?${ppRe()}\\b`, 'i').test(t),
  conditionals: (t) => /\bif\b/i.test(t) && /\b(would|will|could|might|'d|'ll)\b/i.test(t),
};

// ---------- Utilidades de texto ----------

export const wordsOf = (text) => text.match(/[A-Za-zÀ-ÿ0-9]+(?:['’-][A-Za-zÀ-ÿ]+)*/g) || [];
export const countWords = (text) => wordsOf(text).length;
const sentencesOf = (text) => (text.match(/[^.!?\n]+[.!?]*/g) || []).map((s) => s.trim()).filter((s) => wordsOf(s).length);
const clamp = (x) => Math.max(0, Math.min(1, x));

function mattr(tokens, win = 40) {
  if (tokens.length <= win) return tokens.length ? new Set(tokens).size / tokens.length : 0;
  let sum = 0; let n = 0;
  for (let i = 0; i + win <= tokens.length; i += 5) { sum += new Set(tokens.slice(i, i + win)).size / win; n++; }
  return sum / n;
}

function connectorsFor(level) {
  const order = ['A1', 'A2', 'B1', 'B2', 'C1'];
  return order.slice(0, order.indexOf(level) + 1).flatMap((l) => CONNECTORS[l]).concat(
    order.indexOf(level) < 2 ? CONNECTORS.B1.slice(0, 2) : order.indexOf(level) < 3 ? CONNECTORS.B2 : CONNECTORS.C1);
}
const ADVANCED = new Set([...CONNECTORS.B2, ...CONNECTORS.C1]);

// ---------- Palabras pedidas ----------

const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function forms(w) {
  const out = new Set([w, `${w}s`, `${w}es`, `${w}ed`, `${w}d`, `${w}ing`, `${w}er`, `${w}ly`]);
  if (w.endsWith('e')) out.add(`${w.slice(0, -1)}ing`);
  if (/[^aeiou]y$/.test(w)) { out.add(`${w.slice(0, -1)}ies`); out.add(`${w.slice(0, -1)}ied`); }
  if (/[^aeiou][aeiou][bdgmnprt]$/.test(w)) { out.add(`${w}${w.slice(-1)}ed`); out.add(`${w}${w.slice(-1)}ing`); }
  const irr = IRREGULAR.find((v) => v[0] === w);
  if (irr) [...split(irr[1]), ...split(irr[2])].forEach((x) => out.add(x));
  if (PAST_TO_BASE[w]) out.add(PAST_TO_BASE[w]);
  return [...out];
}
// ¿Usó la palabra o expresión (en cualquier forma: worked, working, went…)?
export function usesWord(text, word) {
  const parts = word.toLowerCase().split(/\s+/);
  const last = parts.pop();
  const head = parts.map(esc).join('\\s+');
  const re = new RegExp(`\\b${head ? `${head}\\s+` : ''}(?:${forms(last).map(esc).join('|')})\\b`, 'i');
  return re.test(text.replace(/[’]/g, "'"));
}

// ---------- Calificación ----------

export function findErrors(text) {
  const out = [];
  for (const r of RULES) {
    r.re.lastIndex = 0;
    for (const m of text.matchAll(r.re)) {
      const fix = r.fix(m, text);
      if (fix == null) continue;
      const off = r.pre ? (m[r.pre] || '').length : 0;
      const start = m.index + off;
      const end = m.index + m[0].length;
      const wrong = text.slice(start, end);
      if (fix === wrong) continue;
      out.push({ start, end, wrong, fix, msg: r.msg, cat: r.cat, topic: r.topicOf ? r.topicOf(m) : r.topic });
    }
  }
  // Sentence-level: marcador de pasado + present perfect → pasado simple.
  for (const m of text.matchAll(/[^.!?\n]+/g)) {
    const s = m[0];
    if (!/\b(yesterday|ago|last (week|month|year|night|time|monday|summer|winter|voyage|contract)|in (19|20)\d\d)\b/i.test(s)) continue;
    const pp = s.match(new RegExp(`\\b(have|has|'ve)\\s+(already\\s+|never\\s+|just\\s+)?(${ppRe()})\\b`, 'i'));
    if (!pp || /\b(since|for)\b/i.test(s)) continue;
    const verb = pp[3].toLowerCase();
    const past = Object.entries(PAST_TO_BASE).find(([, b]) => IRREGULAR.find((v) => v[0] === b && split(v[2]).includes(verb)))?.[0] || verb;
    const start = m.index + pp.index;
    out.push({ start, end: start + pp[0].length, wrong: pp[0], fix: past, cat: 'grammar', topic: 'past-simple',
      msg: 'Con "yesterday", "ago", "last…" o un año se usa pasado simple, no present perfect.' });
  }
  // Punto final.
  const trimmed = text.replace(/\s+$/, '');
  const lastW = trimmed.match(/([A-Za-z0-9']+)$/);
  if (lastW) out.push({ start: lastW.index, end: trimmed.length, wrong: lastW[1], fix: `${lastW[1]}.`, cat: 'mech', topic: 'puntuacion', msg: 'Termina el texto con punto.' });
  // Ordenar y quitar solapes (gana el primero / más específico).
  out.sort((a, b) => a.start - b.start || b.end - a.end);
  const clean = [];
  for (const e of out) {
    const last = clean[clean.length - 1];
    if (last && e.start < last.end) continue;
    clean.push(e);
  }
  return clean;
}

export function gradeEssay(text, essay) {
  const L = ESSAY_LEVELS.find((l) => l.level === essay.level);
  const words = wordsOf(text);
  const W = words.length;
  const lower = words.map((w) => w.toLowerCase());
  const errors = findErrors(text);
  const g = errors.filter((e) => e.cat === 'grammar').length;
  const mech = errors.filter((e) => e.cat === 'mech').length;
  const spanish = errors.filter((e) => e.cat === 'vocab').length;
  const per100 = (n) => (n * 100) / Math.max(W, 30);

  // 1) Extensión (15)
  let ext = W >= L.min && W <= L.max ? 15 : W < L.min ? 15 * clamp(W / L.min) ** 1.5 : W <= L.max * 1.25 ? 13 : 10;
  // 2) Gramática (35): 10 errores por cada 100 palabras → 0
  const gram = 35 * clamp(1 - per100(g) / 10) * clamp(W / (L.min * 0.5));
  // 3) Ortografía y puntuación (15)
  const mechScore = 15 * clamp(1 - per100(mech) / 6) * clamp(W / (L.min * 0.5));
  // 4) Vocabulario (15)
  const content = lower.filter((w) => !STOP.has(w));
  const div = mattr(lower);
  const avgLen = content.length ? content.reduce((s, w) => s + w.length, 0) / content.length : 0;
  const targetLen = { A1: 4.6, A2: 4.9, B1: 5.2, B2: 5.5, C1: 5.8 }[essay.level];
  let vocab = 10 * clamp((div - 0.5) / 0.25) + 5 * clamp((avgLen - (targetLen - 0.8)) / 0.8) - 2 * spanish;
  vocab = Math.max(0, vocab) * clamp(W / (L.min * 0.5));
  const freq = {};
  for (const w of content) if (w.length > 2) freq[w] = (freq[w] || 0) + 1;
  const repeated = Object.entries(freq).filter(([, n]) => n >= Math.max(3, Math.round(W / 30))).sort((a, b) => b[1] - a[1]).slice(0, 4);
  // 5) Organización (10): conectores, párrafos, longitud de oraciones
  const low = ` ${lower.join(' ')} `;
  const conns = connectorsFor(essay.level).filter((c) => low.includes(` ${c} `));
  const usedConns = [...new Set(conns)];
  const hasAdvanced = usedConns.some((c) => ADVANCED.has(c));
  let connPts = 6 * clamp(usedConns.length / L.connectors);
  if (['B2', 'C1'].includes(essay.level) && !hasAdvanced) connPts = Math.min(connPts, 4);
  const paragraphs = text.split(/\n+/).filter((p) => wordsOf(p).length >= 5).length;
  const needParas = ['B1', 'B2', 'C1'].includes(essay.level) ? (essay.level === 'B1' ? 2 : 3) : 1;
  const paraPts = paragraphs >= needParas ? 2 : paragraphs >= 2 ? 1 : 0;
  const sents = sentencesOf(text);
  const avgSent = sents.length ? W / sents.length : 0;
  const longSents = sents.filter((s) => wordsOf(s).length > L.sentence[1] * 2);
  const [lo, hi] = L.sentence;
  const sentPts = avgSent >= lo && avgSent <= hi ? 2 : avgSent >= lo * 0.6 && avgSent <= hi * 1.4 ? 1 : 0;
  const org = (connPts + paraPts + Math.max(0, sentPts - (longSents.length ? 1 : 0))) * clamp(W / (L.min * 0.5));
  // 6) Estructuras pedidas (10)
  const needs = essay.use || [];
  const found = needs.filter((k) => STRUCTURES[k]?.(text));
  const missing = needs.filter((k) => !found.includes(k));
  const struct = needs.length ? 10 * (found.length / needs.length) * clamp(W / (L.min * 0.4)) : 10;
  // 7) Reto: palabras pedidas (10). Se toman 5 puntos de extensión y 5 de vocabulario.
  const req = essay.words || [];
  const wordsUsed = req.filter((w) => usesWord(text, w));
  const wordsMissing = req.filter((w) => !wordsUsed.includes(w));
  const isChallenge = req.length > 0;
  if (isChallenge) { ext *= 10 / 15; vocab *= 10 / 15; }

  const parts = [
    { key: 'extension', name: 'Extensión', got: ext, max: isChallenge ? 10 : 15 },
    { key: 'gramatica', name: 'Gramática', got: gram, max: 35 },
    { key: 'ortografia', name: 'Ortografía y puntuación', got: mechScore, max: 15 },
    { key: 'vocabulario', name: 'Vocabulario', got: vocab, max: isChallenge ? 10 : 15 },
    { key: 'organizacion', name: 'Organización y conectores', got: org, max: 10 },
    { key: 'estructuras', name: isChallenge ? 'Tiempos verbales del reto' : 'Estructuras del tema', got: struct, max: 10 },
    isChallenge ? { key: 'palabras', name: 'Palabras del reto', got: 10 * (wordsUsed.length / req.length) * clamp(W / (L.min * 0.4)), max: 10 } : null,
  ].filter(Boolean).map((p) => ({ ...p, got: Math.round(p.got) }));
  const score = Math.max(0, Math.min(100, parts.reduce((s, p) => s + p.got, 0)));

  // ---------- Qué estudiar ----------
  const study = [];
  const byTopic = {};
  for (const e of errors) (byTopic[e.topic] ||= []).push(e);
  const tenseName = (k) => TENSES.find((t) => t.id === k)?.name;
  for (const [topic, list] of Object.entries(byTopic).sort((a, b) => b[1].length - a[1].length)) {
    const ex = list.slice(0, 2).map((e) => `"${e.wrong}" → "${e.fix}"`).join(' · ');
    study.push({ topic, count: list.length, title: tenseName(topic) || TOPICS[topic]?.name || (topic === 'irregulares' ? 'Verbos irregulares' : topic),
      why: `${list.length} error${list.length > 1 ? 'es' : ''}: ${ex}`, tip: TOPICS[topic]?.tip || list[0].msg });
  }
  for (const k of missing) {
    study.push({ topic: k, count: 1, title: tenseName(k) || k, why: 'El tema pedía usar esta estructura y no la encontré.',
      tip: 'Repasa el tema y escribe al menos dos oraciones con esta estructura.' });
  }
  if (wordsMissing.length) {
    study.push({ topic: 'palabras', title: 'Palabras del reto', why: `No usaste: ${wordsMissing.join(', ')}.`,
      tip: 'Busca su significado (mantén presionada la palabra) y escribe una oración con cada una.' });
  }
  if (W < L.min) study.push({ topic: 'extension', title: 'Extensión', why: `Escribiste ${W} palabras; el mínimo es ${L.min}.`, tip: TOPICS.extension.tip });
  if (usedConns.length < L.connectors || (['B2', 'C1'].includes(essay.level) && !hasAdvanced)) {
    const sug = connectorsFor(essay.level).filter((c) => !usedConns.includes(c)).slice(-6);
    study.push({ topic: 'conectores', title: 'Conectores', why: `Usaste ${usedConns.length} de ${L.connectors} recomendados${usedConns.length ? ` (${usedConns.join(', ')})` : ''}.`,
      tip: `Prueba con: ${sug.join(', ')}.` });
  }
  if (repeated.length && vocab < 11) {
    study.push({ topic: 'variedad', title: 'Variedad de vocabulario', why: `Repetiste: ${repeated.map(([w, n]) => `${w} (${n}×)`).join(', ')}.`, tip: TOPICS.variedad.tip });
  }
  if (paragraphs < needParas && W >= L.min * 0.6) study.push({ topic: 'parrafos', title: 'Párrafos', why: `Para ${essay.level} se esperan al menos ${needParas} párrafos.`, tip: TOPICS.parrafos.tip });
  if (sentPts < 2 && sents.length > 1) {
    study.push({ topic: 'oraciones', title: 'Longitud de oraciones', why: `Tus oraciones tienen ${avgSent.toFixed(0)} palabras en promedio; lo ideal para ${essay.level} es ${lo}–${hi}.`,
      tip: avgSent < lo ? 'Une ideas con conectores (and, because, although…).' : 'Divide las oraciones muy largas en dos o tres.' });
  }

  // ---------- Lo que hiciste bien ----------
  const good = [];
  if (W >= L.min && W <= L.max * 1.25) good.push(`Cumpliste la extensión (${W} palabras).`);
  if (found.length) good.push(`Usaste ${found.map((k) => tenseName(k) || k).join(', ')}.`);
  if (isChallenge && wordsUsed.length) good.push(`Palabras del reto: ${wordsUsed.join(', ')} (${wordsUsed.length}/${req.length}).`);
  if (usedConns.length) good.push(`Conectores: ${usedConns.join(', ')}.`);
  if (W >= L.min * 0.5 && per100(g) < 2) good.push('Muy pocos errores de gramática.');
  if (W >= L.min * 0.5 && mech === 0) good.push('Sin errores de ortografía ni puntuación detectados.');
  if (div >= 0.7 && W >= 30) good.push('Buen vocabulario variado.');

  const grade = score >= 90 ? 'Excelente' : score >= 75 ? 'Muy bien' : score >= 60 ? 'Aprobado' : score >= 40 ? 'Casi' : 'Sigue practicando';
  return { score, grade, parts, errors, study, good, words: W, found, missing, connectors: usedConns, wordsUsed, wordsMissing };
}
