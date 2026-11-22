// Guía visual: diagramas de referencia dibujados en SVG (funcionan sin internet).
// Clases CSS del SVG definidas en styles.css (.dg ...).

const arrow = (id, cls = 'mk') =>
  `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="${cls}"/></marker></defs>`;

const box = (x, y, w, h, label, sub = '', cls = 'box') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${cls}"/>` +
  `<text x="${x + w / 2}" y="${y + h / 2 + (sub ? -2 : 4)}" text-anchor="middle">${label}</text>` +
  (sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" class="sm muted">${sub}</text>` : '');

const gen = (cx, cy, label) =>
  `<circle cx="${cx}" cy="${cy}" r="16" class="box"/><text x="${cx}" y="${cy + 4}" text-anchor="middle">G</text>` +
  `<text x="${cx}" y="${cy - 22}" text-anchor="middle" class="sm muted">${label}</text>`;

const mot = (cx, cy, label) =>
  `<circle cx="${cx}" cy="${cy}" r="14" class="box"/><text x="${cx}" y="${cy + 4}" text-anchor="middle">M</text>` +
  `<text x="${cx}" y="${cy + 30}" text-anchor="middle" class="sm muted">${label}</text>`;

const brk = (x, y) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" class="brk"/>`;

export const DIAGRAMS = [
  {
    id: 'dp-overview',
    title: 'Sistema DP: visión general',
    titleEn: 'DP system overview',
    svg: `<svg viewBox="0 0 360 260" class="dg" role="img" aria-label="DP system overview">${arrow('a1')}
      ${box(10, 10, 100, 34, 'Gyro', 'heading')}
      ${box(10, 52, 100, 34, 'Wind sensor', 'speed / dir.')}
      ${box(10, 94, 100, 34, 'MRU', 'roll pitch heave')}
      ${box(10, 150, 100, 34, 'DGPS', 'position ref.')}
      ${box(10, 192, 100, 34, 'Laser / HPR', 'position ref.')}
      <text x="60" y="246" text-anchor="middle" class="sm muted">SENSORS &amp; REFERENCES</text>
      ${box(140, 85, 90, 80, 'DP controller', 'model + Kalman', 'box hl')}
      ${box(150, 190, 70, 30, 'Operator', 'station')}
      <path d="M110 27 H125 V115 M110 69 H125 M110 111 H125 M110 167 H125 M110 209 H125 V145" class="sig"/>
      <path d="M125 115 H138" class="sig" marker-end="url(#a1)"/>
      <path d="M125 145 H138" class="sig" marker-end="url(#a1)"/>
      <path d="M185 188 V167" class="sig" marker-end="url(#a1)"/>
      ${box(258, 20, 92, 34, 'Bow thrusters', 'tunnel')}
      ${box(258, 66, 92, 34, 'Azimuth', 'or main props')}
      ${box(258, 112, 92, 34, 'Stern thrusters', '')}
      <path d="M230 110 H244 M244 37 V129" class="sig"/>
      <path d="M244 37 H256" class="sig" marker-end="url(#a1)"/>
      <path d="M244 83 H256" class="sig" marker-end="url(#a1)"/>
      <path d="M244 129 H256" class="sig" marker-end="url(#a1)"/>
      ${box(258, 178, 92, 48, 'Power system', 'gens + switchboard', 'box pw')}
      <path d="M304 176 V148" class="wire" marker-end="url(#a1)"/>
      <text x="304" y="246" text-anchor="middle" class="sm muted">THRUSTERS &amp; POWER</text>
    </svg>`,
    explain: [
      'El controlador DP recibe datos de los <b>sensores</b> (gyro, viento, MRU) y de las <b>referencias de posición</b> (DGPS, láser, HPR, taut wire).',
      'Un <b>modelo matemático con filtro de Kalman</b> calcula dónde está el buque y qué empuje necesita. Luego envía órdenes de paso/velocidad y ángulo a cada propulsor.',
      'Todo depende del <b>sistema de potencia</b>: sin generadores y cuadros sanos, no hay empuje. Por eso el ETO es clave en un buque DP.',
    ],
    terms: [['position reference system', 'sistema de referencia de posición'], ['Kalman filter', 'filtro de Kalman'], ['thrust allocation', 'asignación de empuje'], ['operator station', 'estación de operador']],
  },
  {
    id: 'dp2-split',
    title: 'Redundancia DP2: cuadro dividido',
    titleEn: 'DP2 redundancy: split switchboard',
    svg: `<svg viewBox="0 0 360 250" class="dg" role="img" aria-label="DP2 split switchboard">
      <rect x="8" y="8" width="168" height="234" rx="12" class="zone"/>
      <rect x="184" y="8" width="168" height="234" rx="12" class="zone"/>
      <text x="92" y="26" text-anchor="middle" class="sm muted">REDUNDANCY GROUP 1 (PORT)</text>
      <text x="268" y="26" text-anchor="middle" class="sm muted">REDUNDANCY GROUP 2 (STBD)</text>
      ${gen(50, 62, 'G1')}${gen(130, 62, 'G2')}${gen(230, 62, 'G3')}${gen(310, 62, 'G4')}
      <path d="M50 78 V118 M130 78 V118 M230 78 V118 M310 78 V118" class="wire"/>
      ${brk(50, 100)}${brk(130, 100)}${brk(230, 100)}${brk(310, 100)}
      <path d="M24 120 H168 M192 120 H336" class="bus"/>
      <path d="M168 120 H192" class="wire" stroke-dasharray="3 3"/>
      ${brk(180, 120)}
      <text x="180" y="146" text-anchor="middle" class="sm acc">bus-tie</text>
      <text x="180" y="158" text-anchor="middle" class="sm muted">open in CAM</text>
      <text x="96" y="114" text-anchor="middle" class="sm muted">690 V bus A</text>
      <text x="264" y="114" text-anchor="middle" class="sm muted">690 V bus B</text>
      <path d="M50 120 V180 M130 120 V180 M230 120 V180 M310 120 V180" class="wire"/>
      ${brk(50, 145)}${brk(130, 145)}${brk(230, 145)}${brk(310, 145)}
      ${mot(50, 196, 'Bow thr. 1')}${mot(130, 196, 'Azimuth 1')}${mot(230, 196, 'Azimuth 2')}${mot(310, 196, 'Bow thr. 2')}
    </svg>`,
    explain: [
      'En un buque <b>DP2</b> la planta se divide en <b>grupos de redundancia</b>. Cada lado tiene sus generadores, su barra y sus propulsores.',
      'En <b>CAM</b> (modo de actividad crítica) el <b>bus-tie se abre</b>: si falla todo un lado, el otro sigue manteniendo la posición. Esa es la <b>falla del peor caso</b>.',
      'Con el bus-tie cerrado (<b>barra cerrada</b>) se ahorra combustible, pero se necesitan protecciones avanzadas para que una falla no tumbe toda la planta.',
    ],
    terms: [['redundancy group', 'grupo de redundancia'], ['bus-tie breaker', 'interruptor de acoplamiento'], ['worst case failure', 'falla del peor caso'], ['closed bus', 'barra cerrada']],
  },
  {
    id: 'dp-classes',
    title: 'Clases DP: DP1, DP2, DP3',
    titleEn: 'DP equipment classes',
    html: `<table class="dtable">
      <thead><tr><th></th><th>DP1</th><th>DP2</th><th>DP3</th></tr></thead>
      <tbody>
        <tr><th>Redundancy</th><td>No</td><td>Yes</td><td>Yes</td></tr>
        <tr><th>Single failure of active component</th><td class="bad">Loss of position possible</td><td class="good">Position kept</td><td class="good">Position kept</td></tr>
        <tr><th>Static components (cables, pipes)</th><td>—</td><td>Only if not proven</td><td class="good">Covered</td></tr>
        <tr><th>Fire / flood in one compartment</th><td class="bad">Not covered</td><td class="bad">Not covered</td><td class="good">Covered (A60 + watertight)</td></tr>
        <tr><th>DP controllers</th><td>1</td><td>2 + consequence analysis</td><td>2 + 1 backup in separate room</td></tr>
        <tr><th>Typical vessels</th><td>Small PSV, survey</td><td>PSV, AHTS, ROV, W2W</td><td>Drillships, DSV, flotels</td></tr>
      </tbody></table>`,
    explain: [
      'Las clases las define la <b>IMO (MSC/Circ.645 y MSC.1/Circ.1580)</b> y las sociedades de clasificación (DNV, ABS, LR, BV) con sus propias notaciones.',
      'Frase útil en entrevista: <i>"DP2 means that a single failure of an active component will not cause loss of position."</i>',
    ],
    terms: [['DP class', 'clase DP'], ['active component', 'componente activo'], ['A60 fire division', 'división contra incendio A60'], ['watertight', 'estanco']],
  },
  {
    id: 'dp-refs',
    title: 'Referencias de posición DP',
    titleEn: 'DP position reference systems',
    svg: `<svg viewBox="0 0 360 250" class="dg" role="img" aria-label="Position references">${arrow('a3', 'mk acc')}
      <path d="M0 140 H360" class="sea"/>
      <text x="8" y="134" class="sm muted">sea level</text>
      <path d="M0 236 H360" class="seabed"/>
      <text x="8" y="230" class="sm muted">seabed</text>
      <path d="M120 140 L130 122 H250 L262 140 L250 152 H130 Z" class="box hl"/>
      <rect x="215" y="98" width="28" height="24" rx="3" class="box"/>
      <text x="190" y="142" text-anchor="middle">VESSEL</text>
      <circle cx="40" cy="22" r="10" class="box"/><path d="M28 22 H52 M40 10 V34" class="wire" stroke-width="1.5"/>
      <text x="58" y="20" class="sm">GPS satellites</text>
      <path d="M48 30 L222 96" class="sig" marker-end="url(#a3)"/>
      <text x="96" y="76" class="sm acc">DGPS</text>
      <rect x="300" y="60" width="44" height="80" class="box"/>
      <text x="322" y="54" text-anchor="middle" class="sm muted">platform</text>
      <path d="M244 108 L298 96" class="sig" marker-end="url(#a3)"/>
      <text x="262" y="92" class="sm acc">Laser / radar</text>
      <circle cx="298" cy="96" r="3" class="dot"/>
      <path d="M150 152 V224" class="wire" stroke-width="1.5"/>
      <rect x="140" y="224" width="20" height="10" class="box"/>
      <text x="100" y="196" class="sm acc">Taut wire</text>
      <path d="M232 152 L282 226" class="sig" marker-end="url(#a3)"/>
      <rect x="276" y="224" width="16" height="10" rx="2" class="box"/>
      <text x="256" y="200" class="sm acc">HPR</text>
      <text x="300" y="214" class="sm muted">transponder</text>
    </svg>`,
    explain: [
      '<b>DGPS</b>: GPS con correcciones diferenciales (satélite). Precisión de ~1 m o mejor.',
      '<b>Láser (Fanbeam, CyScan)</b> y <b>radar (RadaScan)</b>: miden distancia y marcación a reflectores o respondedores en la plataforma. Son <b>referencias relativas</b>.',
      '<b>Taut wire</b>: un peso en el fondo con un cable tenso; el ángulo del cable da la posición. <b>HPR</b>: señales acústicas a transpondedores en el fondo.',
      'Para operaciones críticas, las guías IMCA piden normalmente <b>tres referencias</b>, idealmente de principios diferentes.',
    ],
    terms: [['relative reference', 'referencia relativa'], ['absolute reference', 'referencia absoluta'], ['transponder', 'transpondedor'], ['reflector', 'reflector']],
  },
  {
    id: 'dp-alert',
    title: 'Niveles de alerta DP',
    titleEn: 'DP alert levels',
    html: `<div class="alert-levels">
      <div class="lvl green"><b>GREEN</b><span>Normal operation. All systems OK.</span></div>
      <div class="lvl blue"><b>ADVISORY (BLUE)</b><span>A problem, but the operation can continue with care. Inform and monitor.</span></div>
      <div class="lvl yellow"><b>YELLOW</b><span>Degraded status. Stop the operation and prepare to move to a safe position.</span></div>
      <div class="lvl red"><b>RED</b><span>Emergency or loss of position. Stop and move away immediately.</span></div>
    </div>`,
    explain: [
      'Las condiciones exactas para cada color se escriben en el <b>ASOG</b> (o WSOG en perforación).',
      'Ejemplo: perder un generador puede ser <b>azul</b>; perder un lado completo del cuadro, <b>amarillo</b>; un drive-off, <b>rojo</b>.',
    ],
    terms: [['degraded status', 'estado degradado'], ['safe position', 'posición segura'], ['move away', 'alejarse']],
  },
  {
    id: 'sld',
    title: 'Diagrama unifilar típico de un PSV',
    titleEn: 'Typical single line diagram',
    svg: `<svg viewBox="0 0 360 290" class="dg" role="img" aria-label="Single line diagram">
      ${gen(40, 40, 'G1')}${gen(100, 40, 'G2')}${gen(160, 40, 'G3')}${gen(220, 40, 'G4')}
      <path d="M40 56 V80 M100 56 V80 M160 56 V80 M220 56 V80" class="wire"/>
      <path d="M20 80 H250" class="bus"/><text x="256" y="84" class="sm acc">690 V MSB</text>
      <path d="M40 80 V112 M100 80 V112" class="wire"/>
      ${mot(40, 126, 'Thrusters')}${mot(100, 126, 'Big pumps')}
      <path d="M180 80 V108" class="wire"/>
      <circle cx="180" cy="114" r="8" class="box"/><circle cx="180" cy="126" r="8" class="box"/>
      <text x="196" y="124" class="sm muted">690/440 V</text>
      <path d="M180 134 V156" class="wire"/>
      <path d="M140 156 H300" class="bus"/><text x="306" y="160" class="sm acc">440 V</text>
      <path d="M160 156 V178" class="wire"/>${mot(160, 192, 'Fans, pumps')}
      <path d="M250 156 V182" class="wire"/>
      <circle cx="250" cy="188" r="8" class="box"/><circle cx="250" cy="200" r="8" class="box"/>
      <text x="266" y="198" class="sm muted">440/230 V</text>
      <path d="M250 208 V226" class="wire"/>
      <path d="M200 226 H318" class="bus"/><text x="324" y="230" class="sm acc">230 V</text>
      <text x="260" y="244" text-anchor="middle" class="sm muted">lighting, sockets, galley</text>
      <rect x="10" y="232" width="110" height="50" rx="8" class="zone"/>
      <text x="65" y="248" text-anchor="middle" class="sm">Emergency SB</text>
      <text x="65" y="262" text-anchor="middle" class="sm muted">EG + 440/230 V</text>
      <text x="65" y="275" text-anchor="middle" class="sm muted">24 V DC + UPS</text>
      <path d="M140 156 V172 H65 V230" class="wire" stroke-dasharray="4 3"/>
      <text x="70" y="208" class="sm muted">feeder</text>
    </svg>`,
    explain: [
      'Los generadores alimentan el <b>cuadro principal (MSB)</b>, por ejemplo a 690 V. De ahí salen los grandes consumidores (thrusters, bombas grandes).',
      'Los <b>transformadores</b> bajan a 440 V (bombas, ventiladores) y a 230 V (alumbrado, enchufes, cocina).',
      'El <b>cuadro de emergencia</b> se alimenta normalmente desde el principal; en un blackout, el <b>generador de emergencia</b> arranca y lo alimenta en ≤ 45 s. El 24 V DC y los UPS cubren el tiempo de transición.',
    ],
    terms: [['single line diagram', 'diagrama unifilar'], ['main switchboard (MSB)', 'cuadro principal'], ['emergency switchboard (ESB)', 'cuadro de emergencia'], ['feeder', 'alimentador']],
  },
  {
    id: 'voltages',
    title: 'Tipos de voltaje a bordo',
    titleEn: 'Voltage levels on board',
    svg: `<svg viewBox="0 0 360 270" class="dg" role="img" aria-label="Voltage levels">
      ${[
        ['11 kV / 6.6 kV', 'HV: large diesel-electric, drillships', 'hv', 10],
        ['3.3 kV', 'HV: big thruster motors', 'hv', 48],
        ['690 V AC', 'LV: main bus on PSV/AHTS, thrusters', 'lv', 86],
        ['440 V AC', 'LV: pumps, fans, compressors (60 Hz)', 'lv', 124],
        ['400 V AC', 'LV: same use at 50 Hz', 'lv', 162],
        ['230 / 220 V AC', 'LV: lighting, sockets, galley', 'lv', 200],
        ['24 V DC', 'ELV: alarms, control, radio, emergency', 'elv', 238],
      ].map(([v, d, c, y]) => `<rect x="10" y="${y}" width="340" height="30" rx="8" class="lvl-${c}"/>
        <text x="20" y="${y + 19}">${v}</text><text x="130" y="${y + 19}" class="sm">${d}</text>`).join('')}
    </svg>`,
    explain: [
      '<b>Baja tensión (LV)</b>: hasta 1000 V AC. <b>Alta tensión (HV)</b> en buques: por encima de 1000 V AC (normalmente 3,3 / 6,6 / 11 kV). <b>Muy baja tensión (ELV)</b>: menos de 50 V AC o 120 V DC.',
      '<b>AC</b> (corriente alterna) para potencia; <b>DC</b> (corriente continua) en baterías, 24 V, UPS, bus DC de los variadores y sistemas híbridos.',
      'Frecuencia: la mayoría de los buques offshore usan <b>60 Hz</b> (440/690 V); algunos europeos usan <b>50 Hz</b> (400 V).',
      'Recuerda: <b>tensión de línea = tensión de fase × 1,73</b> en estrella. 440 V de línea ≈ 254 V de fase.',
    ],
    terms: [['low voltage', 'baja tensión'], ['high voltage', 'alta tensión'], ['extra low voltage', 'muy baja tensión'], ['line voltage', 'tensión de línea'], ['phase voltage', 'tensión de fase']],
  },
  {
    id: 'star-delta',
    title: 'Conexión estrella y triángulo',
    titleEn: 'Star and delta connection',
    svg: `<svg viewBox="0 0 360 200" class="dg" role="img" aria-label="Star and delta">
      <text x="90" y="20" text-anchor="middle" class="acc">STAR (Y)</text>
      <path d="M90 100 L90 40 M90 100 L38 130 M90 100 L142 130" class="coil"/>
      <circle cx="90" cy="100" r="4" class="dot"/>
      <text x="100" y="104" class="sm muted">N (neutral)</text>
      <text x="90" y="34" text-anchor="middle" class="sm">L1</text><text x="28" y="142" class="sm">L2</text><text x="146" y="142" class="sm">L3</text>
      <text x="90" y="172" text-anchor="middle" class="sm">V line = 1.73 × V phase</text>
      <text x="90" y="188" text-anchor="middle" class="sm muted">I line = I phase</text>
      <text x="270" y="20" text-anchor="middle" class="acc">DELTA (Δ)</text>
      <path d="M270 40 L215 130 L325 130 Z" class="coil" fill="none"/>
      <text x="270" y="34" text-anchor="middle" class="sm">L1</text><text x="200" y="142" class="sm">L2</text><text x="328" y="142" class="sm">L3</text>
      <text x="270" y="172" text-anchor="middle" class="sm">V line = V phase</text>
      <text x="270" y="188" text-anchor="middle" class="sm muted">I line = 1.73 × I phase</text>
    </svg>`,
    explain: [
      'En <b>estrella</b> un extremo de cada devanado se une en el <b>neutro</b>. Los generadores suelen estar en estrella.',
      'En <b>triángulo</b> los devanados forman un lazo cerrado. Muchos motores trabajan en triángulo.',
      'El <b>arrancador estrella-triángulo</b> arranca en estrella (voltaje por devanado ÷ 1,73 → corriente de arranque ≈ 1/3) y luego cambia a triángulo.',
    ],
    terms: [['star connection', 'conexión en estrella'], ['delta connection', 'conexión en triángulo'], ['neutral point', 'punto neutro'], ['star-delta starter', 'arrancador estrella-triángulo']],
  },
  {
    id: 'sync',
    title: 'Sincronización de generadores',
    titleEn: 'Generator synchronization',
    svg: `<svg viewBox="0 0 360 220" class="dg" role="img" aria-label="Synchroscope">${arrow('a4', 'mk acc')}
      <circle cx="100" cy="110" r="80" class="box"/>
      <text x="100" y="44" text-anchor="middle" class="acc">12</text>
      <text x="168" y="114" text-anchor="middle" class="sm">FAST</text>
      <text x="32" y="114" text-anchor="middle" class="sm">SLOW</text>
      <path d="M100 110 L118 50" class="needle"/>
      <circle cx="100" cy="110" r="5" class="dot"/>
      <path d="M150 60 A70 70 0 0 1 166 92" class="sig" marker-end="url(#a4)"/>
      <path d="M86 40 A72 72 0 0 1 114 40" class="ok-arc"/>
      <text x="100" y="206" text-anchor="middle" class="sm muted">close just before 12 o'clock</text>
      <text x="200" y="40" class="acc">4 conditions</text>
      <text x="200" y="66">1. Same voltage</text>
      <text x="200" y="90">2. Same frequency</text>
      <text x="200" y="114">3. Same phase sequence</text>
      <text x="200" y="138">4. In phase (angle ≈ 0°)</text>
      <text x="200" y="170" class="sm muted">Incoming slightly faster:</text>
      <text x="200" y="186" class="sm muted">needle turns slowly clockwise</text>
    </svg>`,
    explain: [
      'El <b>sincronoscopio</b> muestra la diferencia de fase entre el generador entrante y la barra. Si gira en sentido horario, el entrante va más rápido (FAST).',
      'Se cierra el interruptor <b>justo antes de las 12</b>, con giro lento. El <b>relé check-sync</b> bloquea el cierre si las condiciones no se cumplen.',
    ],
    terms: [['synchroscope', 'sincronoscopio'], ['incoming generator', 'generador entrante'], ['check synchronizing relay', 'relé de verificación de sincronismo'], ['phase angle', 'ángulo de fase']],
  },
  {
    id: 'vfd',
    title: 'Variador de frecuencia (VFD)',
    titleEn: 'Frequency converter (VFD)',
    svg: `<svg viewBox="0 0 360 180" class="dg" role="img" aria-label="VFD">${arrow('a5')}
      <text x="14" y="70" class="sm muted">690 V</text><text x="14" y="84" class="sm muted">60 Hz AC</text>
      <path d="M50 90 H70" class="wire" marker-end="url(#a5)"/>
      ${box(72, 60, 76, 60, 'Rectifier', 'AC → DC')}
      <path d="M148 90 H164" class="wire"/>
      ${box(164, 60, 60, 60, 'DC link', 'capacitors', 'box pw')}
      <path d="M224 90 H240" class="wire"/>
      ${box(240, 60, 76, 60, 'Inverter', 'IGBT DC → AC')}
      <path d="M316 90 H330" class="wire" marker-end="url(#a5)"/>
      ${mot(344, 90, '')}
      <text x="278" y="140" text-anchor="middle" class="sm muted">variable V and Hz</text>
      <text x="194" y="40" text-anchor="middle" class="sm acc">⚠ stays charged after switch off</text>
      <text x="180" y="168" text-anchor="middle" class="sm muted">Speed ≈ frequency: 30 Hz ≈ half speed</text>
    </svg>`,
    explain: [
      'El <b>rectificador</b> convierte AC en DC; el <b>bus DC</b> con condensadores filtra; el <b>inversor</b> (IGBT) crea una AC de frecuencia y voltaje variables.',
      'La velocidad del motor es proporcional a la frecuencia. Así se controla un thruster de paso fijo (FPP).',
      '⚠ Seguridad: los condensadores del bus DC <b>siguen cargados</b> después de apagar. Hay que esperar el tiempo del fabricante y medir antes de tocar.',
      'Los variadores generan <b>armónicos</b>; se reducen con rectificadores de 12/24 pulsos, Active Front End o filtros.',
    ],
    terms: [['rectifier', 'rectificador'], ['DC link', 'bus de continua'], ['inverter', 'inversor'], ['IGBT', 'IGBT (transistor de potencia)'], ['harmonics', 'armónicos']],
  },
  {
    id: 'thrusters',
    title: 'Tipos de propulsores',
    titleEn: 'Thruster types',
    svg: `<svg viewBox="0 0 360 260" class="dg" role="img" aria-label="Thruster types">${arrow('a6', 'mk acc')}
      <text x="90" y="18" text-anchor="middle" class="acc">Tunnel thruster</text>
      <path d="M20 40 Q90 20 160 40 L160 110 Q90 130 20 110 Z" class="box"/>
      <rect x="20" y="64" width="140" height="22" class="zone"/>
      <path d="M86 66 L94 75 L86 84 M94 66 L86 75 L94 84" class="coil"/>
      <path d="M20 75 H6 M160 75 H174" class="sig" marker-end="url(#a6)"/>
      <text x="90" y="140" text-anchor="middle" class="sm muted">pushes sideways (port / stbd)</text>
      <text x="270" y="18" text-anchor="middle" class="acc">Azimuth thruster</text>
      <path d="M200 40 H340" class="sea"/>
      <rect x="262" y="40" width="16" height="40" class="box"/>
      <rect x="244" y="80" width="54" height="22" rx="11" class="box"/>
      <path d="M300 80 V102 M306 84 V98" class="coil"/>
      <path d="M232 120 A40 14 0 1 0 312 120" class="sig" marker-end="url(#a6)"/>
      <text x="270" y="150" text-anchor="middle" class="sm muted">rotates 360°</text>
      <text x="90" y="178" text-anchor="middle" class="acc">Retractable</text>
      <path d="M20 196 H160" class="sea"/>
      <rect x="82" y="190" width="16" height="36" class="box"/>
      <rect x="66" y="226" width="48" height="18" rx="9" class="box"/>
      <path d="M130 236 V200" class="sig" marker-end="url(#a6)"/>
      <text x="90" y="258" text-anchor="middle" class="sm muted">lowered for DP, raised in transit</text>
      <text x="270" y="178" text-anchor="middle" class="acc">FPP vs CPP</text>
      <text x="200" y="204" class="sm">FPP: fixed blades → speed by VFD</text>
      <text x="200" y="226" class="sm">CPP: constant speed → pitch by</text>
      <text x="200" y="240" class="sm">hydraulics (blade angle)</text>
    </svg>`,
    explain: [
      '<b>Túnel</b> (bow/stern thruster): hélice en un túnel transversal; empuja a babor o estribor.',
      '<b>Azimutal</b>: gira 360° para empujar en cualquier dirección; usa motores de giro, corona y <b>slip ring</b>.',
      '<b>Retráctil</b>: azimutal que se baja bajo el casco para DP y se sube en navegación.',
      '<b>FPP</b> (paso fijo) se controla con velocidad (VFD). <b>CPP</b> (paso variable) gira a velocidad constante y cambia el ángulo de las palas con hidráulica.',
    ],
    terms: [['tunnel thruster', 'propulsor de túnel'], ['azimuth thruster', 'propulsor azimutal'], ['retractable thruster', 'propulsor retráctil'], ['controllable pitch', 'paso variable']],
  },
  {
    id: 'loop',
    title: 'Lazo de 4-20 mA',
    titleEn: '4-20 mA current loop',
    svg: `<svg viewBox="0 0 360 210" class="dg" role="img" aria-label="4-20 mA loop">
      ${box(20, 30, 90, 56, 'Transmitter', 'pressure / temp')}
      ${box(250, 30, 90, 56, 'PLC / AMS', 'analog input')}
      ${box(150, 120, 60, 40, '24 V DC', 'supply', 'box pw')}
      <path d="M110 46 H250 M110 70 H130 V140 H150 M210 140 H230 V70 H250" class="wire"/>
      <text x="180" y="40" text-anchor="middle" class="sm acc">current loop</text>
      <text x="20" y="186" class="sm">0 mA → wire break alarm</text>
      <text x="20" y="202" class="sm">4 mA = 0 % · 12 mA = 50 % · 20 mA = 100 %</text>
    </svg>`,
    explain: [
      'El transmisor regula la corriente del lazo según el valor medido: <b>4 mA = mínimo</b>, <b>20 mA = máximo</b>.',
      'El "cero vivo" de 4 mA permite detectar <b>cable roto</b> (&lt; 3,6 mA) o cortocircuito (&gt; 21 mA).',
      'Fórmula: valor = mín + (mA − 4) / 16 × (máx − mín). Ejemplo: 0-10 bar, 12 mA → 5 bar.',
    ],
    terms: [['current loop', 'lazo de corriente'], ['live zero', 'cero vivo'], ['analog input', 'entrada analógica'], ['wire break', 'cable roto']],
  },
  {
    id: 'radar',
    title: 'Radar: componentes y bandas',
    titleEn: 'Radar components and bands',
    svg: `<svg viewBox="0 0 360 230" class="dg" role="img" aria-label="Radar">
      <rect x="40" y="20" width="120" height="14" rx="7" class="box hl"/>
      <text x="100" y="14" text-anchor="middle" class="sm muted">scanner / antenna</text>
      <rect x="92" y="34" width="16" height="22" class="box"/>
      ${box(56, 56, 88, 40, 'Transceiver', 'magnetron / SSD')}
      <path d="M100 96 V130" class="wire"/>
      <text x="108" y="118" class="sm muted">coax / waveguide</text>
      ${box(46, 130, 108, 46, 'Display', 'ARPA, CPA/TCPA')}
      <path d="M154 153 H186" class="sig"/>
      <text x="196" y="140" class="sm">Inputs:</text>
      <text x="196" y="156" class="sm muted">gyro (heading)</text>
      <text x="196" y="170" class="sm muted">GPS (position)</text>
      <text x="196" y="184" class="sm muted">speed log, AIS</text>
      <text x="196" y="30" class="acc">X-band</text>
      <text x="196" y="46" class="sm">9 GHz · 3 cm</text>
      <text x="196" y="60" class="sm muted">better resolution, SART</text>
      <text x="196" y="84" class="acc">S-band</text>
      <text x="196" y="100" class="sm">3 GHz · 10 cm</text>
      <text x="196" y="114" class="sm muted">longer range, better in rain</text>
      <text x="180" y="218" text-anchor="middle" class="sm acc">⚠ magnetron = high voltage: isolate and wait</text>
    </svg>`,
    explain: [
      'La <b>antena</b> gira y envía pulsos; el <b>transceptor</b> (con magnetrón o de estado sólido) los genera y recibe los ecos; la <b>pantalla</b> muestra la imagen y calcula CPA/TCPA con ARPA.',
      'El radar necesita <b>rumbo del gyro</b> y <b>posición del GPS</b>; si se pierden, aparecen alarmas.',
      'Mantenimiento típico: horas y corriente del magnetrón, sintonía, monitor de rendimiento, alineación de la línea de proa, motor y escobillas de la antena.',
    ],
    terms: [['magnetron', 'magnetrón'], ['transceiver', 'transceptor'], ['waveguide', 'guía de ondas'], ['heading marker', 'línea de proa']],
  },
  {
    id: 'loto',
    title: 'LOTO paso a paso',
    titleEn: 'Lock out tag out steps',
    svg: `<svg viewBox="0 0 360 300" class="dg" role="img" aria-label="LOTO steps">${arrow('a7')}
      ${[
        ['1', 'Identify energy sources', 'electrical, hydraulic, air, mechanical'],
        ['2', 'Inform people and bridge / ECR', 'permit to work'],
        ['3', 'Stop the equipment normally', ''],
        ['4', 'Isolate all energy sources', 'open breaker, close valves'],
        ['5', 'Lock and tag', 'personal lock + name, date, reason'],
        ['6', 'Release stored energy', 'capacitors, pressure, springs'],
        ['7', 'Verify: test for dead, try start', 'prove the tester before and after'],
      ].map(([n, t, s], i) => `<circle cx="26" cy="${24 + i * 40}" r="13" class="step"/><text x="26" y="${28 + i * 40}" text-anchor="middle" class="stepn">${n}</text>
        <text x="50" y="${22 + i * 40}">${t}</text>${s ? `<text x="50" y="${36 + i * 40}" class="sm muted">${s}</text>` : ''}
        ${i < 6 ? `<path d="M26 ${38 + i * 40} V${50 + i * 40}" class="sig" marker-end="url(#a7)"/>` : ''}`).join('')}
    </svg>`,
    explain: [
      'Nunca empieces a trabajar hasta el <b>paso 7</b>: verificar el aislamiento y comprobar ausencia de tensión con un detector probado.',
      'Al terminar se hace el proceso inverso: retirar herramientas y personas, quitar candados (cada uno el suyo), cerrar el permiso y energizar con aviso.',
    ],
    terms: [['energy source', 'fuente de energía'], ['stored energy', 'energía almacenada'], ['test for dead', 'comprobar ausencia de tensión'], ['personal lock', 'candado personal']],
  },
  {
    id: 'sensors',
    title: 'Sensores comunes a bordo',
    titleEn: 'Common sensors on board',
    html: `<table class="dtable">
      <thead><tr><th>Sensor</th><th>Measures</th><th>Signal</th><th>Typical use</th></tr></thead>
      <tbody>
        <tr><th>PT100</th><td>Temperature</td><td>Resistance (100 Ω at 0 °C)</td><td>Windings, bearings, oil</td></tr>
        <tr><th>Thermocouple</th><td>High temperature</td><td>mV</td><td>Exhaust gas</td></tr>
        <tr><th>Pressure transmitter</th><td>Pressure</td><td>4-20 mA</td><td>Lube oil, fuel, cooling water</td></tr>
        <tr><th>Pressure switch</th><td>Set point</td><td>Contact NO/NC</td><td>Low pressure alarm, standby start</td></tr>
        <tr><th>Level (radar/pressure)</th><td>Tank level</td><td>4-20 mA</td><td>Cargo, fuel, water tanks</td></tr>
        <tr><th>Float switch</th><td>High/low level</td><td>Contact</td><td>Bilge alarms</td></tr>
        <tr><th>Magnetic pick-up</th><td>Speed (RPM)</td><td>Pulses</td><td>Engine speed, overspeed</td></tr>
        <tr><th>Encoder / resolver</th><td>Speed, position</td><td>Pulses / sine</td><td>VFD motors, azimuth angle</td></tr>
        <tr><th>Proximity sensor</th><td>Presence of metal</td><td>Contact / PNP</td><td>Limit positions, cranes</td></tr>
        <tr><th>Load cell</th><td>Force, weight</td><td>mV → 4-20 mA</td><td>Crane, winch tension</td></tr>
        <tr><th>CT / VT</th><td>Current / voltage</td><td>1-5 A / 110 V</td><td>Meters, protection relays</td></tr>
        <tr><th>Oil mist detector</th><td>Oil mist</td><td>Alarm / shutdown</td><td>Engine crankcase</td></tr>
      </tbody></table>`,
    explain: [
      'Pregunta típica: <i>"How do you test a PT100?"</i> → Desconectarlo y medir la resistencia: ~100 Ω a 0 °C, ~138,5 Ω a 100 °C.',
      '⚠ Nunca abras el secundario de un <b>transformador de corriente (CT)</b> energizado: genera alto voltaje peligroso. Cortocircuítalo primero.',
    ],
    terms: [['PT100', 'sonda PT100'], ['magnetic pick-up', 'pick-up magnético'], ['current transformer', 'transformador de corriente'], ['load cell', 'celda de carga']],
  },
];
