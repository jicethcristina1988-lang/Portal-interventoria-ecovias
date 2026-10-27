import { DailyReport } from '../types';

/**
 * Creates clean data URL SVG images representing genuine civil engineering site operations
 * with realistic color palettes, equipment, safety vests, sky conditions for sunny, cloudy, rainy.
 */
export function createConstructionSampleImage(
  type: 'excavation' | 'rebar' | 'concrete' | 'topography' | 'formwork',
  weather: 'Soleado' | 'Nublado' | 'Lluvioso'
): string {
  const skyColors = {
    Soleado: '#38BDF8',
    Nublado: '#94A3B8',
    Lluvioso: '#64748B',
  };

  const sunElement =
    weather === 'Soleado'
      ? `<circle cx="540" cy="70" r="38" fill="#FBBF24" opacity="0.9" />
         <circle cx="540" cy="70" r="48" fill="#FDE047" opacity="0.3" />`
      : weather === 'Lluvioso'
      ? `<g stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" opacity="0.65">
           <line x1="120" y1="40" x2="100" y2="80" />
           <line x1="220" y1="60" x2="200" y2="100" />
           <line x1="340" y1="30" x2="320" y2="70" />
           <line x1="460" y1="50" x2="440" y2="90" />
           <line x1="560" y1="40" x2="540" y2="80" />
           <line x1="180" y1="120" x2="160" y2="160" />
           <line x1="300" y1="110" x2="280" y2="150" />
           <line x1="420" y1="130" x2="400" y2="170" />
         </g>`
      : `<path d="M420,70 Q450,40 490,60 Q530,40 570,70 Q600,90 570,110 Q530,120 490,110 Q450,120 420,100 Z" fill="#E2E8F0" opacity="0.85"/>`;

  let sceneSvg = '';

  if (type === 'excavation') {
    sceneSvg = `
      <!-- Ground excavation cut -->
      <polygon points="0,220 220,240 280,380 640,380 640,480 0,480" fill="#78350F" />
      <polygon points="0,260 200,270 250,390 0,440" fill="#92400E" opacity="0.7"/>
      <polygon points="260,380 640,380 640,480 250,480" fill="#451A03" />
      <!-- Yellow Excavator -->
      <!-- Tracks -->
      <rect x="360" y="320" width="180" height="45" rx="10" fill="#1E293B" />
      <circle cx="380" cy="342" r="14" fill="#64748B" />
      <circle cx="420" cy="342" r="14" fill="#64748B" />
      <circle cx="460" cy="342" r="14" fill="#64748B" />
      <circle cx="500" cy="342" r="14" fill="#64748B" />
      <circle cx="522" cy="342" r="10" fill="#475569" />
      <!-- Cabin -->
      <rect x="420" y="250" width="100" height="70" rx="6" fill="#EAB308" />
      <rect x="430" y="260" width="45" height="38" rx="4" fill="#0284C7" opacity="0.8" />
      <!-- Counterweight -->
      <path d="M510,270 L545,280 L540,320 L510,320 Z" fill="#CA8A04" />
      <!-- Boom and Bucket -->
      <line x1="430" y1="280" x2="330" y2="200" stroke="#EAB308" stroke-width="18" stroke-linecap="round" />
      <line x1="330" y1="200" x2="250" y2="300" stroke="#CA8A04" stroke-width="14" stroke-linecap="round" />
      <!-- Bucket teeth in dirt -->
      <polygon points="250,300 230,330 205,310 230,290" fill="#334155" />
      <!-- Worker with safety helmet and vest -->
      <circle cx="150" cy="270" r="10" fill="#F59E0B" /> <!-- Helmet -->
      <rect x="142" y="280" width="16" height="30" rx="3" fill="#EA580C" /> <!-- Orange Vest -->
      <rect x="144" y="310" width="6" height="35" fill="#1E3A8A" />
      <rect x="152" y="310" width="6" height="35" fill="#1E3A8A" />
      <!-- Text badge on photo -->
      <rect x="20" y="20" width="230" height="40" rx="6" fill="#0F172A" opacity="0.75" />
      <text x="35" y="45" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="bold">FRENTE 1: EXCAVACIÓN</text>
    `;
  } else if (type === 'rebar') {
    sceneSvg = `
      <!-- Footing Pit -->
      <rect x="40" y="240" width="560" height="200" fill="#713F12" />
      <!-- Concrete blinding layer -->
      <rect x="60" y="390" width="520" height="30" fill="#CBD5E1" />
      <!-- Steel Rebar Grid (Acero de refuerzo) -->
      <g stroke="#334155" stroke-width="5" stroke-linecap="round">
        <line x1="100" y1="385" x2="540" y2="385" />
        <line x1="100" y1="365" x2="540" y2="365" />
        <line x1="100" y1="345" x2="540" y2="345" />
        <line x1="100" y1="325" x2="540" y2="325" />
        <line x1="140" y1="310" x2="140" y2="390" />
        <line x1="200" y1="310" x2="200" y2="390" />
        <line x1="260" y1="310" x2="260" y2="390" />
        <line x1="320" y1="310" x2="320" y2="390" />
        <line x1="380" y1="310" x2="380" y2="390" />
        <line x1="440" y1="310" x2="440" y2="390" />
        <line x1="500" y1="310" x2="500" y2="390" />
        <!-- Vertical Column Rebar Cages -->
        <line x1="230" y1="140" x2="230" y2="385" stroke="#1E293B" stroke-width="7" />
        <line x1="250" y1="140" x2="250" y2="385" stroke="#1E293B" stroke-width="7" />
        <line x1="270" y1="140" x2="270" y2="385" stroke="#1E293B" stroke-width="7" />
        <line x1="290" y1="140" x2="290" y2="385" stroke="#1E293B" stroke-width="7" />
        <!-- Stirrups (Estribos) -->
        <line x1="225" y1="170" x2="295" y2="170" stroke="#475569" stroke-width="4" />
        <line x1="225" y1="210" x2="295" y2="210" stroke="#475569" stroke-width="4" />
        <line x1="225" y1="250" x2="295" y2="250" stroke="#475569" stroke-width="4" />
        <line x1="225" y1="290" x2="295" y2="290" stroke="#475569" stroke-width="4" />
      </g>
      <!-- Workers tying rebar -->
      <circle cx="180" cy="275" r="9" fill="#FFFFFF" /> <!-- White Helmet: Residente -->
      <rect x="172" y="284" width="16" height="28" fill="#F59E0B" />
      <rect x="174" y="312" width="5" height="30" fill="#374151" />
      <rect x="182" y="312" width="5" height="30" fill="#374151" />
      
      <circle cx="340" cy="285" r="9" fill="#EAB308" /> <!-- Yellow Helmet: Obrero -->
      <rect x="332" y="294" width="16" height="26" fill="#F97316" />
      <!-- Text badge on photo -->
      <rect x="20" y="20" width="270" height="40" rx="6" fill="#0F172A" opacity="0.75" />
      <text x="35" y="45" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="bold">FRENTE 2: ACERO DE REFUERZO</text>
    `;
  } else if (type === 'concrete') {
    sceneSvg = `
      <!-- Formwork Walls (Encofrado) -->
      <rect x="60" y="260" width="480" height="180" fill="#78350F" />
      <rect x="80" y="280" width="440" height="160" fill="#94A3B8" /> <!-- Fresh Concrete -->
      <!-- Mixer Truck Chute and Body -->
      <polygon points="560,180 460,280 430,280 540,160" fill="#475569" />
      <rect x="520" y="120" width="110" height="80" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="4" />
      <ellipse cx="575" cy="160" rx="45" ry="32" fill="#E2E8F0" />
      <!-- Vibrator Hose (Vibrador de Concreto) -->
      <path d="M360,250 Q380,280 370,320" stroke="#000000" stroke-width="8" fill="none" stroke-linecap="round" />
      <!-- Workers with boots, vests, vibrator -->
      <circle cx="330" cy="220" r="10" fill="#EAB308" /> <!-- Yellow Helmet -->
      <rect x="322" y="230" width="18" height="32" fill="#EA580C" />
      <rect x="323" y="262" width="7" height="32" fill="#1E293B" />
      <rect x="332" y="262" width="7" height="32" fill="#1E293B" />
      <!-- Second worker with screed/boquillera -->
      <circle cx="210" cy="225" r="10" fill="#EAB308" />
      <rect x="202" y="235" width="18" height="32" fill="#EA580C" />
      <line x1="160" y1="280" x2="280" y2="280" stroke="#CBD5E1" stroke-width="6" />
      <!-- Text badge on photo -->
      <rect x="20" y="20" width="280" height="40" rx="6" fill="#0F172A" opacity="0.75" />
      <text x="35" y="45" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="bold">FRENTE 3: VACIADO DE CONCRETO</text>
    `;
  } else if (type === 'topography') {
    sceneSvg = `
      <!-- Rolling Roadway Ground Subgrade -->
      <polygon points="0,280 640,240 640,480 0,480" fill="#A16207" />
      <polygon points="0,320 640,290 640,480 0,480" fill="#713F12" />
      <!-- Tripod (Trípode Topográfico) -->
      <line x1="240" y1="220" x2="200" y2="340" stroke="#EAB308" stroke-width="6" stroke-linecap="round"/>
      <line x1="240" y1="220" x2="280" y2="340" stroke="#EAB308" stroke-width="6" stroke-linecap="round"/>
      <line x1="240" y1="220" x2="240" y2="340" stroke="#CA8A04" stroke-width="5" stroke-linecap="round"/>
      <!-- Total Station Instrument -->
      <rect x="228" y="195" width="24" height="25" rx="3" fill="#0284C7" />
      <circle cx="240" cy="207" r="6" fill="#0F172A" />
      <!-- Topographer Looking through scope -->
      <circle cx="215" cy="195" r="9" fill="#FFFFFF" />
      <rect x="208" y="205" width="16" height="30" fill="#16A34A" /> <!-- Green/SISO-Surveyor vest -->
      <rect x="210" y="235" width="5" height="35" fill="#1E3A8A" />
      <rect x="218" y="235" width="5" height="35" fill="#1E3A8A" />
      <!-- Rodman with Prism (Prisma y Jalón a la distancia) -->
      <line x1="480" y1="180" x2="480" y2="310" stroke="#DC2626" stroke-width="4" />
      <circle cx="480" cy="180" r="10" fill="#EAB308" />
      <circle cx="460" cy="210" r="8" fill="#F59E0B" />
      <rect x="454" y="218" width="14" height="26" fill="#EA580C" />
      <rect x="456" y="244" width="4" height="30" fill="#334155" />
      <rect x="462" y="244" width="4" height="30" fill="#334155" />
      <!-- Text badge on photo -->
      <rect x="20" y="20" width="270" height="40" rx="6" fill="#0F172A" opacity="0.75" />
      <text x="35" y="45" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="bold">FRENTE 4: NIVELACIÓN TOPOGRÁFICA</text>
    `;
  } else {
    // Formwork
    sceneSvg = `
      <!-- Footing and Wall Formwork Panels -->
      <rect x="120" y="220" width="400" height="180" fill="#B45309" />
      <g stroke="#78350F" stroke-width="4">
        <line x1="120" y1="260" x2="520" y2="260" />
        <line x1="120" y1="300" x2="520" y2="300" />
        <line x1="120" y1="340" x2="520" y2="340" />
        <line x1="120" y1="380" x2="520" y2="380" />
        <line x1="200" y1="220" x2="200" y2="400" />
        <line x1="280" y1="220" x2="280" y2="400" />
        <line x1="360" y1="220" x2="360" y2="400" />
        <line x1="440" y1="220" x2="440" y2="400" />
      </g>
      <!-- Diagonal Metal Props (Puntales Metálicos) -->
      <line x1="150" y1="390" x2="90" y2="430" stroke="#64748B" stroke-width="8" stroke-linecap="round"/>
      <line x1="320" y1="390" x2="260" y2="430" stroke="#64748B" stroke-width="8" stroke-linecap="round"/>
      <line x1="470" y1="390" x2="410" y2="430" stroke="#64748B" stroke-width="8" stroke-linecap="round"/>
      <!-- Text badge on photo -->
      <rect x="20" y="20" width="270" height="40" rx="6" fill="#0F172A" opacity="0.75" />
      <text x="35" y="45" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="bold">FRENTE: ENCOFRADO Y FORMALETA</text>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${skyColors[weather]}" />
          <stop offset="100%" stop-color="#E2E8F0" />
        </linearGradient>
      </defs>
      <!-- Sky Background -->
      <rect width="640" height="480" fill="url(#skyGrad)" />
      ${sunElement}
      ${sceneSvg}
      <!-- Timestamp overlay at bottom right -->
      <rect x="420" y="440" width="200" height="28" rx="4" fill="#000000" opacity="0.7" />
      <text x="435" y="459" fill="#FBBF24" font-family="monospace" font-size="12" font-weight="bold">INTERVENTORÍA 2026</text>
    </svg>
  `;

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

/**
 * Pre-populated initial historical reports ordered chronologically
 */
export const INITIAL_SAMPLE_REPORTS: DailyReport[] = [
  {
    id: 'report-2026-10-26',
    reportNumber: 142,
    date: '2026-10-26',
    projectContractName: 'Consorcio Malecón León Caridi - Unidades Funcionales 3 y 4 / Contrato EDU-423-2017',
    elaboratedBy: 'Ing. Carlos Fernando Restrepo',
    projectName: 'CONSORCIO MALECÓN LEÓN CARIDI - UNIDADES FUNCIONALES 3 Y 4',
    contractNumber: 'CONTRATO EDU-423-2017',
    supervisorEntity: 'CONSORCIO INTERVENTORÍA VIAL 2026',
    contractorEntity: 'CONSTRUCTORA ANDINA DE INFRAESTRUCTURA S.A.S.',
    weather: 'Soleado',
    generalEquipmentAndTools:
      '1 Retroexcavadora sobre orugas Caterpillar 320D, 2 Camiones mixer de concreto 8m³, 1 Vibrador pendular para concreto a gasolina, 1 Estación total topográfica con trípode y bastón con prisma, Herramientas menores (palas carboneras, picas, carretillas buggi, boquilleras de aluminio, niveles de mano de burbuja y cizalla cortadora de varilla).',
    frentes: [
      {
        id: 'frente-1',
        frenteNumber: 1,
        activity: 'Excavación con retroexcavadora',
        description: 'Corte mecánico y remoción de material común con retroexcavadora sobre orugas para apertura y perfilado de zanjas.',
        photoUrl: createConstructionSampleImage('excavation', 'Soleado'),
        photoFileName: 'frente_1_excavacion.jpg',
        personnel: {
          residenteInterventoria: 1,
          residenteContratista: 1,
          siso: 1,
          obreros: 4,
          topografo: 1,
        },
        novedades: '', // En blanco por defecto
      },
      {
        id: 'frente-2',
        frenteNumber: 2,
        activity: 'Fundida de concreto en vía peatonal',
        description: 'Vaciado, nivelado y acabado de concreto hidráulico premezclado en franja de vía peatonal y andenes.',
        photoUrl: createConstructionSampleImage('concrete', 'Soleado'),
        photoFileName: 'frente_2_concreto_peatonal.jpg',
        personnel: {
          residenteInterventoria: 1,
          residenteContratista: 1,
          siso: 1,
          obreros: 8,
          topografo: 0,
        },
        novedades: '', // En blanco por defecto
      },
      {
        id: 'frente-3',
        frenteNumber: 3,
        activity: 'Armado e instalación de acero de refuerzo',
        description: 'Colocación, amarre sistemático y verificación de parrillas y canastas de acero corrugado de refuerzo.',
        photoUrl: createConstructionSampleImage('rebar', 'Soleado'),
        photoFileName: 'frente_3_acero.jpg',
        personnel: {
          residenteInterventoria: 1,
          residenteContratista: 1,
          siso: 1,
          obreros: 6,
          topografo: 0,
        },
        novedades: 'Se tomaron muestras para verificación de control de calidad de acero y amarres.',
      },
      {
        id: 'frente-4',
        frenteNumber: 4,
        activity: 'Nivelación topográfica y replanteo de ejes',
        description: 'Verificación de cotas de rasante, alineamiento geométrico de apoyos y control de verticalidad con estación total.',
        photoUrl: createConstructionSampleImage('topography', 'Soleado'),
        photoFileName: 'frente_4_topografia.jpg',
        personnel: {
          residenteInterventoria: 1,
          residenteContratista: 1,
          siso: 1,
          obreros: 2,
          topografo: 1,
        },
        novedades: '',
      },
    ],
    interventorSigner: {
      name: 'Ing. Carlos Fernando Restrepo',
      license: 'MP 05202-19842 CND',
      entity: 'Consorcio Interventoría Vial 2026',
      role: 'Director / Ingeniero Residente de Interventoría',
    },
    contractorSigner: {
      name: 'Ing. Mauricio Alberto Gómez Peña',
      license: 'MP 11204-74910 CND',
      entity: 'Constructora Andina de Infraestructura S.A.S.',
      role: 'Ingeniero Residente de Obra',
    },
    createdAt: '2026-10-26T17:30:00.000Z',
    updatedAt: '2026-10-26T17:30:00.000Z',
  },
  {
    id: 'report-2026-10-25',
    reportNumber: 141,
    date: '2026-10-25',
    projectContractName: 'Consorcio Malecón León Caridi - Unidades Funcionales 3 y 4 / Contrato EDU-423-2017',
    elaboratedBy: 'Ing. Carlos Fernando Restrepo',
    projectName: 'CONSORCIO MALECÓN LEÓN CARIDI - UNIDADES FUNCIONALES 3 Y 4',
    contractNumber: 'CONTRATO EDU-423-2017',
    supervisorEntity: 'CONSORCIO INTERVENTORÍA VIAL 2026',
    contractorEntity: 'CONSTRUCTORA ANDINA DE INFRAESTRUCTURA S.A.S.',
    weather: 'Nublado',
    generalEquipmentAndTools:
      '1 Camión mixer de concreto, 1 Bomba estacionaria de concreto hidráulico, 2 Formaletas metálicas modulares, Herramientas menores de encofrado (martillos de uña, puntales telescópicos, patas de cabra y niveles de mano).',
    frentes: [
      {
        id: 'frente-20261025-1',
        frenteNumber: 1,
        activity: 'Instalación y aplomado de encofrado metálico',
        description: 'Armado de paneles modulares para vástago de muro de contención en estribo norte y fijación de puntales.',
        photoUrl: createConstructionSampleImage('formwork', 'Nublado'),
        photoFileName: 'frente_1_encofrado.jpg',
        personnel: {
          residenteInterventoria: 1,
          residenteContratista: 1,
          siso: 1,
          obreros: 5,
          topografo: 0,
        },
        novedades: '',
      },
      {
        id: 'frente-20261025-2',
        frenteNumber: 2,
        activity: 'Colocación de tubería y drenajes subsuperficiales',
        description: 'Instalación de tubería perforada de drenaje y capa de geotextil filtrante no tejido tras el muro.',
        photoUrl: createConstructionSampleImage('excavation', 'Nublado'),
        photoFileName: 'frente_2_drenajes.jpg',
        personnel: {
          residenteInterventoria: 1,
          residenteContratista: 1,
          siso: 1,
          obreros: 4,
          topografo: 1,
        },
        novedades: '',
      },
    ],
    interventorSigner: {
      name: 'Ing. Carlos Fernando Restrepo',
      license: 'MP 05202-19842 CND',
      entity: 'Consorcio Interventoría Vial 2026',
      role: 'Director / Ingeniero Residente de Interventoría',
    },
    contractorSigner: {
      name: 'Ing. Mauricio Alberto Gómez Peña',
      license: 'MP 11204-74910 CND',
      entity: 'Constructora Andina de Infraestructura S.A.S.',
      role: 'Ingeniero Residente de Obra',
    },
    createdAt: '2026-10-25T18:00:00.000Z',
    updatedAt: '2026-10-25T18:00:00.000Z',
  },
  {
    id: 'report-2026-10-24',
    reportNumber: 140,
    date: '2026-10-24',
    projectContractName: 'Consorcio Malecón León Caridi - Unidades Funcionales 3 y 4 / Contrato EDU-423-2017',
    elaboratedBy: 'Ing. Carlos Fernando Restrepo',
    projectName: 'CONSORCIO MALECÓN LEÓN CARIDI - UNIDADES FUNCIONALES 3 Y 4',
    contractNumber: 'CONTRATO EDU-423-2017',
    supervisorEntity: 'CONSORCIO INTERVENTORÍA VIAL 2026',
    contractorEntity: 'CONSTRUCTORA ANDINA DE INFRAESTRUCTURA S.A.S.',
    weather: 'Lluvioso',
    generalEquipmentAndTools:
      '2 Electrobombas sumergibles para achique de lodos y aguas lluvias de 3 pulgadas, 1 Motobomba a diésel, 1 Retroexcavadora sobre orugas, Herramientas menores (mangueras de succión, palas y canaletas de desagüe).',
    frentes: [
      {
        id: 'frente-20261024-1',
        frenteNumber: 1,
        activity: 'Evacuación de aguas lluvias y achique de zanjas',
        description: 'Bombeo continuo de aguas de escorrentía acumuladas en el foso de cimentación tras fuerte precipitación matutina.',
        photoUrl: createConstructionSampleImage('excavation', 'Lluvioso'),
        photoFileName: 'frente_1_achique.jpg',
        personnel: {
          residenteInterventoria: 1,
          residenteContratista: 1,
          siso: 1,
          obreros: 3,
          topografo: 0,
        },
        novedades: 'Jornada interrumpida durante 2 horas por fuerte precipitación pluvial. Se reanudaron labores tras achique de foso.',
      },
    ],
    interventorSigner: {
      name: 'Ing. Carlos Fernando Restrepo',
      license: 'MP 05202-19842 CND',
      entity: 'Consorcio Interventoría Vial 2026',
      role: 'Director / Ingeniero Residente de Interventoría',
    },
    contractorSigner: {
      name: 'Ing. Mauricio Alberto Gómez Peña',
      license: 'MP 11204-74910 CND',
      entity: 'Constructora Andina de Infraestructura S.A.S.',
      role: 'Ingeniero Residente de Obra',
    },
    createdAt: '2026-10-24T17:15:00.000Z',
    updatedAt: '2026-10-24T17:15:00.000Z',
  },
];
