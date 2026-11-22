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
