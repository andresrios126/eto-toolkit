// Curso K-Pos (guía de estudio propia, organizada como un curso de mantenimiento DP).
// Resúmenes y preguntas redactados con palabras propias; los diagramas son dibujos originales de la app.

export const COURSE_UNITS = [
  {
    id: 'what-dp', icon: '🧭', title: 'Qué es DP',
    summary: [
      'Un buque DP mantiene su posición o su ruta solo con sus propulsores.',
      'Un sistema DP = sistema de potencia + sistema de control DP + propulsores.',
      'Controla surge, sway y yaw; mide roll, pitch y heave con la MRU.',
      'El modelo matemático con filtro de Kalman estima la posición; la diferencia con la medida es el residual.',
      'K-Pos DP-XY: X = redundancia (1, 2, 3 controladores), Y = topología (1 independiente, 2 integrado).',
      'Clase 1: sencillo · Clase 2: redundante · Clase 3: redundante + respaldo separado. Joystick independiente en todas.',
    ],
    diagrams: ['dp-loop', 'dp-overview', 'six-dof', 'dp-forces', 'dp-model', 'kpos-classes', 'kpos-configs'],
    questions: ['kp-01', 'kp-02', 'kp-03', 'kp-04', 'kp-05', 'kp-06', 'kp-20', 'kp-26'],
  },
  {
    id: 'modes', icon: '🎛️', title: 'Modos y HMI',
    summary: [
      'Standby: sin salida a los propulsores, lee sensores, sirve para entrenamiento.',
      'Joystick: control manual, no necesita referencias de posición.',
      'Auto Position: control automático de surge, sway y rumbo.',
      'Otros modos: Auto Track, Follow Target, Autopilot.',
      'La HMI muestra posición, rumbo, empuje, alarmas y tendencias.',
    ],
    diagrams: ['kpos-modes'],
    questions: ['kp-07', 'kp-08'],
  },
  {
    id: 'sensors', icon: '🌡️', title: 'Sensores y referencias',
    summary: [
      'Sensores: girocompás (rumbo), viento, MRU (movimiento).',
      'Referencias: DGNSS, HPR acústico, láser (Fanbeam, CyScan), microondas (Artemis, Radius), taut wire.',
      'Interfaces: serial NMEA (RS-422 o RS-232), analógico ±10 V o 4-20 mA, digital (ready, estado, alarma), red.',
      'El HPR necesita gyro y MRU; el DGNSS necesita correcciones diferenciales.',
      'Alimentación típica desde UPS o 24 V DC: sin energía, se pierde el sensor.',
    ],
    diagrams: ['dp-refs', 'kpos-interfaces', 'mru-wiring', 'dgnss-corr', 'sensors'],
    questions: ['kp-10', 'kp-11', 'kp-22', 'kp-23', 'nav-03', 'dp-04'],
  },
  {
    id: 'os', icon: '🖥️', title: 'Estación de operador',
    summary: [
      'Computadora + pantalla + panel de operador (botones de modo, joystick, trackball).',
      'Puede ser sencilla, doble o triple según el sistema.',
      'Conectada a la Red A y a la Red B.',
      'Revisar: alimentación, conexiones de red, panel y vista de alarmas.',
    ],
    diagrams: ['dp-network'],
    questions: ['kp-08'],
  },
  {
    id: 'cabinet', icon: '🗄️', title: 'Gabinete DP',
    summary: [
      'Contiene los controladores (hacen los cálculos DP) y los módulos de E/S remotos.',
      'Los módulos de E/S tienen canales seriales, analógicos y digitales para sensores, referencias y propulsores.',
      'Sencillo, dual o triple (uno, dos o tres controladores).',
      'Al cambiar un módulo: LED, versión, dirección y configuración; luego prueba de integridad de redundancia.',
    ],
    diagrams: ['kpos-configs', 'kpos-interfaces'],
    questions: ['kp-09', 'kp-24'],
  },
  {
    id: 'network', icon: '🌐', title: 'Comunicación en red',
    summary: [
      'Red Ethernet doble (A y B) con switches separados: sin punto único de falla.',
      'Cada equipo tiene una dirección IP en cada red (subredes distintas).',
      'Diagnóstico: LED de enlace, alarmas de red, ping y comprobador de cables.',
      'Cables blindados y bien terminados (código de colores y blindaje).',
    ],
    diagrams: ['dp-network', 'ip-scheme'],
    questions: ['kp-12', 'kp-25'],
  },
  {
    id: 'serial', icon: '🔌', title: 'Comunicación serial',
    summary: [
      'RS-232: un hilo por señal referido a tierra, cable corto.',
      'RS-422: par diferencial, cable largo y buena inmunidad al ruido; típico para NMEA.',
      'Carácter: bit de inicio + 8 bits (LSB primero) + bit de parada; misma velocidad en ambos lados.',
      'NMEA 0183: $ + talker ID + tipo de sentencia + datos separados por comas + checksum.',
    ],
    diagrams: ['serial-nmea', 'serial-frame', 'nmea-rmc'],
    questions: ['kp-13', 'kp-14', 'kp-15', 'kp-21'],
  },
  {
    id: 'cjoy', icon: '🕹️', title: 'Joystick independiente',
    summary: [
      'Sistema separado con su propio controlador, panel, gyro y conexión a propulsores.',
      'Obligatorio en todas las clases DP.',
      'Solo un sistema tiene el mando: saber quién manda y probar la transferencia.',
    ],
    diagrams: ['cjoy-transfer'],
    questions: ['kp-16'],
  },
  {
    id: 'backup', icon: '💾', title: 'Respaldo y búsqueda de fallas',
    summary: [
      'Respaldo del sistema: software y configuración; tras la puesta en servicio, tras cambios y antes de cambiar hardware.',
      'Ciclo de vida: FAT → instalación → CAT → pruebas FMEA → operación y mantenimiento.',
      'Búsqueda de fallas: seguridad y DPO primero, alarmas y eventos, lo simple primero, dividir el problema, registrar.',
    ],
    diagrams: ['dp-lifecycle'],
    questions: ['kp-17', 'kp-18', 'kp-19'],
  },
];

// Evaluación tipo test: [pregunta, correcta, [incorrectas], unidad]
export const COURSE_ASSESSMENT = [
  ['A DP system is made of three sub-systems. Which ones?', 'Power system, DP control system and thrusters', ['Gyro, wind sensor and MRU', 'Bridge, engine room and deck', 'Generators, switchboards and UPS'], 'what-dp'],
  ['Which movements does the DP control?', 'Surge, sway and yaw', ['Roll, pitch and heave', 'Surge, heave and roll', 'Only yaw'], 'what-dp'],
  ['Which sensor measures roll, pitch and heave?', 'The MRU', ['The gyrocompass', 'The wind sensor', 'The DGNSS'], 'what-dp'],
  ['What is the residual in the DP model?', 'The difference between the estimated and the measured position', ['The fuel left in the tanks', 'The thrust that is not used', 'The error of the gyro'], 'what-dp'],
  ['In K-Pos DP-12, what does the "2" mean?', 'Integrated topology', ['Two controllers', 'Two operator stations', 'IMO class 2'], 'what-dp'],
  ['Which configuration can be used for IMO DP class 3?', 'DP-21 with a DP-11 backup in a separate room', ['DP-31 in one room', 'DP-11 with a joystick', 'DP-12 alone'], 'what-dp'],
  ['In which mode does the DP give no output to the thrusters?', 'Standby', ['Joystick', 'Auto Position', 'Auto Track'], 'modes'],
  ['In Joystick mode, are position references needed?', 'No, the operator controls the vessel manually', ['Yes, at least three', 'Yes, only DGNSS', 'Only the taut wire'], 'modes'],
  ['How does a gyro usually send the heading to the DP?', 'NMEA sentences on a serial line, plus a ready signal', ['A 4-20 mA signal only', 'By Wi-Fi', 'By the thruster network'], 'sensors'],
  ['Why does the HPR need the MRU and the gyro?', 'To correct the transducer movement and refer to true north', ['To power the transponders', 'To measure the wind', 'To control the thrusters'], 'sensors'],
  ['Where can DGNSS differential corrections come from?', 'A satellite service, an IALA beacon or a network', ['Only from the gyro', 'From the MRU', 'From the operator panel'], 'sensors'],
  ['What is inside the DP cabinet?', 'Controllers and remote I/O modules', ['Only power supplies', 'The thruster motors', 'The operator panels'], 'cabinet'],
  ['Why does the DP have Net A and Net B?', 'So one network failure does not stop communication', ['To double the speed', 'One for alarms and one for video', 'Net B is only for testing'], 'network'],
  ['A unit answers ping on Net A but not on Net B. What do you check first?', 'The cable, port and switch of Net B', ['The gyro', 'The thruster drive', 'The DP software license'], 'network'],
  ['Which serial standard allows the longest cable?', 'RS-422', ['RS-232', 'USB', 'Both are the same'], 'serial'],
  ['In an NMEA sentence, what is "HE" in $HEHDT?', 'The talker ID (gyro heading)', ['The checksum', 'The sentence type', 'The baud rate'], 'serial'],
  ['What happens if the baud rate is different on each side?', 'The receiver reads wrong characters or nothing', ['It works but slower', 'Nothing, it adjusts automatically', 'The cable gets hot'], 'serial'],
  ['Why is an independent joystick required?', 'To control the vessel if the main DP fails', ['To train new DPOs only', 'To control the cranes', 'It is only for DP3'], 'cjoy'],
  ['When should you make a system backup?', 'After commissioning, after changes and before replacing hardware', ['Only once a year', 'Never, the maker keeps it', 'Only after a blackout'], 'backup'],
  ['What is the CAT?', 'The customer acceptance test on board after installation', ['A cable test', 'The factory test', 'A DP class'], 'backup'],
];
