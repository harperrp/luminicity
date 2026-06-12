import type { CityHall, Complaint, Pole, User } from '@/types';
import type { CityHallWithStats } from '@/data/mockData';
import type { ModuleType } from '@/types/modules';

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : 'Falha ao comunicar com o servidor';
    throw new Error(message);
  }

  return payload as T;
}

export function parseDate(value: unknown): Date {
  if (!value) return new Date();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function normalizeUser(raw: any): User {
  return {
    ...raw,
    id: String(raw.id),
    cityHallId: raw.cityHallId === null || raw.cityHallId === undefined ? undefined : String(raw.cityHallId),
    createdAt: parseDate(raw.createdAt),
  };
}

export function normalizeCityHall(raw: any): CityHallWithStats {
  return {
    ...(raw as CityHall),
    id: String(raw.id),
    planId: raw.planId ?? 'STARTER',
    poleLimit: Number(raw.poleLimit ?? 0),
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    status: raw.status ?? 'ATIVO',
    usersCount: Number(raw.usersCount ?? 0),
    polesCount: Number(raw.polesCount ?? 0),
    createdAt: parseDate(raw.createdAt),
  };
}

export function normalizePole(raw: any): Pole {
  return {
    id: String(raw.id ?? raw.poleCode ?? ''),
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    status: raw.status === 'QUEIMADO' ? 'QUEIMADO' : 'FUNCIONANDO',
    observations: raw.observations ?? undefined,
    cityHallId: String(raw.cityHallId ?? ''),
    neighborhood: raw.neighborhood ?? undefined,
    address: raw.address ?? undefined,
    createdAt: parseDate(raw.createdAt),
    updatedAt: parseDate(raw.updatedAt),
  };
}

export function normalizeComplaint(raw: any): Complaint {
  return {
    id: String(raw.id),
    poleId: raw.poleId ? String(raw.poleId) : undefined,
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    description: raw.description ?? '',
    photoUrl: raw.photoUrl ?? undefined,
    status: raw.status,
    rejectionReason: raw.rejectionReason ?? undefined,
    secretaryObservations: raw.secretaryObservations ?? undefined,
    citizenCpf: raw.citizenCpf ?? '',
    citizenName: raw.citizenName ?? '',
    citizenPhone: raw.citizenPhone ?? undefined,
    cityHallId: String(raw.cityHallId ?? ''),
    createdAt: parseDate(raw.createdAt),
    updatedAt: parseDate(raw.updatedAt),
  };
}

export function normalizeActiveModules(raw: any): Record<string, ModuleType[]> {
  const activeModules = raw?.activeModules ?? {};
  return Object.fromEntries(
    Object.entries(activeModules).map(([cityHallId, modules]) => [
      String(cityHallId),
      Array.isArray(modules) ? (modules as ModuleType[]) : [],
    ]),
  );
}
