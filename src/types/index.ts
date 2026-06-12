import type { ModuleType } from './modules';

export type UserRole =
  | 'ADMIN'
  | 'CITY_HALL_ADMIN'
  | 'SECRETARY'
  | 'TECHNICAL'
  | 'FIELD_LIGHTING'
  | 'FIELD_TREE'
  | 'FIELD_PAVING'
  | 'FIELD_SANITATION'
  | 'FIELD_CLEANING'
  | 'FIELD_SIGNALING'
  | 'CUSTOM'
  | 'CITIZEN';

export type PoleStatus = 'FUNCIONANDO' | 'QUEIMADO';

export type ComplaintStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export type SubscriptionPlanId = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: UserPermissions;
  cityHallId?: string;
  cpf?: string;
  createdAt: Date;
}

export interface UserPermissions {
  modules: ModuleType[];
  canApproveComplaints: boolean;
  canManageMaintenance: boolean;
  canManageUsers: boolean;
  canManageCityHalls: boolean;
  canViewReports: boolean;
  fieldOnly: boolean;
}

export interface CityHall {
  id: string;
  name: string;
  city: string;
  state: string;
  planId: SubscriptionPlanId;
  poleLimit: number;
  latitude: number;
  longitude: number;
  createdAt: Date;
}

export interface Pole {
  id: string;
  databaseId?: string;
  latitude: number;
  longitude: number;
  status: PoleStatus;
  observations?: string;
  cityHallId: string;
  neighborhood?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoleHistory {
  id: string;
  poleId: string;
  previousStatus: PoleStatus;
  newStatus: PoleStatus;
  changedBy: string;
  changedByName: string;
  observations?: string;
  createdAt: Date;
}

export interface Complaint {
  id: string;
  poleId?: string;
  latitude: number;
  longitude: number;
  description: string;
  photoUrl?: string;
  status: ComplaintStatus;
  rejectionReason?: string;
  secretaryObservations?: string;
  citizenCpf: string;
  citizenName: string;
  citizenPhone?: string;
  cityHallId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalPoles: number;
  workingPoles: number;
  brokenPoles: number;
  pendingComplaints: number;
  approvedComplaints: number;
  rejectedComplaints: number;
  averageResponseTime: number;
  
}

export const REJECTION_REASONS = [
  'Poste não identificado no local',
  'Denúncia duplicada',
  'Poste já em manutenção',
  'Localização incorreta',
  'Foto não corresponde ao problema',
  'Poste não pertence ao município',
  'Outro motivo',
] as const;

export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const;
