import { Pole, PoleStatus, Complaint, ComplaintStatus, User, UserRole, CityHall } from '@/types';

// ========================
// POLE HISTORY
// ========================
export interface PoleHistoryRecord {
  id: string;
  poleId: string;
  dateQueimado: Date;
  dateConsertado: Date | null;
  tempoResolucaoDias: number | null;
  tecnicoId: string | null;
  tecnicoName: string | null;
  createdAt: Date;
}

export interface RecurrenceAlert {
  poleId: string;
  level: 'BAIXO' | 'MEDIO' | 'CRITICO';
  totalOcorrencias: number;
  ocorrencias30dias: number;
  ocorrencias90dias: number;
}

// ========================
// MOCK POLES
// ========================
export const MOCK_POLES: Pole[] = [
  { id: 'P-001', latitude: -15.3989, longitude: -42.3091, status: 'QUEIMADO', neighborhood: 'Centro', address: 'Av. Principal, 200', cityHallId: '1', createdAt: new Date('2023-01-15'), updatedAt: new Date('2024-01-15') },
  { id: 'P-002', latitude: -15.3994, longitude: -42.3102, status: 'FUNCIONANDO', neighborhood: 'Centro', address: 'Rua Principal, 210', cityHallId: '1', createdAt: new Date('2023-02-20'), updatedAt: new Date('2024-01-10') },
  { id: 'P-003', latitude: -15.3976, longitude: -42.3088, status: 'FUNCIONANDO', neighborhood: 'Nova Esperança', address: 'Rua das Palmeiras, 55', cityHallId: '1', createdAt: new Date('2023-03-10'), updatedAt: new Date('2024-01-08') },
  { id: 'P-004', latitude: -15.4002, longitude: -42.3113, status: 'QUEIMADO', neighborhood: 'Vila Nova', address: 'Rua Nova, 75', cityHallId: '1', createdAt: new Date('2023-04-05'), updatedAt: new Date('2024-01-14') },
  { id: 'P-005', latitude: -15.3968, longitude: -42.3079, status: 'FUNCIONANDO', neighborhood: 'Jardim das Acácias', address: 'Rua das Flores, 12', cityHallId: '1', createdAt: new Date('2023-05-12'), updatedAt: new Date('2024-01-12') },
  { id: 'P-006', latitude: -15.4011, longitude: -42.3121, status: 'FUNCIONANDO', neighborhood: 'Vila Nova', address: 'Rua do Campo, 89', cityHallId: '1', createdAt: new Date('2023-06-18'), updatedAt: new Date('2024-01-09') },
  { id: 'P-007', latitude: -15.4020, longitude: -42.3098, status: 'QUEIMADO', neighborhood: 'Bela Vista', address: 'Rua Bela Vista, 300', cityHallId: '1', createdAt: new Date('2023-07-22'), updatedAt: new Date('2024-01-16') },
  { id: 'P-008', latitude: -15.3972, longitude: -42.3110, status: 'FUNCIONANDO', neighborhood: 'Alto da Serra', address: 'Travessa da Serra, 40', cityHallId: '1', createdAt: new Date('2023-08-30'), updatedAt: new Date('2024-01-11') },
];

// ========================
// MOCK POLE HISTORY
// ========================
export const MOCK_POLE_HISTORY: PoleHistoryRecord[] = [
  // P-001: 5 ocorrências
  { id: 'h1', poleId: 'P-001', dateQueimado: new Date('2023-03-10'), dateConsertado: new Date('2023-03-15'), tempoResolucaoDias: 5, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-03-10') },
  { id: 'h2', poleId: 'P-001', dateQueimado: new Date('2023-06-20'), dateConsertado: new Date('2023-06-22'), tempoResolucaoDias: 2, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-06-20') },
  { id: 'h3', poleId: 'P-001', dateQueimado: new Date('2023-09-05'), dateConsertado: new Date('2023-09-08'), tempoResolucaoDias: 3, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-09-05') },
  { id: 'h4', poleId: 'P-001', dateQueimado: new Date('2024-01-02'), dateConsertado: new Date('2024-01-04'), tempoResolucaoDias: 2, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2024-01-02') },
  { id: 'h5', poleId: 'P-001', dateQueimado: new Date('2024-01-15'), dateConsertado: null, tempoResolucaoDias: null, tecnicoId: null, tecnicoName: null, createdAt: new Date('2024-01-15') },

  // P-004: 3 ocorrências
  { id: 'h6', poleId: 'P-004', dateQueimado: new Date('2023-08-12'), dateConsertado: new Date('2023-08-18'), tempoResolucaoDias: 6, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-08-12') },
  { id: 'h7', poleId: 'P-004', dateQueimado: new Date('2023-11-25'), dateConsertado: new Date('2023-11-28'), tempoResolucaoDias: 3, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-11-25') },
  { id: 'h8', poleId: 'P-004', dateQueimado: new Date('2024-01-14'), dateConsertado: null, tempoResolucaoDias: null, tecnicoId: null, tecnicoName: null, createdAt: new Date('2024-01-14') },

  // P-007: 6 ocorrências (CRITICO)
  { id: 'h9', poleId: 'P-007', dateQueimado: new Date('2023-02-01'), dateConsertado: new Date('2023-02-03'), tempoResolucaoDias: 2, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-02-01') },
  { id: 'h10', poleId: 'P-007', dateQueimado: new Date('2023-04-15'), dateConsertado: new Date('2023-04-19'), tempoResolucaoDias: 4, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-04-15') },
  { id: 'h11', poleId: 'P-007', dateQueimado: new Date('2023-07-10'), dateConsertado: new Date('2023-07-12'), tempoResolucaoDias: 2, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-07-10') },
  { id: 'h12', poleId: 'P-007', dateQueimado: new Date('2023-09-28'), dateConsertado: new Date('2023-10-01'), tempoResolucaoDias: 3, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-09-28') },
  { id: 'h13', poleId: 'P-007', dateQueimado: new Date('2023-12-15'), dateConsertado: new Date('2023-12-18'), tempoResolucaoDias: 3, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-12-15') },
  { id: 'h14', poleId: 'P-007', dateQueimado: new Date('2024-01-16'), dateConsertado: null, tempoResolucaoDias: null, tecnicoId: null, tecnicoName: null, createdAt: new Date('2024-01-16') },

  // P-002: 1 ocorrência
  { id: 'h15', poleId: 'P-002', dateQueimado: new Date('2023-10-05'), dateConsertado: new Date('2023-10-06'), tempoResolucaoDias: 1, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-10-05') },

  // P-005: 2 ocorrências
  { id: 'h16', poleId: 'P-005', dateQueimado: new Date('2023-05-20'), dateConsertado: new Date('2023-05-23'), tempoResolucaoDias: 3, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-05-20') },
  { id: 'h17', poleId: 'P-005', dateQueimado: new Date('2023-12-01'), dateConsertado: new Date('2023-12-03'), tempoResolucaoDias: 2, tecnicoId: '4', tecnicoName: 'Carlos Oliveira', createdAt: new Date('2023-12-01') },
];

// ========================
// HELPER FUNCTIONS
// ========================
export function getPoleHistory(poleId: string): PoleHistoryRecord[] {
  return MOCK_POLE_HISTORY
    .filter(h => h.poleId === poleId)
    .sort((a, b) => b.dateQueimado.getTime() - a.dateQueimado.getTime());
}

export function getPoleStats(poleId: string) {
  const history = getPoleHistory(poleId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const total = history.length;
  const last30 = history.filter(h => h.dateQueimado >= thirtyDaysAgo).length;
  const last90 = history.filter(h => h.dateQueimado >= ninetyDaysAgo).length;
  const resolved = history.filter(h => h.dateConsertado !== null);
  const avgResolution = resolved.length > 0
    ? resolved.reduce((acc, h) => acc + (h.tempoResolucaoDias || 0), 0) / resolved.length
    : 0;

  const openRecord = history.find(h => h.dateConsertado === null);

  return { total, last30, last90, avgResolution, openRecord, history };
}

export function getRecurrenceLevel(poleId: string): RecurrenceAlert | null {
  const stats = getPoleStats(poleId);
  if (stats.last30 >= 3 || stats.total >= 6) {
    return { poleId, level: 'CRITICO', totalOcorrencias: stats.total, ocorrencias30dias: stats.last30, ocorrencias90dias: stats.last90 };
  }
  if (stats.last30 >= 2 || stats.total >= 4) {
    return { poleId, level: 'MEDIO', totalOcorrencias: stats.total, ocorrencias30dias: stats.last30, ocorrencias90dias: stats.last90 };
  }
  if (stats.total >= 2) {
    return { poleId, level: 'BAIXO', totalOcorrencias: stats.total, ocorrencias30dias: stats.last30, ocorrencias90dias: stats.last90 };
  }
  return null;
}

export function formatDateBR(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function daysSince(date: Date) {
  return Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// ========================
// MOCK USERS
// ========================
export const MOCK_USERS_LIST: User[] = [
  { id: '1', email: 'joao.silva@cidade.gov.br', name: 'João Silva', role: 'CITY_HALL_ADMIN', cityHallId: '1', createdAt: new Date('2023-01-15') },
  { id: '2', email: 'maria.santos@cidade.gov.br', name: 'Maria Santos', role: 'SECRETARY', cityHallId: '1', createdAt: new Date('2023-03-20') },
  { id: '3', email: 'carlos.oliveira@cidade.gov.br', name: 'Carlos Oliveira', role: 'TECHNICAL', cityHallId: '1', createdAt: new Date('2023-05-10') },
  { id: '4', email: 'ana.costa@cidade.gov.br', name: 'Ana Costa', role: 'TECHNICAL', cityHallId: '1', createdAt: new Date('2023-07-05') },
  { id: '5', email: 'pedro.lima@cidade.gov.br', name: 'Pedro Lima', role: 'SECRETARY', cityHallId: '1', createdAt: new Date('2023-09-12') },
];

// ========================
// MOCK CITY HALLS
// ========================
export interface CityHallWithStats extends CityHall {
  cnpj?: string;
  status: 'ATIVO' | 'INATIVO';
  usersCount: number;
  polesCount: number;
}

export const MOCK_CITY_HALLS_LIST: CityHallWithStats[] = [
  { id: '1', name: 'Prefeitura de Vargem Grande do Rio Pardo', city: 'Vargem Grande do Rio Pardo', state: 'MG', planId: 'PRO', poleLimit: 2000, latitude: -15.3983, longitude: -42.3097, cnpj: '12.345.678/0001-01', status: 'ATIVO', createdAt: new Date('2023-01-10'), usersCount: 5, polesCount: 8 },
  { id: '2', name: 'Prefeitura de Campinas', city: 'Campinas', state: 'SP', planId: 'PRO', poleLimit: 2000, latitude: -22.9099, longitude: -47.0626, cnpj: '23.456.789/0001-02', status: 'ATIVO', createdAt: new Date('2023-03-15'), usersCount: 8, polesCount: 450 },
  { id: '3', name: 'Prefeitura de Santos', city: 'Santos', state: 'SP', planId: 'STARTER', poleLimit: 500, latitude: -23.9608, longitude: -46.3336, cnpj: '34.567.890/0001-03', status: 'ATIVO', createdAt: new Date('2023-05-20'), usersCount: 6, polesCount: 320 },
  { id: '4', name: 'Prefeitura de Sorocaba', city: 'Sorocaba', state: 'SP', planId: 'STARTER', poleLimit: 500, latitude: -23.5015, longitude: -47.4526, cnpj: '45.678.901/0001-04', status: 'INATIVO', createdAt: new Date('2023-07-12'), usersCount: 5, polesCount: 280 },
];
