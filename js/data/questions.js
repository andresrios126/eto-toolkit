// Banco de preguntas de entrevista para ETO (Electro-Technical Officer) en buques offshore.
// Cada pregunta tiene: id, categoría, pregunta (en/es) y respuesta modelo (en/es).
// Las respuestas editadas por el usuario se guardan en IndexedDB y NO modifican este archivo.

import { EXTRA_CATEGORIES, EXTRA_QUESTIONS, KP_BASE } from './questions-extra.js';
import { CV_CATEGORIES, CV_QUESTIONS } from './questions-cv.js';

export const CATEGORIES = {
  dp: 'DP System',
  thruster: 'Bow Thruster / Propulsión',
  gen: 'Generadores',
  swbd: 'Switchboard',
  pms: 'PMS',
  safety: 'Seguridad eléctrica',
  loto: 'LOTO',
  personal: 'Experiencia personal',
  ...EXTRA_CATEGORIES,
  ...CV_CATEGORIES,
};

const BASE_QUESTIONS = [
  // ---------- DP SYSTEM ----------
  {
    id: 'dp-01',
    cat: 'dp',
    qEn: 'What is a Dynamic Positioning system and what are its main components?',
    qEs: '¿Qué es un sistema de Posicionamiento Dinámico y cuáles son sus componentes principales?',
    aEn: 'A DP system keeps the vessel in a fixed position and heading using its own thrusters. The main components are: the power system (generators and switchboards), the thruster system (main propellers, bow and stern thrusters), the DP control system (computers and operator stations), and the sensors and reference systems, like gyro compasses, wind sensors, MRUs, DGPS, and position references such as taut wire, HPR or laser systems.',
    aEs: 'Un sistema DP mantiene el buque en una posición y rumbo fijos usando sus propios propulsores. Los componentes principales son: el sistema de potencia (generadores y cuadros eléctricos), el sistema de propulsores (hélices principales, bow y stern thrusters), el sistema de control DP (computadoras y estaciones de operador), y los sensores y sistemas de referencia, como girocompases, sensores de viento, MRU, DGPS y referencias de posición como taut wire, HPR o sistemas láser.',
  },
  {
    id: 'dp-02',
    cat: 'dp',
    qEn: 'What is the difference between DP1, DP2 and DP3?',
    qEs: '¿Cuál es la diferencia entre DP1, DP2 y DP3?',
    aEn: 'DP1 has no redundancy, so a single failure can cause loss of position. DP2 has redundancy in all active components, so a single failure of an active component, like a generator or thruster, does not cause loss of position. DP3 is like DP2, but it also covers fire and flooding: the redundant equipment is in separate compartments with A60 fire division and watertight separation.',
    aEs: 'DP1 no tiene redundancia, por lo que una sola falla puede causar pérdida de posición. DP2 tiene redundancia en todos los componentes activos, así que una falla única de un componente activo, como un generador o un thruster, no causa pérdida de posición. DP3 es como DP2, pero además cubre incendio e inundación: el equipo redundante está en compartimentos separados con división contra incendio A60 y separación estanca.',
  },
  {
    id: 'dp-03',
    cat: 'dp',
    qEn: 'What is an FMEA and why is it important on a DP vessel?',
    qEs: '¿Qué es un FMEA y por qué es importante en un buque DP?',
    aEn: 'FMEA means Failure Modes and Effects Analysis. It is a study that looks at every possible single failure in the DP system and what effect it has on station keeping. It defines the worst case failure and the redundancy groups. As an ETO, I must know the FMEA, keep the vessel configured as the FMEA says, and take part in the annual DP trials.',
    aEs: 'FMEA significa Análisis de Modos de Falla y sus Efectos. Es un estudio que revisa cada posible falla única en el sistema DP y el efecto que tiene en el mantenimiento de posición. Define la falla del peor caso (worst case failure) y los grupos de redundancia. Como ETO, debo conocer el FMEA, mantener el buque configurado como dice el FMEA y participar en las pruebas DP anuales.',
  },
  {
    id: 'dp-04',
    cat: 'dp',
    qEn: 'What would you do if a DP reference system fails during operations?',
    qEs: '¿Qué harías si falla un sistema de referencia DP durante las operaciones?',
    aEn: 'First, I inform the DPO and the bridge immediately. The DP system should reject the bad reference automatically, and we confirm that the other references are healthy. Then we check the ASOG or WSOG to see if we can continue the operation or if we must stop. After that, I start fault finding: power supply, cables, antenna or sensor, and the interface to the DP computer. I record everything in the DP log.',
    aEs: 'Primero, informo de inmediato al DPO y al puente. El sistema DP debería rechazar automáticamente la referencia mala, y confirmamos que las otras referencias están bien. Luego revisamos el ASOG o WSOG para ver si podemos continuar la operación o si debemos parar. Después empiezo a buscar la falla: alimentación eléctrica, cables, antena o sensor, y la interfaz con la computadora DP. Registro todo en el libro de DP.',
  },
  {
    id: 'dp-05',
    cat: 'dp',
    qEn: 'What is an ASOG and how does it affect your work as an ETO?',
    qEs: '¿Qué es un ASOG y cómo afecta tu trabajo como ETO?',
    aEn: 'ASOG means Activity Specific Operating Guidelines. It is a table with green, advisory, yellow and red conditions for a specific operation. It tells us the correct equipment configuration and what to do if something fails. For me as an ETO, it means I must not start maintenance on DP-related equipment during operations without permission, and I must report any alarm that can change the status.',
    aEs: 'ASOG significa Guías Operativas Específicas de la Actividad. Es una tabla con condiciones verde, aviso, amarillo y rojo para una operación específica. Nos dice la configuración correcta del equipo y qué hacer si algo falla. Para mí como ETO, significa que no debo iniciar mantenimiento en equipos relacionados con DP durante operaciones sin permiso, y debo reportar cualquier alarma que pueda cambiar el estado.',
  },

  // ---------- BOW THRUSTER / PROPULSIÓN ----------
  {
    id: 'th-01',
    cat: 'thruster',
    qEn: 'How does a bow thruster work, and what types do you know?',
    qEs: '¿Cómo funciona un bow thruster y qué tipos conoces?',
    aEn: 'A bow thruster is a propeller inside a tunnel at the bow. It pushes water to port or starboard to move the bow sideways. There are two main types: fixed pitch with variable speed, usually driven by a frequency converter, and controllable pitch with constant speed, where the motor runs at fixed RPM and we change the blade angle. I have also worked with azimuth and retractable thrusters.',
    aEs: 'Un bow thruster es una hélice dentro de un túnel en la proa. Empuja el agua a babor o estribor para mover la proa hacia los lados. Hay dos tipos principales: paso fijo con velocidad variable, normalmente accionado por un variador de frecuencia, y paso controlable con velocidad constante, donde el motor gira a RPM fijas y cambiamos el ángulo de las palas. También he trabajado con thrusters azimutales y retráctiles.',
  },
  {
    id: 'th-02',
    cat: 'thruster',
    qEn: 'The bow thruster does not start from the bridge. How do you troubleshoot it?',
    qEs: 'El bow thruster no arranca desde el puente. ¿Cómo buscas la falla?',
    aEn: 'I start with the simple things. I check the alarm list and the start conditions: pitch at zero, hydraulic pump running, oil level and pressure OK, and enough power available from the PMS. Then I check the main breaker and the control power. I try to start from the local panel. If it starts locally, the problem is in the remote control or the communication. If not, I check the starter or the frequency converter fault log, using the drawings step by step.',
    aEs: 'Empiezo con lo simple. Reviso la lista de alarmas y las condiciones de arranque: paso en cero, bomba hidráulica funcionando, nivel y presión de aceite OK, y suficiente potencia disponible desde el PMS. Luego reviso el interruptor principal y la alimentación de control. Intento arrancar desde el panel local. Si arranca localmente, el problema está en el control remoto o en la comunicación. Si no, reviso el registro de fallas del arrancador o del variador de frecuencia, usando los planos paso a paso.',
  },
  {
    id: 'th-03',
    cat: 'thruster',
    qEn: 'Why do large thruster motors need a soft starter or a frequency converter?',
    qEs: '¿Por qué los motores grandes de thrusters necesitan un arrancador suave o un variador de frecuencia?',
    aEn: 'A large induction motor can take six to eight times its nominal current with a direct-on-line start. This causes a big voltage dip on the switchboard and can trip other consumers or even cause a blackout. A soft starter, a star-delta starter, an autotransformer or a frequency converter reduces the starting current. A frequency converter also gives us variable speed control for the thruster.',
    aEs: 'Un motor de inducción grande puede tomar de seis a ocho veces su corriente nominal con un arranque directo. Esto causa una gran caída de voltaje en el cuadro eléctrico y puede disparar otros consumidores o incluso causar un blackout. Un arrancador suave, un arrancador estrella-triángulo, un autotransformador o un variador de frecuencia reducen la corriente de arranque. El variador además nos da control de velocidad variable para el thruster.',
  },
  {
    id: 'th-04',
    cat: 'thruster',
    qEn: 'What maintenance do you do on a frequency converter (VFD)?',
    qEs: '¿Qué mantenimiento haces en un variador de frecuencia (VFD)?',
    aEn: 'I keep the cabinet clean and dry, and I check and clean the air filters and cooling fans. If it is water cooled, I check the coolant flow, temperature and conductivity, and look for leaks. I check the connections with a thermal camera, I check the DC link capacitors, and I download and review the fault log. I always follow the maker instructions and wait for the capacitors to discharge before opening the cabinet.',
    aEs: 'Mantengo el gabinete limpio y seco, y reviso y limpio los filtros de aire y los ventiladores. Si es refrigerado por agua, reviso el caudal, la temperatura y la conductividad del refrigerante, y busco fugas. Reviso las conexiones con cámara térmica, reviso los condensadores del bus DC, y descargo y reviso el registro de fallas. Siempre sigo las instrucciones del fabricante y espero a que los condensadores se descarguen antes de abrir el gabinete.',
  },

  // ---------- GENERADORES ----------
  {
    id: 'gen-01',
    cat: 'gen',
    qEn: 'What are the conditions to synchronize a generator with the busbar?',
    qEs: '¿Cuáles son las condiciones para sincronizar un generador con la barra?',
    aEn: 'There are four conditions: the same voltage, the same frequency, the same phase sequence, and the voltages must be in phase, so the phase angle is close to zero. The incoming generator should run a little faster than the bus, so the synchroscope turns slowly clockwise. We close the breaker just before the twelve o\'clock position. Normally the automatic synchronizer does this, but I can also do it manually.',
    aEs: 'Hay cuatro condiciones: el mismo voltaje, la misma frecuencia, la misma secuencia de fases, y los voltajes deben estar en fase, es decir, el ángulo de fase cerca de cero. El generador entrante debe girar un poco más rápido que la barra, para que el sincronoscopio gire lento en sentido horario. Cerramos el interruptor justo antes de la posición de las doce. Normalmente lo hace el sincronizador automático, pero también lo puedo hacer manualmente.',
  },
  {
    id: 'gen-02',
    cat: 'gen',
    qEn: 'What happens if you close the breaker out of phase?',
    qEs: '¿Qué pasa si cierras el interruptor fuera de fase?',
    aEn: 'It creates a very high current and a big mechanical shock on the generator and the engine. It can damage the coupling, the windings and the breaker. The protection will probably trip the breaker, and in the worst case it can cause a blackout. That is why we use a check synchronizing relay to block the breaker if the conditions are not correct.',
    aEs: 'Se genera una corriente muy alta y un gran golpe mecánico en el generador y el motor. Puede dañar el acoplamiento, los devanados y el interruptor. La protección probablemente dispare el interruptor, y en el peor caso puede causar un blackout. Por eso usamos un relé de verificación de sincronismo (check synchronizing) para bloquear el interruptor si las condiciones no son correctas.',
  },
  {
    id: 'gen-03',
    cat: 'gen',
    qEn: 'What is the function of the AVR, and how do generators share load?',
    qEs: '¿Cuál es la función del AVR y cómo comparten carga los generadores?',
    aEn: 'The AVR, the Automatic Voltage Regulator, controls the excitation of the generator to keep the output voltage constant. It also shares the reactive load, the kVAr, between generators in parallel. The active load, the kW, is shared by the governor, which controls the fuel to the engine. Both can work in droop mode or in isochronous mode with load sharing lines.',
    aEs: 'El AVR, el Regulador Automático de Voltaje, controla la excitación del generador para mantener constante el voltaje de salida. También reparte la carga reactiva, los kVAr, entre generadores en paralelo. La carga activa, los kW, la reparte el governor (regulador de velocidad), que controla el combustible al motor. Ambos pueden trabajar en modo droop o en modo isócrono con líneas de reparto de carga.',
  },
  {
    id: 'gen-04',
    cat: 'gen',
    qEn: 'What protections does a main generator have?',
    qEs: '¿Qué protecciones tiene un generador principal?',
    aEn: 'The main protections are: overcurrent and short circuit, reverse power, under and over voltage, under and over frequency, and loss of excitation. Many vessels also have differential protection and earth fault monitoring. The engine has its own safety system for low lube oil pressure, high cooling water temperature and overspeed. Reverse power is very important, because it stops the generator from working as a motor.',
    aEs: 'Las protecciones principales son: sobrecorriente y cortocircuito, potencia inversa, bajo y sobre voltaje, baja y sobre frecuencia, y pérdida de excitación. Muchos buques también tienen protección diferencial y monitoreo de falla a tierra. El motor tiene su propio sistema de seguridad por baja presión de aceite, alta temperatura del agua de refrigeración y sobrevelocidad. La potencia inversa es muy importante, porque evita que el generador funcione como motor.',
  },

  // ---------- SWITCHBOARD ----------
  {
    id: 'sw-01',
    cat: 'swbd',
    qEn: 'Describe the main switchboard of a DP2 vessel you have worked on.',
    qEs: 'Describe el cuadro eléctrico principal de un buque DP2 en el que hayas trabajado.',
    aEn: 'On my last vessel, the main switchboard was 690 volts, 60 hertz, divided into two sections, port and starboard, with a bus-tie breaker in the middle. Each side had two generators, the thrusters and the main consumers for that redundancy group. For DP operations we could run with the bus-tie open or closed, as the FMEA says. Then we had transformers to 440 and 230 volts for the smaller consumers.',
    aEs: 'En mi último buque, el cuadro principal era de 690 voltios, 60 hercios, dividido en dos secciones, babor y estribor, con un interruptor de acoplamiento (bus-tie) en el medio. Cada lado tenía dos generadores, los thrusters y los consumidores principales de ese grupo de redundancia. Para operaciones DP podíamos trabajar con el bus-tie abierto o cerrado, según el FMEA. Luego teníamos transformadores a 440 y 230 voltios para los consumidores más pequeños.',
  },
  {
    id: 'sw-02',
    cat: 'swbd',
    qEn: 'What is preferential tripping, and why do we need it?',
    qEs: '¿Qué es el disparo preferencial (preferential tripping) y por qué lo necesitamos?',
    aEn: 'Preferential tripping disconnects non-essential consumers when the generators are overloaded. For example, it trips the galley, the air conditioning or the workshop first. This reduces the load and protects the essential services, like steering, thrusters and navigation equipment, and it helps to avoid a blackout.',
    aEs: 'El disparo preferencial desconecta los consumidores no esenciales cuando los generadores están sobrecargados. Por ejemplo, dispara primero la cocina, el aire acondicionado o el taller. Esto reduce la carga y protege los servicios esenciales, como el gobierno, los thrusters y los equipos de navegación, y ayuda a evitar un blackout.',
  },
  {
    id: 'sw-03',
    cat: 'swbd',
    qEn: 'How do you find an earth fault on a 440 V insulated system?',
    qEs: '¿Cómo encuentras una falla a tierra en un sistema aislado de 440 V?',
    aEn: 'First, I check the insulation monitor or earth lamps to see which phase is affected. Then I inform the Chief Engineer and the bridge. With their permission, I switch off non-essential circuits one by one, and I watch the monitor. When the alarm clears, I have found the circuit. Then I isolate it, and I use an insulation tester, a megger, to find the exact cable or equipment. Some vessels have an earth fault locator, which makes it faster.',
    aEs: 'Primero, reviso el monitor de aislamiento o las lámparas de tierra para ver qué fase está afectada. Luego informo al Jefe de Máquinas y al puente. Con su permiso, apago los circuitos no esenciales uno por uno y observo el monitor. Cuando la alarma se quita, encontré el circuito. Luego lo aíslo y uso un probador de aislamiento, un megger, para encontrar el cable o equipo exacto. Algunos buques tienen un localizador de fallas a tierra, que lo hace más rápido.',
  },
  {
    id: 'sw-04',
    cat: 'swbd',
    qEn: 'What is the procedure after a blackout?',
    qEs: '¿Cuál es el procedimiento después de un blackout?',
    aEn: 'The emergency generator should start automatically and supply the emergency switchboard within 45 seconds. The PMS normally tries to start a standby generator and close it on the bus. If that does not happen, we start a generator manually. We restore essential services first, like steering, lube oil pumps and cooling pumps, and then the thrusters. After that, we find the cause of the blackout, record everything and report to the office.',
    aEs: 'El generador de emergencia debe arrancar automáticamente y alimentar el cuadro de emergencia en un máximo de 45 segundos. El PMS normalmente intenta arrancar un generador en standby y conectarlo a la barra. Si no ocurre, arrancamos un generador manualmente. Restauramos primero los servicios esenciales, como el gobierno, las bombas de aceite y de refrigeración, y después los thrusters. Luego buscamos la causa del blackout, registramos todo e informamos a la oficina.',
  },

  // ---------- PMS ----------
  {
    id: 'pms-01',
    cat: 'pms',
    qEn: 'What are the main functions of a Power Management System?',
    qEs: '¿Cuáles son las funciones principales de un Sistema de Gestión de Potencia (PMS)?',
    aEn: 'The PMS makes sure there is always enough power available. It starts and stops generators automatically depending on the load. It synchronizes and connects the generators and shares the load between them. It also has blackout recovery, load shedding and preferential tripping, and it blocks the start of heavy consumers, like thrusters, if there is not enough spare power.',
    aEs: 'El PMS asegura que siempre haya suficiente potencia disponible. Arranca y para generadores automáticamente según la carga. Sincroniza y conecta los generadores y reparte la carga entre ellos. También tiene recuperación de blackout, desconexión de carga y disparo preferencial, y bloquea el arranque de consumidores pesados, como los thrusters, si no hay suficiente potencia de reserva.',
  },
  {
    id: 'pms-02',
    cat: 'pms',
    qEn: 'What is a heavy consumer request, and how does it work?',
    qEs: '¿Qué es una solicitud de consumidor pesado (heavy consumer request) y cómo funciona?',
    aEn: 'Before a large motor starts, like a thruster or a big pump, it sends a request to the PMS. The PMS checks if there is enough available power. If there is, it gives permission to start. If not, it starts another generator first, connects it, and then gives permission. This prevents an overload or a blackout when the big motor starts.',
    aEs: 'Antes de que arranque un motor grande, como un thruster o una bomba grande, envía una solicitud al PMS. El PMS verifica si hay suficiente potencia disponible. Si la hay, da permiso para arrancar. Si no, arranca primero otro generador, lo conecta y luego da el permiso. Esto evita una sobrecarga o un blackout cuando arranca el motor grande.',
  },
  {
    id: 'pms-03',
    cat: 'pms',
    qEn: 'The PMS does not start the standby generator. What do you check?',
    qEs: 'El PMS no arranca el generador en standby. ¿Qué revisas?',
    aEn: 'First, I check that the generator is in auto mode and selected as standby in the PMS. Then I check the alarm list for any start blocking, like a shutdown not reset, low starting air pressure, or a pre-lube fault. I check the communication between the PMS and the engine control panel, and the start signal on the I/O module. I also check if the generator breaker is in remote and not tripped.',
    aEs: 'Primero, verifico que el generador esté en modo automático y seleccionado como standby en el PMS. Luego reviso la lista de alarmas por algún bloqueo de arranque, como un shutdown sin resetear, baja presión de aire de arranque o una falla de prelubricación. Reviso la comunicación entre el PMS y el panel de control del motor, y la señal de arranque en el módulo de I/O. También verifico que el interruptor del generador esté en remoto y no disparado.',
  },

  // ---------- SEGURIDAD ELÉCTRICA ----------
  {
    id: 'saf-01',
    cat: 'safety',
    qEn: 'What safety precautions do you take before working on electrical equipment?',
    qEs: '¿Qué precauciones de seguridad tomas antes de trabajar en equipo eléctrico?',
    aEn: 'First, I do a risk assessment and get a permit to work if it is needed. I inform the Chief Engineer and the bridge. Then I isolate the equipment, lock it and tag it. I test for dead with a tested voltage tester, I test the tester before and after. I use the correct PPE, like insulated gloves and safety glasses, and I never work alone on live or high voltage equipment.',
    aEs: 'Primero, hago una evaluación de riesgos y obtengo un permiso de trabajo si es necesario. Informo al Jefe de Máquinas y al puente. Luego aíslo el equipo, lo bloqueo y lo etiqueto. Compruebo ausencia de tensión con un probador verificado, y pruebo el probador antes y después. Uso el EPP correcto, como guantes aislantes y lentes de seguridad, y nunca trabajo solo en equipos energizados o de alto voltaje.',
  },
  {
    id: 'saf-02',
    cat: 'safety',
    qEn: 'What extra precautions are needed for high voltage systems?',
    qEs: '¿Qué precauciones extra se necesitan en sistemas de alto voltaje?',
    aEn: 'For high voltage, above 1000 volts, we need a special HV permit and only authorized persons can do the switching. After isolation, we must test for dead with an HV tester and then apply earthing to the circuit before touching anything. We use a sanction to test when we need to do insulation tests. There must be a second person, and we keep a safe distance from live parts.',
    aEs: 'Para alto voltaje, por encima de 1000 voltios, necesitamos un permiso especial de HV y solo personas autorizadas pueden hacer las maniobras. Después del aislamiento, debemos comprobar ausencia de tensión con un probador de HV y luego aplicar puesta a tierra al circuito antes de tocar cualquier cosa. Usamos un permiso de prueba (sanction to test) cuando hacemos pruebas de aislamiento. Debe haber una segunda persona y mantenemos una distancia segura de las partes energizadas.',
  },
  {
    id: 'saf-03',
    cat: 'safety',
    qEn: 'How do you do an insulation resistance test on a motor?',
    qEs: '¿Cómo haces una prueba de resistencia de aislamiento en un motor?',
    aEn: 'First, I isolate and lock out the motor and test for dead. I disconnect the motor cables from the starter or VFD, so I do not damage electronic parts. Then I use a megger at the correct voltage, usually 500 volts for a 440 volt motor. I test each phase to earth and between phases. A good motor should read more than 1 megohm, but normally much higher. After the test, I discharge the windings and record the values to see the trend.',
    aEs: 'Primero, aíslo y bloqueo el motor y compruebo ausencia de tensión. Desconecto los cables del motor del arrancador o VFD, para no dañar las partes electrónicas. Luego uso un megger al voltaje correcto, normalmente 500 voltios para un motor de 440 voltios. Pruebo cada fase a tierra y entre fases. Un motor bueno debe dar más de 1 megaohmio, pero normalmente mucho más. Después de la prueba, descargo los devanados y registro los valores para ver la tendencia.',
  },
  {
    id: 'saf-04',
    cat: 'safety',
    qEn: 'What is a permit to work system?',
    qEs: '¿Qué es un sistema de permisos de trabajo?',
    aEn: 'A permit to work is a written system to control dangerous jobs, like electrical work, hot work, work at height or entry into enclosed spaces. It says who does the job, what the hazards are, which isolations are needed and what precautions we take. The responsible officer signs it, and the job cannot start before that. When the job is finished, we close the permit and remove the isolations in a safe way.',
    aEs: 'Un permiso de trabajo es un sistema escrito para controlar trabajos peligrosos, como trabajo eléctrico, trabajo en caliente, trabajo en altura o entrada a espacios confinados. Indica quién hace el trabajo, cuáles son los peligros, qué aislamientos se necesitan y qué precauciones tomamos. El oficial responsable lo firma, y el trabajo no puede empezar antes de eso. Cuando termina el trabajo, cerramos el permiso y quitamos los aislamientos de forma segura.',
  },

  // ---------- LOTO ----------
  {
    id: 'loto-01',
    cat: 'loto',
    qEn: 'Explain the Lock Out Tag Out procedure step by step.',
    qEs: 'Explica el procedimiento de Bloqueo y Etiquetado (LOTO) paso a paso.',
    aEn: 'One: identify all the energy sources, electrical, hydraulic, pneumatic and mechanical. Two: inform the people involved and the bridge or engine control room. Three: stop the equipment in the normal way. Four: isolate all energy sources. Five: apply my personal lock and a tag with my name, date and the reason. Six: release any stored energy, like capacitors or pressure. Seven: verify the isolation, test for dead and try to start the equipment. Only then I can start the work.',
    aEs: 'Uno: identificar todas las fuentes de energía, eléctrica, hidráulica, neumática y mecánica. Dos: informar a las personas involucradas y al puente o la sala de control de máquinas. Tres: detener el equipo de forma normal. Cuatro: aislar todas las fuentes de energía. Cinco: colocar mi candado personal y una etiqueta con mi nombre, fecha y motivo. Seis: liberar cualquier energía almacenada, como condensadores o presión. Siete: verificar el aislamiento, comprobar ausencia de tensión e intentar arrancar el equipo. Solo entonces puedo empezar el trabajo.',
  },
  {
    id: 'loto-02',
    cat: 'loto',
    qEn: 'What do you do if you find a lock and you cannot find the person who placed it?',
    qEs: '¿Qué haces si encuentras un candado y no puedes encontrar a la persona que lo puso?',
    aEn: 'I never remove another person\'s lock. First, I try to contact the person through the bridge or the radio. If the person has left the vessel, I inform the Chief Engineer. The lock can only be removed with the formal procedure: the Chief Engineer and the Master must confirm that the equipment is safe and nobody is working on it. Then the lock is removed with authorization, and everything is recorded.',
    aEs: 'Nunca quito el candado de otra persona. Primero, intento contactar a la persona por el puente o la radio. Si la persona dejó el buque, informo al Jefe de Máquinas. El candado solo se puede retirar con el procedimiento formal: el Jefe de Máquinas y el Capitán deben confirmar que el equipo es seguro y que nadie está trabajando en él. Entonces se retira el candado con autorización y todo se registra.',
  },

  // ---------- EXPERIENCIA PERSONAL ----------
  {
    id: 'per-01',
    cat: 'personal',
    qEn: 'Tell me about yourself and your experience as an ETO.',
    qEs: 'Háblame de ti y de tu experiencia como ETO.',
    aEn: 'My name is [your name], and I have [number] years of experience as an Electro-Technical Officer on offshore vessels, mainly PSV and AHTS with DP2 class. I am responsible for the maintenance and repair of the power plant, switchboards, thrusters, DP and automation systems, and navigation equipment. I work closely with the Chief Engineer and the bridge team. I like problem solving and I always work with safety as my first priority.',
    aEs: 'Mi nombre es [tu nombre], y tengo [número] años de experiencia como Oficial Electrotécnico en buques offshore, principalmente PSV y AHTS clase DP2. Soy responsable del mantenimiento y reparación de la planta de potencia, cuadros eléctricos, thrusters, sistemas DP y de automatización, y equipos de navegación. Trabajo de cerca con el Jefe de Máquinas y el equipo del puente. Me gusta resolver problemas y siempre trabajo con la seguridad como primera prioridad.',
  },
  {
    id: 'per-02',
    cat: 'personal',
    qEn: 'Tell me about a difficult fault you solved on board.',
    qEs: 'Cuéntame sobre una falla difícil que resolviste a bordo.',
    aEn: 'On one vessel, a bow thruster tripped many times during DP operations, and nobody found the cause. I checked the fault log of the frequency converter and saw an earth fault alarm, but only when the thruster was at high load. I tested the motor and it was OK. Then I tested the cable and found damaged insulation in a cable gland near the motor, where there was water. We replaced the gland and the cable end, and the problem was solved.',
    aEs: 'En un buque, un bow thruster se disparaba muchas veces durante operaciones DP y nadie encontraba la causa. Revisé el registro de fallas del variador de frecuencia y vi una alarma de falla a tierra, pero solo cuando el thruster estaba a alta carga. Probé el motor y estaba bien. Luego probé el cable y encontré aislamiento dañado en un prensaestopas cerca del motor, donde había agua. Reemplazamos el prensaestopas y la punta del cable, y el problema se resolvió.',
  },
  {
    id: 'per-03',
    cat: 'personal',
    qEn: 'How do you plan and record your maintenance work?',
    qEs: '¿Cómo planificas y registras tu trabajo de mantenimiento?',
    aEn: 'We use a planned maintenance system on the computer. Every morning I check the jobs that are due and I plan them with the Chief Engineer, depending on the operations. If the vessel is on DP, I do not touch critical equipment. After each job, I write what I did, the measurements, and the spare parts used. I also keep the spare parts inventory updated and order parts on time.',
    aEs: 'Usamos un sistema de mantenimiento planificado en la computadora. Cada mañana reviso los trabajos pendientes y los planifico con el Jefe de Máquinas, según las operaciones. Si el buque está en DP, no toco equipos críticos. Después de cada trabajo, escribo lo que hice, las mediciones y los repuestos utilizados. También mantengo actualizado el inventario de repuestos y pido las piezas a tiempo.',
  },
  {
    id: 'per-04',
    cat: 'personal',
    qEn: 'Why do you want to work for our company?',
    qEs: '¿Por qué quieres trabajar en nuestra empresa?',
    aEn: 'Your company has a modern offshore fleet and a very good reputation for safety. I want to grow my career with advanced DP vessels and new technology, like hybrid and battery systems. I am a reliable and hard-working person, I learn fast, and I like to work in a team. I think I can bring my practical experience and help keep your vessels safe and in operation.',
    aEs: 'Su empresa tiene una flota offshore moderna y muy buena reputación en seguridad. Quiero crecer en mi carrera con buques DP avanzados y nueva tecnología, como sistemas híbridos y de baterías. Soy una persona confiable y trabajadora, aprendo rápido y me gusta trabajar en equipo. Creo que puedo aportar mi experiencia práctica y ayudar a mantener sus buques seguros y en operación.',
  },
];

// Orden: base + adicionales, agrupadas por categoría en el orden de CATEGORIES.
const ALL = [...BASE_QUESTIONS.map((q) => ({ ...q, kp: KP_BASE[q.id] || [] })), ...EXTRA_QUESTIONS, ...CV_QUESTIONS];
const ORDER = Object.keys(CATEGORIES);
export const QUESTIONS = ALL
  .map((q, i) => ({ q, i }))
  .sort((a, b) => ORDER.indexOf(a.q.cat) - ORDER.indexOf(b.q.cat) || a.i - b.i)
  .map(({ q }) => q);
