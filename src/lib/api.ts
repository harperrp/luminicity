import type { CityHall, Complaint, Pole, User, UserPermissions, UserRole } from '@/types';
import type { ModuleType, Occurrence, OccurrenceStatus } from '@/types/modules';

export interface CityHallWithStats extends CityHall {
  cnpj?: string;
  status: 'ATIVO' | 'INATIVO';
  usersCount: number;
  polesCount: number;
}

export interface BannedCpfEntry {
  id?: string;
  cityHallId?: string;
  cpf: string;
  name: string;
  reason?: string;
  bannedAt: Date;
  complaintsCount: number;
}

export interface MaintenanceOrder {
  id: string;
  cityHallId: string;
  moduleId: ModuleType;
  poleId?: string;
  complaintId?: string;
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'RESOLVIDA';
  priority: 'alta' | 'media' | 'baixa';
  address?: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiEnvelope {
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
}

type ApiRecord = Record<string, unknown>;

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function endpoint(path: string, params?: Record<string, string | number | boolean | null | undefined>) {
  const cleanPath = path.endsWith('.php') ? path : `${path}.php`;
  const url = new URL(`${API_BASE_URL}/${cleanPath}`, window.location.origin);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function request<T>(path: string, options: RequestInit = {}, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
  const response = await fetch(endpoint(path, params), {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as ApiEnvelope;
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'Falha ao comunicar com a API');
  }

  return data as T;
}

const body = (data: unknown) => JSON.stringify(data);
const asDate = (value: unknown) => (value ? new Date(String(value)) : new Date());

function mapUser(raw: ApiRecord): User {
  return {
    id: String(raw.id),
    email: String(raw.email ?? ''),
    name: String(raw.name ?? ''),
    role: raw.role as User['role'],
    permissions: raw.permissions as UserPermissions | undefined,
    cityHallId: raw.cityHallId ? String(raw.cityHallId) : undefined,
    cpf: raw.cpf ? String(raw.cpf) : undefined,
    createdAt: asDate(raw.createdAt),
  };
}

function mapCityHall(raw: ApiRecord): CityHallWithStats {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    city: String(raw.city ?? ''),
    state: String(raw.state ?? ''),
    cnpj: raw.cnpj ? String(raw.cnpj) : undefined,
    status: (raw.status as CityHallWithStats['status']) ?? 'ATIVO',
    planId: raw.planId as CityHallWithStats['planId'],
    poleLimit: Number(raw.poleLimit ?? 500),
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    usersCount: Number(raw.usersCount ?? 0),
    polesCount: Number(raw.polesCount ?? 0),
    createdAt: asDate(raw.createdAt),
  };
}

function mapPole(raw: ApiRecord): Pole {
  return {
    id: String(raw.id),
    databaseId: raw.databaseId ? String(raw.databaseId) : undefined,
    cityHallId: String(raw.cityHallId),
    status: raw.status as Pole['status'],
    neighborhood: raw.neighborhood ? String(raw.neighborhood) : undefined,
    address: raw.address ? String(raw.address) : undefined,
    observations: raw.observations ? String(raw.observations) : undefined,
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    createdAt: asDate(raw.createdAt),
    updatedAt: asDate(raw.updatedAt),
  };
}

function mapComplaint(raw: ApiRecord): Complaint & { moduleId?: ModuleType; occurrenceType?: string } {
  return {
    id: String(raw.id),
    poleId: raw.poleId ? String(raw.poleId) : undefined,
    moduleId: raw.moduleId as ModuleType | undefined,
    cityHallId: String(raw.cityHallId),
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    description: String(raw.description ?? ''),
    photoUrl: raw.photoUrl ? String(raw.photoUrl) : undefined,
    status: raw.status as Complaint['status'],
    occurrenceType: raw.occurrenceType ? String(raw.occurrenceType) : undefined,
    rejectionReason: raw.rejectionReason ? String(raw.rejectionReason) : undefined,
    secretaryObservations: raw.secretaryObservations ? String(raw.secretaryObservations) : undefined,
    citizenCpf: String(raw.citizenCpf ?? ''),
    citizenName: String(raw.citizenName ?? ''),
    citizenPhone: raw.citizenPhone ? String(raw.citizenPhone) : undefined,
    createdAt: asDate(raw.createdAt),
    updatedAt: asDate(raw.updatedAt),
  };
}

function complaintToOccurrence(raw: Complaint & { moduleId?: ModuleType; occurrenceType?: string }): Occurrence {
  const moduleType = raw.moduleId ?? 'ILUMINACAO';
  const statusMap: Record<string, OccurrenceStatus> = {
    PENDENTE: 'ABERTA',
    APROVADA: 'EM_ANDAMENTO',
    REJEITADA: 'RESOLVIDA',
  };

  return {
    id: raw.id,
    moduleType,
    status: statusMap[raw.status] ?? 'ABERTA',
    description: raw.description,
    address: raw.occurrenceType ?? raw.poleId ?? 'Local informado pelo cidadao',
    latitude: raw.latitude,
    longitude: raw.longitude,
    priority: 'media',
    citizenName: raw.citizenName,
    citizenCpf: raw.citizenCpf,
    citizenPhone: raw.citizenPhone,
    cityHallId: raw.cityHallId,
    photoUrl: raw.photoUrl,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function mapMaintenanceOrder(raw: ApiRecord): MaintenanceOrder {
  return {
    id: String(raw.id),
    cityHallId: String(raw.cityHallId),
    moduleId: raw.moduleId as ModuleType,
    poleId: raw.poleId ? String(raw.poleId) : undefined,
    complaintId: raw.complaintId ? String(raw.complaintId) : undefined,
    status: raw.status as MaintenanceOrder['status'],
    priority: raw.priority as MaintenanceOrder['priority'],
    address: raw.address ? String(raw.address) : undefined,
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    description: String(raw.description ?? ''),
    createdAt: asDate(raw.createdAt),
    updatedAt: asDate(raw.updatedAt),
  };
}

export const api = {
  async me() {
    const data = await request<{ authenticated: boolean; user: ApiRecord | null }>('auth');
    return data.authenticated && data.user ? mapUser(data.user) : null;
  },

  async login(email: string, password: string) {
    const data = await request<{ ok: true; user: ApiRecord }>('auth', {
      method: 'POST',
      body: body({ email, password }),
    });
    return mapUser(data.user);
  },

  async logout() {
    await request('auth', { method: 'DELETE' });
  },

  async getCityHalls() {
    const data = await request<{ cityHalls: ApiRecord[] }>('city-halls');
    return data.cityHalls.map(mapCityHall);
  },

  async createCityHall(input: Partial<CityHallWithStats> & { modules?: ModuleType[] }) {
    const data = await request<{ cityHall: ApiRecord }>('city-halls', {
      method: 'POST',
      body: body(input),
    });
    return mapCityHall(data.cityHall);
  },

  async updateCityHall(id: string, input: Partial<CityHallWithStats>) {
    const data = await request<{ cityHall: ApiRecord }>('city-halls', {
      method: 'PUT',
      body: body(input),
    }, { id });
    return mapCityHall(data.cityHall);
  },

  async getActiveModules() {
    const data = await request<{ activeModules: Record<string, ModuleType[]> }>('modules');
    return data.activeModules;
  },

  async setActiveModules(cityHallId: string, modules: ModuleType[]) {
    await request('modules', {
      method: 'PUT',
      body: body({ cityHallId, modules }),
    });
  },

  async getPoles(cityHallId?: string) {
    const data = await request<{ poles: ApiRecord[] }>('poles', {}, { cityHallId });
    return data.poles.map(mapPole);
  },

  async savePole(input: Pole) {
    const data = await request<{ poles: ApiRecord[] }>('poles', {
      method: 'POST',
      body: body(input),
    });
    return data.poles.map(mapPole)[0];
  },

  async importPoles(poles: Pole[]) {
    const data = await request<{ poles: ApiRecord[] }>('poles', {
      method: 'POST',
      body: body({ poles }),
    });
    return data.poles.map(mapPole);
  },

  async updatePoleStatus(id: string, cityHallId: string, status: Pole['status']) {
    const data = await request<{ pole: ApiRecord }>('poles', {
      method: 'PATCH',
      body: body({ id, cityHallId, status }),
    }, { id, cityHallId });
    return mapPole(data.pole);
  },

  async deletePole(id: string, cityHallId: string) {
    await request('poles', { method: 'DELETE' }, { id, cityHallId });
  },

  async getComplaints(filters: { cityHallId?: string; moduleId?: ModuleType; status?: string } = {}) {
    const data = await request<{ complaints: ApiRecord[] }>('complaints', {}, filters);
    return data.complaints.map(mapComplaint);
  },

  async createComplaint(input: Record<string, unknown>) {
    const data = await request<{ complaint: ApiRecord }>('complaints', {
      method: 'POST',
      body: body(input),
    });
    return mapComplaint(data.complaint);
  },

  async approveComplaint(id: string, observations?: string) {
    const data = await request<{ complaint: ApiRecord }>('complaints', {
      method: 'PATCH',
      body: body({ action: 'approve', observations }),
    }, { id, action: 'approve' });
    return mapComplaint(data.complaint);
  },

  async rejectComplaint(id: string, rejectionReason: string, observations?: string) {
    const data = await request<{ complaint: ApiRecord }>('complaints', {
      method: 'PATCH',
      body: body({ action: 'reject', rejectionReason, observations }),
    }, { id, action: 'reject' });
    return mapComplaint(data.complaint);
  },

  async getOccurrences(cityHallId?: string, moduleId?: ModuleType) {
    const complaints = await this.getComplaints({ cityHallId, moduleId });
    return complaints.map(complaintToOccurrence);
  },

  async updateOccurrenceStatus(id: string, status: OccurrenceStatus, resolution?: string) {
    if (status === 'RESOLVIDA') {
      return this.approveComplaint(id, resolution);
    }
    return this.approveComplaint(id, resolution);
  },

  async getUsers() {
    const data = await request<{ users: ApiRecord[] }>('users');
    return data.users.map(mapUser);
  },

  async createUser(input: { name: string; email: string; password: string; role: UserRole; cityHallId?: string; permissions: UserPermissions }) {
    const data = await request<{ user: ApiRecord }>('users', {
      method: 'POST',
      body: body(input),
    });
    return mapUser(data.user);
  },

  async updateUser(id: string, input: Partial<User> & { password?: string; permissions?: UserPermissions }) {
    const data = await request<{ user: ApiRecord }>('users', {
      method: 'PUT',
      body: body(input),
    }, { id });
    return mapUser(data.user);
  },

  async deleteUser(id: string) {
    await request('users', { method: 'DELETE' }, { id });
  },

  async getBannedCpfs(cityHallId?: string) {
    const data = await request<{ bannedCpfs: ApiRecord[] }>('banned-cpfs', {}, { cityHallId });
    return data.bannedCpfs.map((raw) => ({
      ...raw,
      bannedAt: asDate(raw.bannedAt),
      complaintsCount: Number(raw.complaintsCount ?? 1),
    })) as BannedCpfEntry[];
  },

  async banCpf(cityHallId: string, cpf: string, name: string, reason?: string) {
    await request('banned-cpfs', {
      method: 'POST',
      body: body({ cityHallId, cpf, name, reason }),
    });
  },

  async unbanCpf(cityHallId: string, cpf: string) {
    await request('banned-cpfs', { method: 'DELETE' }, { cityHallId, cpf });
  },

  async getMaintenanceOrders(cityHallId?: string, moduleId?: ModuleType) {
    const data = await request<{ maintenanceOrders: ApiRecord[] }>('maintenance', {}, { cityHallId, moduleId });
    return data.maintenanceOrders.map(mapMaintenanceOrder);
  },

  async completeMaintenanceOrder(id: string, resolution?: string) {
    await request('maintenance', {
      method: 'PATCH',
      body: body({ resolution }),
    }, { id });
  },
};
