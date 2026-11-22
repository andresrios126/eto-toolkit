// Diagramas propios sobre temas de mantenimiento K-Pos (dibujados para la app, no copiados del curso).

const arrow = (id, cls = 'mk') =>
  `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="${cls}"/></marker></defs>`;
const box = (x, y, w, h, label, sub = '', cls = 'box') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${cls}"/>` +
  `<text x="${x + w / 2}" y="${y + h / 2 + (sub ? -2 : 4)}" text-anchor="middle">${label}</text>` +
  (sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" class="sm muted">${sub}</text>` : '');

export const KPOS_DIAGRAMS = [
  {
    id: 'six-dof',
    title: 'Seis grados de libertad',
    titleEn: 'Six degrees of freedom',
    svg: `<svg viewBox="0 0 360 250" class="dg" role="img" aria-label="Six degrees of freedom">${arrow('k1', 'mk acc')}
      <text x="90" y="16" text-anchor="middle" class="acc">CONTROLLED by thrusters</text>
      <path d="M90 40 L112 70 L112 150 L68 150 L68 70 Z" class="box hl"/>
      <text x="90" y="112" text-anchor="middle" class="sm">top view</text>
      <path d="M90 60 V24" class="sig" marker-end="url(#k1)"/><text x="98" y="34" class="sm">SURGE</text>
      <path d="M112 110 H150" class="sig" marker-end="url(#k1)"/><text x="118" y="104" class="sm">SWAY</text>
      <path d="M40 80 A40 40 0 0 0 40 140" class="sig" marker-end="url(#k1)"/><text x="6" y="112" class="sm">YAW</text>
      <text x="90" y="176" text-anchor="middle" class="sm muted">surge / sway → position references</text>
      <text x="90" y="190" text-anchor="middle" class="sm muted">yaw (heading) → gyrocompass</text>
      <text x="270" y="16" text-anchor="middle" class="acc">MEASURED by MRU</text>
      <path d="M200 150 H340" class="sea"/>
      <path d="M220 130 L320 130 L310 150 L230 150 Z" class="box"/>
      <rect x="290" y="112" width="18" height="18" class="box"/>
      <path d="M270 120 V70" class="sig" marker-end="url(#k1)"/><path d="M270 120 V170" class="sig" marker-end="url(#k1)"/>
      <text x="278" y="80" class="sm">HEAVE</text>
      <path d="M220 100 A60 30 0 0 1 320 100" class="sig" marker-end="url(#k1)"/><text x="236" y="58" class="sm">PITCH (bow up/down)</text>
      <text x="230" y="196" class="sm">ROLL (side to side)</text>
      <text x="270" y="220" text-anchor="middle" class="sm muted">not controlled: used to correct</text>
      <text x="270" y="234" text-anchor="middle" class="sm muted">the position measurements</text>
    </svg>`,
    explain: [
      'Un buque se mueve en <b>6 grados de libertad</b>. El DP solo <b>controla 3</b>: <b>surge</b> (avance), <b>sway</b> (deriva) y <b>yaw</b> (guiñada / rumbo), usando los propulsores.',
      'Surge y sway se <b>miden</b> con las <b>referencias de posición</b>; el yaw (rumbo) con el <b>girocompás</b>.',
      '<b>Roll</b> (balance), <b>pitch</b> (cabeceo) y <b>heave</b> (arfada) no se controlan: los mide la <b>MRU</b> y el DP los usa para corregir, por ejemplo, la posición de la antena GNSS o del transductor HPR.',
    ],
    terms: [['surge', 'avance'], ['sway', 'deriva'], ['yaw', 'guiñada'], ['roll', 'balance'], ['pitch', 'cabeceo'], ['heave', 'arfada']],
  },
  {
    id: 'dp-model',
    title: 'Modelo matemático y residual',
    titleEn: 'Vessel model and residual',
    svg: `<svg viewBox="0 0 360 230" class="dg" role="img" aria-label="DP model">${arrow('k2')}
      ${box(8, 20, 92, 34, 'Wind sensor', 'feed-forward')}
      ${box(8, 64, 92, 34, 'Thruster', 'feedback')}
      ${box(8, 108, 92, 34, 'References', 'measured pos.')}
      ${box(8, 152, 92, 34, 'Gyro + MRU', 'heading, motion')}
      <path d="M100 37 H122 V100 M100 81 H122 M100 125 H122 M100 169 H122 V100" class="sig"/>
      <path d="M122 100 H136" class="sig" marker-end="url(#k2)"/>
      ${box(138, 64, 96, 72, 'Vessel model', 'Kalman filter', 'box hl')}
      <path d="M234 100 H252" class="wire" marker-end="url(#k2)"/>
      ${box(254, 64, 98, 72, 'Controller', 'thrust allocation', 'box pw')}
      <path d="M303 136 V170" class="wire" marker-end="url(#k2)"/>
      <text x="303" y="186" text-anchor="middle" class="sm">thruster orders</text>
      <rect x="120" y="160" width="128" height="50" rx="8" class="zone"/>
      <text x="184" y="178" text-anchor="middle" class="sm acc">RESIDUAL =</text>
      <text x="184" y="194" text-anchor="middle" class="sm">estimated − measured</text>
      <text x="184" y="206" text-anchor="middle" class="sm muted">→ "current" in the model</text>
    </svg>`,
    explain: [
      'El DP no usa directamente una sola medición: tiene un <b>modelo del buque</b> que, con un <b>filtro de Kalman</b>, combina todas las entradas y <b>estima</b> la posición y el movimiento.',
      'La diferencia entre la posición <b>estimada</b> y la <b>medida</b> es el <b>residual</b>. El modelo la usa para corregirse y la presenta como la <b>corriente</b> estimada.',
      'Gracias al modelo, si se pierden las referencias, el buque puede mantener posición unos minutos por <b>estima (dead reckoning)</b>.',
    ],
    terms: [['vessel model', 'modelo del buque'], ['Kalman filter', 'filtro de Kalman'], ['residual', 'residual'], ['thrust allocation', 'asignación de empuje']],
  },
  {
    id: 'kpos-classes',
    title: 'K-Pos: nombres y clases IMO',
    titleEn: 'K-Pos naming and IMO classes',
    html: `<div class="naming"><span class="nm big">DP-<b class="d1">2</b><b class="d2">1</b></span>
      <span class="nm-k"><b class="d1">1.er dígito</b> = redundancia: 1 sencillo · 2 dual · 3 triple</span>
      <span class="nm-k"><b class="d2">2.º dígito</b> = topología: 1 independiente · 2 integrado</span></div>
      <table class="dtable">
      <thead><tr><th>IMO class</th><th>K-Pos</th><th>Requirement</th></tr></thead>
      <tbody>
        <tr><th>Class 1</th><td class="nowrap">DP-11<br>DP-12</td><td>Single system + independent joystick</td></tr>
        <tr><th>Class 2</th><td class="nowrap">DP-21<br>DP-31</td><td>Redundant system + independent joystick</td></tr>
        <tr><th>Class 3</th><td class="nowrap">DP-21 + DP-11<br>DP-22 + DP-12</td><td>Redundant main system + backup system in a separate compartment (fire &amp; flood) + independent joystick</td></tr>
      </tbody></table>`,
    explain: [
      'Ejemplo: <b>DP-21</b> = controlador <b>dual</b> (2) e <b>independiente</b> (1) → apto para <b>clase 2</b>.',
      'Un sistema <b>triple</b> (DP-31) sigue siendo <b>clase 2</b>: la clase 3 exige además un <b>sistema de respaldo</b> separado por división contra incendio e inundación.',
      'El <b>joystick independiente</b> (por ejemplo cJoy) se usa en todas las clases.',
    ],
    terms: [['redundancy', 'redundancia'], ['topology', 'topología'], ['standalone', 'independiente'], ['integrated', 'integrado'], ['backup system', 'sistema de respaldo']],
  },
  {
    id: 'kpos-modes',
    title: 'Modos de operación K-Pos',
    titleEn: 'K-Pos operating modes',
    html: `<div class="alert-levels">
      <div class="lvl"><b>STANDBY</b><span>No output to thrusters · default mode · reads sensors · built-in trainer.</span></div>
      <div class="lvl blue"><b>JOYSTICK</b><span>Thrusters enabled · manual control with the joystick · position references not needed · heading can be automatic.</span></div>
      <div class="lvl green"><b>AUTO POSITION</b><span>Full automatic control of surge, sway and heading.</span></div>
      <div class="lvl yellow"><b>OTHER AUTO MODES</b><span>Auto Track (follow a planned track) · Follow Target (follow an ROV or moving object) · Autopilot (steer a course).</span></div>
    </div>`,
    explain: [
      'Se pasa de un modo a otro con los botones del panel de operador. En la consola, el cambio a modo de control suele pedir una confirmación (por ejemplo, doble pulsación) para evitar errores.',
      'Para mantenimiento, el sistema debe estar en <b>Standby</b> y con permiso del DPO.',
    ],
    terms: [['standby mode', 'modo espera'], ['joystick mode', 'modo joystick'], ['auto position', 'posición automática'], ['auto track', 'seguimiento de ruta'], ['follow target', 'seguir objetivo']],
  },
  {
    id: 'kpos-interfaces',
    title: 'Cómo llegan las señales al DP',
    titleEn: 'Sensor and reference interfaces',
    svg: `<svg viewBox="0 0 360 290" class="dg" role="img" aria-label="Interfaces">${arrow('k3')}
      ${box(262, 100, 90, 90, 'DP cabinet', 'controllers + I/O', 'box hl')}
      ${[
        ['Gyrocompass', 'RS-422 NMEA + ready', 10],
        ['Wind sensor', 'RS-422 NMEA', 46],
        ['MRU', 'analog ±10 V + ready', 82],
        ['DGNSS', 'RS-422 NMEA', 118],
        ['HPR (HiPaP)', 'serial or network', 154],
        ['Laser / radar', 'RS-232 / RS-422', 190],
        ['Taut wire', 'analog, 4-20 mA, digital', 226],
      ].map(([n, sig, y]) => `${box(8, y, 92, 30, n)}<path d="M100 ${y + 15} H180 L258 145" class="sig" marker-end="url(#k3)"/><text x="104" y="${y + 11}" class="sm muted">${sig}</text>`).join('')}
      <text x="307" y="210" text-anchor="middle" class="sm muted">UPS 230 V AC /</text>
      <text x="307" y="224" text-anchor="middle" class="sm muted">24 V DC power</text>
      <text x="180" y="282" text-anchor="middle" class="sm">Ready signal = digital "I am healthy" from the sensor</text>
    </svg>`,
    explain: [
      '<b>Serial NMEA</b> (normalmente RS-422): girocompás, viento, DGNSS y muchas referencias.',
      '<b>Analógico</b>: la MRU (roll, pitch, heave en ±10 V) y el taut wire (ángulos y tensión en ±10 V, longitud de cable en 4-20 mA).',
      '<b>Digital</b>: señales de "listo" (ready), estado y alarma. Si falta la señal ready, el DP puede rechazar el sensor aunque lleguen datos.',
      'Los sensores se alimentan del <b>UPS</b> o de 24 V DC: si se pierde la alimentación, se pierde el sensor.',
    ],
    terms: [['serial line', 'línea serial'], ['analog input', 'entrada analógica'], ['digital input', 'entrada digital'], ['ready signal', 'señal de listo'], ['4-20 mA', 'lazo 4-20 mA']],
  },
  {
    id: 'dp-network',
    title: 'Red DP doble (Red A / Red B)',
    titleEn: 'Dual DP network',
    svg: `<svg viewBox="0 0 360 230" class="dg" role="img" aria-label="Dual network">
      ${box(20, 14, 90, 40, 'Operator', 'station 1')}
      ${box(135, 14, 90, 40, 'Operator', 'station 2')}
      ${box(250, 14, 90, 40, 'Other system', 'thrusters, alarms')}
      <path d="M10 100 H350" class="bus"/><text x="350" y="94" text-anchor="end" class="sm acc">NET A</text>
      <path d="M10 140 H350" class="wire" stroke-width="5"/><text x="350" y="156" text-anchor="end" class="sm acc">NET B</text>
      ${[65, 180, 295].map((x) => `<path d="M${x - 8} 54 V100 M${x + 8} 54 V140" class="wire" stroke-width="1.6"/><circle cx="${x - 8}" cy="100" r="4" class="dot"/><circle cx="${x + 8}" cy="140" r="4" class="dot"/>`).join('')}
      ${box(70, 170, 90, 44, 'Controller A', '')}
      ${box(200, 170, 90, 44, 'Controller B', '')}
      ${[115, 245].map((x) => `<path d="M${x - 8} 170 V100 M${x + 8} 170 V140" class="wire" stroke-width="1.6"/>`).join('')}
    </svg>`,
    explain: [
      'Cada equipo (estaciones, controladores, otros sistemas) se conecta a <b>dos redes Ethernet independientes</b>, con <b>switches separados</b>.',
      'Si falla un cable, un switch o una red completa, todo sigue funcionando por la otra: <b>no hay punto único de falla</b>.',
      'Cada equipo tiene una <b>dirección IP en cada red</b> (subredes distintas). Para diagnosticar: LED de los switches, alarmas de red, <b>ping</b> a la dirección del equipo y prueba de cables con <b>comprobador</b>.',
    ],
    terms: [['network switch', 'switch de red'], ['IP address', 'dirección IP'], ['ping', 'ping'], ['single point of failure', 'punto único de falla'], ['cable tester', 'comprobador de cables']],
  },
  {
    id: 'serial-nmea',
    title: 'RS-232, RS-422 y NMEA 0183',
    titleEn: 'Serial lines and NMEA sentences',
    html: `<table class="dtable">
      <thead><tr><th></th><th>RS-232</th><th>RS-422</th></tr></thead>
      <tbody>
        <tr><th>Type</th><td>Single-ended (to ground)</td><td>Differential pair (Tx+ / Tx−)</td></tr>
        <tr><th>Levels</th><td>about ±12 V</td><td>about 0–5 V difference</td></tr>
        <tr><th>Max cable</th><td class="bad">short (≈ 10–15 m)</td><td class="good">long (≈ 1 200 m)</td></tr>
        <tr><th>Noise</th><td>sensitive</td><td>good rejection</td></tr>
        <tr><th>Typical use</th><td>short links, laptops, some laser units</td><td>NMEA sensors: gyro, wind, DGNSS</td></tr>
      </tbody></table>
      <div class="nmea">
        <code><span class="n-s">$</span><span class="n-t">HE</span><span class="n-y">HDT</span>,<span class="n-d">123.4,T</span><span class="n-c">*2B</span></code>
        <ul>
          <li><span class="n-s">$</span> start of the sentence</li>
          <li><span class="n-t">HE</span> talker ID (gyro heading) · GP = GPS · WI = wind</li>
          <li><span class="n-y">HDT</span> sentence type (true heading) · GGA = GPS position · MWV = wind</li>
          <li><span class="n-d">123.4,T</span> data fields, separated by commas</li>
          <li><span class="n-c">*2B</span> checksum to detect errors</li>
        </ul>
      </div>`,
    explain: [
      'Ambos lados de la línea serial deben tener la <b>misma configuración</b>: baudios (por ejemplo 4800 o 9600), bits de datos, paridad y bits de parada.',
      'Falla típica en RS-422: los cables <b>+ y −</b> invertidos. Se ve con una laptop y un adaptador serial: llegan caracteres sin sentido o nada.',
      'Las sentencias <b>propietarias</b> de un fabricante empiezan con <b>$P</b>.',
    ],
    terms: [['talker ID', 'identificador de emisor'], ['sentence type', 'tipo de sentencia'], ['checksum', 'suma de verificación'], ['baud rate', 'velocidad en baudios'], ['differential', 'diferencial']],
  },
];

// ---------- Más diagramas propios (curso K-Pos) ----------
const ar = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk"/></marker></defs>`;
const bx = (x, y, w, hh, label, sub = '', cls = 'box') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="8" class="${cls}"/>` +
  `<text x="${x + w / 2}" y="${y + hh / 2 + (sub ? -2 : 4)}" text-anchor="middle">${label}</text>` +
  (sub ? `<text x="${x + w / 2}" y="${y + hh / 2 + 12}" text-anchor="middle" class="sm muted">${sub}</text>` : '');

KPOS_DIAGRAMS.push(
  {
    id: 'dp-loop',
    title: 'El ciclo DP: medir, evaluar, actuar',
    titleEn: 'Sense, assess, respond',
    svg: `<svg viewBox="0 0 360 220" class="dg" role="img" aria-label="DP loop">${ar('m1')}
      ${bx(130, 10, 100, 44, 'SENSE', 'sensors + references', 'box hl')}
      ${bx(250, 120, 100, 44, 'ASSESS', 'model + controller', 'box pw')}
      ${bx(10, 120, 100, 44, 'RESPOND', 'thrusters')}
      <path d="M230 40 Q300 50 300 116" class="sig" marker-end="url(#m1)"/>
      <path d="M248 150 H114" class="sig" marker-end="url(#m1)"/>
      <path d="M60 118 Q60 50 128 36" class="sig" marker-end="url(#m1)"/>
      <text x="180" y="100" text-anchor="middle" class="sm muted">wind · waves · current</text>
      <text x="180" y="114" text-anchor="middle" class="sm muted">push the vessel off position</text>
      <text x="180" y="200" text-anchor="middle" class="sm">The loop repeats many times per second</text>
    </svg>`,
    explain: [
      'El DP funciona como un ser vivo que mantiene el equilibrio: <b>mide</b> (sensores y referencias), <b>evalúa</b> (modelo y controlador calculan el error y el empuje necesario) y <b>actúa</b> (propulsores).',
      'El ciclo se repite continuamente para compensar viento, olas y corriente.',
    ],
    terms: [['sense', 'medir / percibir'], ['assess', 'evaluar'], ['respond', 'responder / actuar']],
  },
  {
    id: 'dp-forces',
    title: 'Fuerzas sobre el buque',
    titleEn: 'Environmental and thruster forces',
    svg: `<svg viewBox="0 0 360 230" class="dg" role="img" aria-label="Forces">${ar('m2')}
      <path d="M180 40 L210 75 L210 180 L150 180 L150 75 Z" class="box hl"/>
      <text x="180" y="130" text-anchor="middle" class="sm">vessel</text>
      <path d="M40 60 L140 90" class="sig" marker-end="url(#m2)"/><text x="20" y="54" class="sm acc">WIND</text>
      <path d="M40 200 L140 165" class="sig" marker-end="url(#m2)"/><text x="16" y="216" class="sm acc">CURRENT</text>
      <path d="M40 130 L140 128" class="sig" marker-end="url(#m2)"/><text x="10" y="124" class="sm acc">WAVES</text>
      <path d="M210 90 H280" class="wire" marker-end="url(#m2)"/><text x="240" y="84" class="sm">bow tunnel</text>
      <path d="M210 170 H280" class="wire" marker-end="url(#m2)"/><text x="240" y="164" class="sm">azimuths</text>
      <path d="M180 180 V214" class="wire" marker-end="url(#m2)"/><text x="190" y="214" class="sm">props / rudders</text>
      <text x="290" y="40" class="sm muted">Result:</text>
      <text x="290" y="54" class="sm muted">surge, sway</text>
      <text x="290" y="68" class="sm muted">and yaw</text>
    </svg>`,
    explain: [
      'Las <b>fuerzas ambientales</b> (viento, olas, corriente) empujan el buque. Los <b>propulsores</b> (azimutales, túneles, hélices y timones) generan la fuerza contraria.',
      'El resultado se expresa en los tres movimientos que controla el DP: <b>surge, sway y yaw</b>.',
      'El viento se mide directamente (alimentación anticipada o <i>feed-forward</i>); olas y corriente se estiman con el modelo.',
    ],
    terms: [['environmental forces', 'fuerzas ambientales'], ['feed-forward', 'compensación anticipada'], ['thrust', 'empuje']],
  },
  {
    id: 'kpos-configs',
    title: 'Configuraciones K-Pos (esquema)',
    titleEn: 'K-Pos configurations',
    svg: `<svg viewBox="0 0 360 260" class="dg" role="img" aria-label="Configurations">
      ${[
        ['DP-11', 'class 1', 10, 10, 1, false],
        ['DP-21', 'class 2', 185, 10, 2, false],
        ['DP-31', 'class 2', 10, 135, 3, false],
        ['DP-21 + DP-11', 'class 3', 185, 135, 2, true],
      ].map(([n, c, x, y, k, backup]) => `<rect x="${x}" y="${y}" width="165" height="115" rx="10" class="zone"/>
        <text x="${x + 8}" y="${y + 16}" class="acc">${n}</text><text x="${x + 157}" y="${y + 16}" text-anchor="end" class="sm muted">${c}</text>
        ${Array.from({ length: k }, (_, i) => `<rect x="${x + 12 + i * 34}" y="${y + 28}" width="28" height="22" rx="4" class="box"/><text x="${x + 26 + i * 34}" y="${y + 43}" text-anchor="middle" class="sm">OS</text>`).join('')}
        <path d="M${x + 10} ${y + 62} H${x + (backup ? 100 : 155)}" class="wire"/>
        ${k > 1 ? `<path d="M${x + 10} ${y + 68} H${x + (backup ? 100 : 155)}" class="sig"/>` : ''}
        ${Array.from({ length: k }, (_, i) => `<rect x="${x + 12 + i * 34}" y="${y + 78}" width="28" height="26" rx="4" class="box pw"/><text x="${x + 26 + i * 34}" y="${y + 95}" text-anchor="middle" class="sm">C${i + 1}</text>`).join('')}
        ${backup ? `<rect x="${x + 108}" y="${y + 26}" width="50" height="80" rx="6" class="box hl"/><text x="${x + 133}" y="${y + 60}" text-anchor="middle" class="sm">backup</text><text x="${x + 133}" y="${y + 74}" text-anchor="middle" class="sm muted">other room</text>` : ''}`).join('')}
      <text x="180" y="256" text-anchor="middle" class="sm muted">OS = operator station · C = controller · lines = network A / B</text>
    </svg>`,
    explain: [
      '<b>DP-11:</b> una estación y un controlador. <b>DP-21:</b> dos controladores y red doble. <b>DP-31:</b> tres controladores (sigue siendo clase 2).',
      '<b>Clase 3:</b> sistema principal redundante + <b>sistema de respaldo</b> con su propia estación y controlador, en otro compartimento protegido contra incendio e inundación.',
    ],
    terms: [['backup system', 'sistema de respaldo'], ['controller', 'controlador'], ['compartment', 'compartimento']],
  },
  {
    id: 'mru-wiring',
    title: 'Conexión de una MRU al DP',
    titleEn: 'MRU interface example',
    svg: `<svg viewBox="0 0 360 230" class="dg" role="img" aria-label="MRU wiring">${ar('m3')}
      ${bx(10, 80, 70, 60, 'MRU', 'sensor')}
      ${bx(110, 70, 80, 80, 'Junction', 'box')}
      ${bx(282, 60, 70, 100, 'DP', 'cabinet', 'box hl')}
      <path d="M80 110 H108" class="wire"/>
      ${[['±10 V roll', 78], ['±10 V pitch', 96], ['±10 V heave', 114], ['ready (digital)', 132]].map(([t, y]) => `<path d="M190 ${y} H278" class="sig" marker-end="url(#m3)"/><text x="196" y="${y - 3}" class="sm">${t}</text>`).join('')}
      <path d="M282 150 H192" class="wire" marker-end="url(#m3)"/><text x="200" y="166" class="sm muted">24 V DC power</text>
      <path d="M150 70 V30 H300" class="sig" marker-end="url(#m3)"/><text x="160" y="24" class="sm">serial data → HPR system</text>
      <text x="180" y="210" text-anchor="middle" class="sm muted">Example: check each channel with a multimeter and a simulated signal</text>
    </svg>`,
    explain: [
      'La MRU envía balance, cabeceo y arfada como <b>señales analógicas</b> (por ejemplo ±10 V) y una <b>señal digital de listo</b>. También puede enviar datos seriales al sistema acústico (HPR), que los necesita para corregir el movimiento del transductor.',
      'Búsqueda de fallas: medir voltaje en cada canal, comparar con el valor mostrado en el DP y revisar la alimentación de 24 V DC.',
    ],
    terms: [['analog signal', 'señal analógica'], ['junction box', 'caja de conexiones'], ['ready signal', 'señal de listo']],
  },
  {
    id: 'dgnss-corr',
    title: 'DGNSS y correcciones diferenciales',
    titleEn: 'DGNSS and differential corrections',
    svg: `<svg viewBox="0 0 360 220" class="dg" role="img" aria-label="DGNSS">${ar('m4')}
      ${[30, 90, 150].map((x) => `<circle cx="${x}" cy="22" r="9" class="box"/><path d="M${x - 14} 22 H${x + 14}" class="wire" stroke-width="1.5"/>`).join('')}
      <text x="10" y="50" class="sm">GPS / GLONASS satellites</text>
      <path d="M90 32 L150 110" class="sig" marker-end="url(#m4)"/>
      ${bx(250, 10, 100, 34, 'Correction', 'satellite service')}
      ${bx(250, 54, 100, 34, 'IALA beacon', 'coast radio')}
      ${bx(250, 98, 100, 34, 'Network', 'internet / VSAT')}
      <path d="M250 27 L200 112 M250 71 L200 118 M250 115 L200 124" class="sig"/>
      ${bx(110, 110, 90, 44, 'DGNSS', 'receiver', 'box hl')}
      <path d="M155 154 V186" class="wire" marker-end="url(#m4)"/>
      ${bx(110, 188, 90, 28, 'DP', '')}
      <text x="208" y="176" class="sm muted">RS-422 NMEA</text>
    </svg>`,
    explain: [
      'El receptor calcula la posición con los satélites. Las <b>correcciones diferenciales</b> eliminan gran parte del error y pueden llegar por <b>servicio satelital</b>, <b>radiobaliza IALA</b> costera o <b>red</b>.',
      'Fallas típicas: antena tapada (grúa, plataforma), cable o conector con agua, suscripción de corrección vencida, o baudios incorrectos hacia el DP.',
    ],
    terms: [['differential correction', 'corrección diferencial'], ['IALA beacon', 'radiobaliza IALA'], ['receiver', 'receptor']],
  },
  {
    id: 'serial-frame',
    title: 'Cómo viaja un carácter por la línea serial',
    titleEn: 'Serial character frame',
    svg: `<svg viewBox="0 0 360 170" class="dg" role="img" aria-label="Serial frame">
      ${['idle', 'start', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'stop', 'idle'].map((t, i) => `<rect x="${8 + i * 29}" y="30" width="29" height="20" class="${t === 'start' ? 'box pw' : t === 'stop' ? 'box hl' : 'box'}"/><text x="${22 + i * 29}" y="44" text-anchor="middle" class="sm">${t}</text>`).join('')}
      <path d="M8 80 H66 V120 H95 V80 H124 V120 H182 V80 H211 V120 H269 V80 H356" class="coil" stroke-width="2.5"/>
      <text x="8" y="74" class="sm muted">1 (idle)</text><text x="8" y="134" class="sm muted">0</text>
      <text x="180" y="156" text-anchor="middle" class="sm">1 start bit · 8 data bits (LSB first) · 1 stop bit = one ASCII character</text>
    </svg>`,
    explain: [
      'En reposo la línea está en "1". Cada carácter empieza con un <b>bit de inicio</b> (0), luego <b>8 bits de datos</b> empezando por el menos significativo (LSB) y termina con un <b>bit de parada</b> (1).',
      'Por eso ambos equipos deben tener la <b>misma velocidad (baudios)</b> y el mismo formato (por ejemplo 4800 baudios, 8 bits, sin paridad, 1 bit de parada = "4800 8N1").',
      'Cada carácter es un código <b>ASCII</b>: así se forman las letras y números de las sentencias NMEA.',
    ],
    terms: [['start bit', 'bit de inicio'], ['stop bit', 'bit de parada'], ['LSB', 'bit menos significativo'], ['ASCII', 'ASCII'], ['8N1', '8 bits, sin paridad, 1 de parada']],
  },
  {
    id: 'nmea-rmc',
    title: 'Leer una sentencia NMEA de GPS',
    titleEn: 'Reading a GPS NMEA sentence',
    html: `<div class="nmea"><code><span class="n-s">$</span><span class="n-t">GP</span><span class="n-y">RMC</span>,<span class="n-d">123519</span>,<span class="n-d">A</span>,<span class="n-d">4807.038,N</span>,<span class="n-d">01131.000,E</span>,<span class="n-d">022.4</span>,<span class="n-d">084.4</span>,<span class="n-d">230394</span>,003.1,W<span class="n-c">*6A</span></code>
      <table class="dtable"><tbody>
        <tr><th>GP · RMC</th><td>GPS · recommended minimum data</td></tr>
        <tr><th>123519</th><td>Time 12:35:19 UTC</td></tr>
        <tr><th>A</th><td>Status: A = valid (V = not valid)</td></tr>
        <tr><th>4807.038,N</th><td>Latitude 48° 07.038' North</td></tr>
        <tr><th>01131.000,E</th><td>Longitude 11° 31.000' East</td></tr>
        <tr><th>022.4 · 084.4</th><td>Speed over ground (knots) · course (degrees)</td></tr>
        <tr><th>230394</th><td>Date 23-03-94</td></tr>
        <tr><th>*6A</th><td>Checksum</td></tr>
      </tbody></table></div>`,
    explain: [
      'Cuando un sensor "no da datos", conectar una laptop a la línea serial y ver las sentencias ayuda mucho: si aparece el <b>estado V</b> (no válido), el problema es el receptor o la antena, no el cable.',
      'Los talker ID más comunes: <b>GP</b> GPS · <b>GN</b> GNSS combinado · <b>HE</b> gyro · <b>WI</b> viento. Las sentencias que empiezan con <b>$P</b> son propietarias de un fabricante.',
    ],
    terms: [['valid', 'válido'], ['latitude', 'latitud'], ['longitude', 'longitud'], ['speed over ground', 'velocidad sobre el fondo']],
  },
  {
    id: 'ip-scheme',
    title: 'Direcciones IP en una red doble',
    titleEn: 'IP addressing on a dual network',
    svg: `<svg viewBox="0 0 360 200" class="dg" role="img" aria-label="IP scheme">
      <text x="10" y="20" class="acc">Example (not a real vessel)</text>
      ${[['Controller A', '10.0.1.1', '10.0.2.1', 40], ['Controller B', '10.0.1.2', '10.0.2.2', 80], ['Operator station 1', '10.0.1.11', '10.0.2.11', 120], ['Operator station 2', '10.0.1.12', '10.0.2.12', 160]].map(([n, a, b2, y]) => `
        <text x="10" y="${y}" class="sm">${n}</text>
        <rect x="140" y="${y - 13}" width="100" height="20" rx="5" class="box"/><text x="190" y="${y + 1}" text-anchor="middle" class="sm">${a}</text>
        <rect x="250" y="${y - 13}" width="100" height="20" rx="5" class="box pw"/><text x="300" y="${y + 1}" text-anchor="middle" class="sm">${b2}</text>`).join('')}
      <text x="190" y="190" text-anchor="middle" class="sm acc">NET A (…1.x)</text>
      <text x="300" y="190" text-anchor="middle" class="sm acc">NET B (…2.x)</text>
    </svg>`,
    explain: [
      'Cada equipo tiene <b>una dirección en cada red</b>. La parte de red cambia (A o B) y la parte del equipo suele ser la misma, así es fácil de recordar.',
      'Diagnóstico: <b>ping</b> a la dirección del equipo en la red A y en la B. Si responde en una y no en la otra, el problema está en el cable, el puerto o el switch de esa red.',
      'Los números de este ejemplo son inventados; los reales están en la documentación de tu buque.',
    ],
    terms: [['IP address', 'dirección IP'], ['subnet', 'subred'], ['ping', 'ping'], ['host', 'equipo / host']],
  },
  {
    id: 'cjoy-transfer',
    title: 'Joystick independiente y traspaso de mando',
    titleEn: 'Independent joystick and command transfer',
    svg: `<svg viewBox="0 0 360 210" class="dg" role="img" aria-label="Joystick transfer">${ar('m5')}
      ${bx(10, 20, 120, 54, 'Main DP', 'K-Pos', 'box hl')}
      ${bx(230, 20, 120, 54, 'Independent', 'joystick (cJoy)', 'box pw')}
      <path d="M130 40 H228" class="sig" marker-end="url(#m5)"/><path d="M228 56 H130" class="sig" marker-end="url(#m5)"/>
      <text x="180" y="34" text-anchor="middle" class="sm">command transfer</text>
      ${bx(120, 120, 120, 40, 'Thrusters', 'one master at a time')}
      <path d="M70 74 L150 118" class="wire" marker-end="url(#m5)"/><path d="M290 74 L210 118" class="wire" marker-end="url(#m5)"/>
      <text x="290" y="100" class="sm muted">own gyro input</text>
      <text x="180" y="190" text-anchor="middle" class="sm">Always check which system is in command before testing</text>
    </svg>`,
    explain: [
      'El joystick independiente tiene <b>su propio controlador, panel y conexión</b> a los propulsores y al gyro, para poder maniobrar si falla el DP principal.',
      'Solo un sistema manda a la vez. Antes de probar o hacer mantenimiento, confirmar <b>quién tiene el mando</b> y cómo se transfiere, y probar la transferencia en ambos sentidos.',
    ],
    terms: [['command transfer', 'traspaso de mando'], ['in command', 'con el mando'], ['independent joystick', 'joystick independiente']],
  },
  {
    id: 'dp-lifecycle',
    title: 'Vida de un sistema DP',
    titleEn: 'DP system lifecycle',
    svg: `<svg viewBox="0 0 360 150" class="dg" role="img" aria-label="Lifecycle">${ar('m6')}
      ${[['Design', 10], ['FAT', 80], ['Install', 150], ['CAT', 220], ['FMEA', 290]].map(([t, x], i) => `${bx(x, 20, 62, 40, t, '', i % 2 ? 'box pw' : 'box')}${i < 4 ? `<path d="M${x + 62} 40 H${x + 78}" class="wire" marker-end="url(#m6)"/>` : ''}`).join('')}
      ${[['Operation', 30], ['Maintenance', 140], ['Upgrades', 250]].map(([t, x], i) => `${bx(x, 90, 90, 40, t, '', 'box hl')}${i < 2 ? `<path d="M${x + 90} 110 H${x + 108}" class="wire" marker-end="url(#m6)"/>` : ''}`).join('')}
      <path d="M321 60 V75 H75 V88" class="sig" marker-end="url(#m6)"/>
    </svg>`,
    explain: [
      '<b>FAT</b>: pruebas en fábrica. <b>CAT</b>: pruebas a bordo tras la instalación. Las <b>pruebas FMEA</b> confirman que una falla única no hace perder la posición.',
      'Después vienen la operación, el mantenimiento (donde trabaja el ETO), el soporte y las <b>actualizaciones</b>. Tras cualquier cambio importante se actualiza el respaldo del sistema y, si aplica, el FMEA.',
    ],
    terms: [['factory acceptance test', 'prueba en fábrica'], ['customer acceptance test', 'prueba de aceptación'], ['upgrade', 'actualización']],
  },
);
