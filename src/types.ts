export interface PersonnelBreakdown {
  residenteInterventoria: number;
  residenteContratista: number;
  siso: number;
  obreros: number;
  topografo: number;
}

export interface FrenteItem {
  id: string;
  frenteNumber: number; // 1, 2, 3...
  activity: string; // Concreta, técnica, sin cotas ni dimensiones ni planos
  description: string; // Breve y puntual
  photoUrl: string; // Base64 data URL or image path
  photoFileName?: string;
  personnel: PersonnelBreakdown;
  novedades: string; // En blanco por defecto, 100% editable
}

export type WeatherType = 'Soleado' | 'Nublado' | 'Lluvioso';

export interface SignerInfo {
  name: string;
  license: string; // Matrícula Profesional
  entity: string; // Empresa o Consorcio
  role: string;
}

export interface DailyReport {
  id: string;
  reportNumber: number;
  date: string; // YYYY-MM-DD
  projectContractName: string; // "Nombre del Proyecto / Contrato" (e.g., "Consorcio Malecón León Caridi - Unidades Funcionales 3 y 4 / Contrato EDU-423-2017")
  elaboratedBy: string; // "Elaborado por / Interventor" (Nombre de quien elabora el reporte)
  projectName: string;
  contractNumber: string;
  supervisorEntity: string; // Empresa / Consorcio Interventor
  contractorEntity: string; // Empresa Contratista
  weather: WeatherType;
  generalEquipmentAndTools: string; // Resumen general consolidado para todo el informe
  frentes: FrenteItem[];
  interventorSigner: SignerInfo;
  contractorSigner: SignerInfo;
  createdAt: string;
  updatedAt: string;
}
